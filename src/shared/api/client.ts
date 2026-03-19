const API_URL = import.meta.env.VITE_API_URL ?? '';

export const AUTH_BASE_URL = API_URL;
export const PROFILE_BASE_URL = `${API_URL}/api/v1/profile`;

// Один промис на всех, чтобы не делать несколько параллельных рефрешей
let _refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('no refresh token');

    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      throw new Error('refresh failed');
    }

    const data = await res.json() as { access_token: string; refresh_token: string };
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data.access_token;
  })().finally(() => { _refreshPromise = null; });

  return _refreshPromise;
}

/** Decode user ID from stored JWT (claim "uid") without a library. */
export function getUserIdFromJwt(): string | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const b64 = token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64)) as Record<string, unknown>;
    return typeof payload['uid'] === 'string' ? payload['uid'] : null;
  } catch {
    return null;
  }
}

export interface ApiError {
  status: number;
  message: string;
}

async function request<T>(
  url: string,
  options: RequestInit & { skipAuth?: boolean; _retry?: boolean } = {}
): Promise<T> {
  const { skipAuth = false, _retry = false, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = localStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...init, headers });

  if (response.status === 401 && !skipAuth && !_retry) {
    try {
      const newToken = await refreshAccessToken();
      return request<T>(url, { ...options, _retry: true,
        headers: { ...(init.headers as Record<string, string>), Authorization: `Bearer ${newToken}` },
      });
    } catch {
      throw { status: 401, message: 'Session expired' } as ApiError;
    }
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    let message = 'Unknown error';
    if (contentType.includes('application/json')) {
      const body = await response.json().catch(() => ({ error: 'Unknown error' })) as Record<string, unknown>;
      message = typeof body['error'] === 'string' ? body['error'] : 'Unknown error';
    } else {
      message = (await response.text().catch(() => 'Unknown error')).trim() || 'Unknown error';
    }
    throw { status: response.status, message } as ApiError;
  }

  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

export const authHttp = {
  post: <T>(path: string, body?: unknown, opts?: { skipAuth?: boolean }) =>
    request<T>(`${AUTH_BASE_URL}${path}`, {
      method: 'POST',
      body: JSON.stringify(body),
      skipAuth: opts?.skipAuth,
    }),
  get: <T>(path: string) =>
    request<T>(`${AUTH_BASE_URL}${path}`, { method: 'GET' }),
  delete: <T>(path: string) =>
    request<T>(`${AUTH_BASE_URL}${path}`, { method: 'DELETE' }),
};

/**
 * ProfileService authenticates via X-User-ID (set by AuthService gateway).
 * When calling ProfileService directly (bypassing gateway), we decode the
 * user ID from the stored JWT and pass it as X-User-ID.
 */
async function profileRequest<T>(
  url: string,
  options: RequestInit & { _retry?: boolean } = {}
): Promise<T> {
  const { _retry = false, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  const token = localStorage.getItem('access_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const userId = getUserIdFromJwt();
  if (userId) headers['X-User-ID'] = userId;

  const response = await fetch(url, { ...init, headers });

  if (response.status === 401 && !_retry) {
    try {
      await refreshAccessToken();
      return profileRequest<T>(url, { ...options, _retry: true });
    } catch {
      throw { status: 401, message: 'Session expired' } as ApiError;
    }
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    let message = 'Unknown error';
    if (contentType.includes('application/json')) {
      const body = await response.json().catch(() => ({ error: 'Unknown error' })) as Record<string, unknown>;
      message = typeof body['error'] === 'string' ? body['error'] : 'Unknown error';
    } else {
      message = (await response.text().catch(() => 'Unknown error')).trim() || 'Unknown error';
    }
    throw { status: response.status, message } as ApiError;
  }

  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

export const profileHttp = {
  get: <T>(path: string) =>
    profileRequest<T>(`${PROFILE_BASE_URL}${path}`, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    profileRequest<T>(`${PROFILE_BASE_URL}${path}`, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    profileRequest<T>(`${PROFILE_BASE_URL}${path}`, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    profileRequest<T>(`${PROFILE_BASE_URL}${path}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    profileRequest<T>(`${PROFILE_BASE_URL}${path}`, { method: 'DELETE' }),
};

export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  const headers: Record<string, string> = {};
  const userId = getUserIdFromJwt();
  if (userId) headers['X-User-ID'] = userId;

  const response = await fetch(`${PROFILE_BASE_URL}/me/avatar`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    let message = 'Upload failed';
    if (contentType.includes('application/json')) {
      const body = await response.json().catch(() => ({ error: 'Upload failed' })) as Record<string, unknown>;
      message = typeof body['error'] === 'string' ? body['error'] : 'Upload failed';
    } else {
      message = (await response.text().catch(() => 'Upload failed')).trim() || 'Upload failed';
    }
    throw { status: response.status, message } as ApiError;
  }

  return response.json() as Promise<{ avatar_url: string }>;
}

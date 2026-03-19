import { useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import type { Session } from '../types/auth';

/** Decode JWT payload into a plain object. */
function decodeJwtPayload(): Record<string, unknown> | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const b64 = token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Extract session id from JWT — checks `jti` then `sid` claims. */
function getSessionIdFromJwt(): string | null {
  const payload = decodeJwtPayload();
  if (!payload) return null;
  const id = payload['jti'] ?? payload['sid'];
  return typeof id === 'string' ? id : null;
}


/** Returns a human-readable label for a User-Agent string. */
export function parseUserAgent(ua: string): string {
  if (!ua) return 'Неизвестное устройство';

  let browser = 'Браузер';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
  else if (/YaBrowser/.test(ua)) browser = 'Яндекс.Браузер';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';

  let os = '';
  if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  return os ? `${browser} · ${os}` : browser;
}

export function useSessions(enabled: boolean) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const currentSessionId = getSessionIdFromJwt();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { sessions } = await authApi.getSessions();
      setSessions(sessions);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : 'Ошибка загрузки';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const revoke = useCallback(async (id: string) => {
    setRevoking(id);
    try {
      await authApi.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : 'Ошибка';
      setError(msg);
    } finally {
      setRevoking(null);
    }
  }, []);

  // Load once when enabled
  const [loaded, setLoaded] = useState(false);
  if (enabled && !loaded && !loading) {
    setLoaded(true);
    load();
  }

  return { sessions, loading, error, revoking, currentSessionId, revoke, reload: load };
}

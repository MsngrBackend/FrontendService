import { authHttp } from './client';
import type { TokenPair, Session, RegisterResponse } from '../types/auth';

export const authApi = {
  register: (email: string, password: string) =>
    authHttp.post<RegisterResponse>('/api/v1/auth/register', { email, password }, { skipAuth: true }),

  confirmEmail: (email: string, code: string) =>
    authHttp.post<{ message: string }>('/api/v1/auth/register/confirm', { email, code }, { skipAuth: true }),

  login: (email: string, password: string) =>
    authHttp.post<TokenPair>('/api/v1/auth/login', { email, password }, { skipAuth: true }),

  logout: (refresh_token: string) =>
    authHttp.post<{ message: string }>('/api/v1/auth/logout', { refresh_token }),

  refresh: (refresh_token: string) =>
    authHttp.post<TokenPair>('/api/v1/auth/refresh', { refresh_token }, { skipAuth: true }),

  getSessions: () =>
    authHttp.get<{ sessions: Session[] }>('/api/v1/auth/sessions'),

  revokeSession: (id: string) =>
    authHttp.delete<{ message: string }>(`/api/v1/auth/sessions/${id}`),
};

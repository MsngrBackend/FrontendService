import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';
import { profileApi } from '../api/profile';
import type { Profile } from '../types/profile';

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  profile: Profile | null;
  isAuthenticated: boolean;

  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
  setProfile: (profile: Profile) => void;
}

const authChannel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('minigram-auth-sync')
  : null;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      profile: null,
      isAuthenticated: false,

      setTokens: (access, refresh) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ accessToken: null, refreshToken: null, profile: null, isAuthenticated: false });
      },

      login: async (email, password) => {
        const tokens = await authApi.login(email, password);
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
        });
        authChannel?.postMessage({ type: 'login' });
        try {
          const profile = await profileApi.getMyProfile();
          set({ profile });
        } catch {
          // profile may not exist yet — not fatal
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch {
            // ignore
          }
        }
        get().clearAuth();
        authChannel?.postMessage({ type: 'logout' });
      },

      loadProfile: async () => {
        try {
          const profile = await profileApi.getMyProfile();
          set({ profile });
        } catch {
          // ignore
        }
      },

      setProfile: (profile) => set({ profile }),
    }),
    {
      name: 'minigram-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

authChannel?.addEventListener('message', (event: MessageEvent) => {
  const { type } = event.data as { type: string };
  if (type === 'logout') {
    useAuthStore.getState().clearAuth();
    window.location.reload();
  }
});

window.addEventListener('auth:session-expired', () => {
  useAuthStore.getState().clearAuth();
});

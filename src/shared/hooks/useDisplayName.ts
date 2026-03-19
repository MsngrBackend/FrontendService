import { useAuthStore } from '../../entities/session/model/authStore';

export const useDisplayName = (): string => {
  const profile = useAuthStore((s) => s.profile);
  return (
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    profile?.username ||
    'Пользователь'
  );
}

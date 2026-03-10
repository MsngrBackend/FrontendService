import { useState } from 'react';
import { profileApi } from '../api/profile';
import { useAuthStore } from '../store/authStore';

export const useAvatarUpload = () => {
  const { profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const upload = async (file: File) => {
    setLoading(true);
    try {
      const res = await profileApi.uploadAvatar(file);
      if (profile) setProfile({ ...profile, avatar_url: res.avatar_url });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    try {
      await profileApi.deleteAvatar();
      if (profile) setProfile({ ...profile, avatar_url: undefined });
    } catch {
      // ignore
    }
  };

  return { loading, upload, remove };
}

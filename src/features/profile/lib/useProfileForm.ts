import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileApi } from '../../../shared/api/profile';
import { useAuthStore } from '../../../entities/session/model/authStore';
import type { ApiError } from '../../../shared/api/client';

const schema = z.object({
  firstName: z.string().min(1, 'Имя обязательно').max(50),
  lastName: z.string().max(50).optional().or(z.literal('')),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]{3,20}$/, 'Только буквы, цифры и _, от 3 до 20 символов')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(200).optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof schema>;

export const useProfileForm = () => {
  const { profile, setProfile } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: profile?.first_name ?? '',
      lastName: profile?.last_name ?? '',
      username: profile?.username ?? '',
      bio: profile?.bio ?? '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setServerError('');
    setSaveSuccess(false);
    try {
      const updated = await profileApi.updateProfile({
        first_name: data.firstName,
        last_name: data.lastName || undefined,
        username: data.username || undefined,
        bio: data.bio || undefined,
      });
      setProfile(updated);
      form.reset({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        bio: data.bio,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 409) setServerError('Это имя пользователя уже занято');
      else setServerError(err.message || 'Не удалось сохранить');
    }
  });

  return { form, onSubmit, serverError, saveSuccess };
}

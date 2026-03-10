import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/auth';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { ConfirmEmailForm } from './ConfirmEmailForm';
import type { ApiError } from '../../api/client';

const schema = z
  .object({
    email: z.string().email('Введите корректный email'),
    password: z
      .string()
      .min(8, 'Минимум 8 символов')
      .max(72, 'Максимум 72 символа'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
    firstName: z
      .string()
      .min(1, 'Имя обязательно')
      .max(50, 'Максимум 50 символов'),
    lastName: z
      .string()
      .max(50, 'Максимум 50 символов')
      .optional()
      .or(z.literal('')),
    username: z
      .string()
      .regex(/^[a-zA-Z0-9_]{3,20}$/, 'Только буквы, цифры и _, от 3 до 20 символов')
      .optional()
      .or(z.literal('')),
    bio: z
      .string()
      .max(200, 'Максимум 200 символов')
      .optional()
      .or(z.literal('')),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

interface RegisterFormProps {
  onSwitch: () => void;
}

export const RegisterForm = ({ onSwitch }: RegisterFormProps) => {
  const [serverError, setServerError] = useState('');
  const [confirmState, setConfirmState] = useState<{
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    username?: string;
    bio?: string;
    devCode?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const res = await authApi.register(data.email, data.password);
      setConfirmState({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName ?? undefined,
        username: data.username ?? undefined,
        bio: data.bio ?? undefined,
        devCode: res.confirm_code,
      });
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 409) setServerError('Этот email уже зарегистрирован');
      else setServerError('Не удалось зарегистрироваться. Попробуйте позже');
    }
  };

  if (confirmState) {
    return (
      <ConfirmEmailForm
        email={confirmState.email}
        password={confirmState.password}
        firstName={confirmState.firstName}
        lastName={confirmState.lastName}
        username={confirmState.username}
        bio={confirmState.bio}
        devCode={confirmState.devCode}
        onBack={() => setConfirmState(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Имя *"
          placeholder="Иван"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Фамилия"
          placeholder="Иванов"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        label="Email *"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Имя пользователя"
        placeholder="ivan_ivanov"
        hint="Только буквы, цифры и _, 3–20 символов. Необязательно"
        error={errors.username?.message}
        {...register('username')}
      />

      <PasswordInput
        label="Пароль *"
        placeholder="Минимум 8 символов"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <PasswordInput
        label="Подтвердите пароль *"
        placeholder="Повторите пароль"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Textarea
        label="О себе"
        placeholder="Расскажите немного о себе..."
        rows={2}
        maxLength={200}
        error={errors.bio?.message}
        hint="Необязательно, макс. 200 символов"
        {...register('bio')}
      />

      {serverError && (
        <p className="text-sm text-red-500 text-center">{serverError}</p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full mt-1">
        Создать аккаунт
      </Button>

      <p className="text-sm text-center text-(--text-muted)">
        Уже есть аккаунт?{' '}
        <button type="button" onClick={onSwitch} className="text-(--accent) hover:underline font-medium">
          Войти
        </button>
      </p>
    </form>
  );
}

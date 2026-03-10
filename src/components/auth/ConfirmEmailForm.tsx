import { useRef, useState, type KeyboardEvent, type ChangeEvent } from 'react';
import { authApi } from '../../api/auth';
import { profileApi } from '../../api/profile';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import type { ApiError } from '../../api/client';

interface ConfirmEmailFormProps {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  username?: string;
  bio?: string;
  devCode?: string;
  onBack: () => void;
}

export const ConfirmEmailForm = ({
  email,
  password,
  firstName,
  lastName,
  username,
  bio,
  devCode,
  onBack,
}: ConfirmEmailFormProps) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join('');

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (code.length < 6) {
      setError('Введите 6-значный код');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // 1. Confirm email
      await authApi.confirmEmail(email, code);

      // 2. Login — get tokens but DO NOT trigger navigation yet.
      //    We call authApi.login directly so we can set profile data first.
      const tokens = await authApi.login(email, password);
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      // 3. Update profile with registration data while component is still mounted.
      try {
        await profileApi.updateProfile({
          first_name: firstName,
          last_name: lastName || undefined,
          username: username || undefined,
          bio: bio || undefined,
        });
      } catch {
        // non-critical — user can update later
      }

      // 4. Load the final profile and set store — triggers navigation to MainLayout.
      const profile = await profileApi.getMyProfile().catch(() => null);
      useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token);
      if (profile) useAuthStore.getState().setProfile(profile);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 422) setError('Неверный или истёкший код');
      else setError('Что-то пошло не так. Попробуйте позже');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-sm text-(--text-muted)">
          Код подтверждения отправлен на{' '}
          <span className="font-semibold text-(--text-primary)">{email}</span>
        </p>
      </div>

      {devCode && (
        <div className="bg-(--accent-dim) border border-(--accent) rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-(--accent) font-medium uppercase tracking-wide mb-1">Dev режим</p>
          <p className="text-2xl font-bold tracking-widest text-(--text-primary)">{devCode}</p>
        </div>
      )}

      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-11 h-13 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
              border-(--border) focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20
              bg-(--input-bg) text-(--text-primary)"
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <Button onClick={handleSubmit} loading={loading} className="w-full">
        Подтвердить
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-(--text-muted) hover:text-(--text-secondary) text-center transition-colors"
      >
        ← Назад
      </button>
    </div>
  );
}

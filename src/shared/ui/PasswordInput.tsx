import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';
import type { InputHTMLAttributes } from 'react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const toggle = () => setShow((v) => !v);
    const type = show ? 'text' : 'password';

    return (
      <Input
        ref={ref}
        label={label}
        error={error}
        hint={hint}
        type={type}
        suffix={
          <button
            type="button"
            onClick={toggle}
            aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
            className="text-(--text-muted) hover:text-(--text-secondary) transition-colors"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

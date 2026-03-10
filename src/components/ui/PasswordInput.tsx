import { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';
import { usePasswordToggle } from '../../hooks/usePasswordToggle';
import type { InputHTMLAttributes } from 'react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, ...props }, ref) => {
    const { show, toggle, type } = usePasswordToggle();

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

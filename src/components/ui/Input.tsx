import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, suffix, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-(--text-secondary)">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full px-3.5 py-2.5 rounded-xl border text-sm
              bg-(--input-bg) text-(--text-primary) placeholder-(--text-muted)
              transition-all outline-none
              ${suffix ? 'pr-10' : ''}
              ${error
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
                : 'border-(--border) focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20'
              }
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-(--text-muted)">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, suffix, className = '', id: idProp, ...props }, ref) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint && !error ? `${id}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-(--text-secondary)"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId ?? hintId}
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
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-(--text-muted)">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-(--text-secondary)">{label}</label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-(--input-bg) text-(--text-primary) placeholder-(--text-muted) transition-all outline-none resize-none ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
              : 'border-(--border) focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-(--text-muted)">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

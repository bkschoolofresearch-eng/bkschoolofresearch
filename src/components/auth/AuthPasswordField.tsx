'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { authInputClass, authLabelClass } from '@/components/auth/auth-styles';
import { cn } from '@/lib/utils';

type AuthPasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
};

export function AuthPasswordField({
  label,
  value,
  onChange,
  autoComplete = 'current-password',
  required = true,
  minLength,
}: AuthPasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={authLabelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          required={required}
          minLength={minLength}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(authInputClass, 'pr-9')}
          placeholder=" "
        />
        <button
          type="button"
          className="absolute right-0 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#525252] transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeOff className="size-5" aria-hidden />
          ) : (
            <Eye className="size-5" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

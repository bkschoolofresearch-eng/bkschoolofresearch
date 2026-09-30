'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthPasswordField } from '@/components/auth/AuthPasswordField';
import {
  authErrorClass,
  authInputClass,
  authLabelClass,
  authSubmitClass,
} from '@/components/auth/auth-styles';
import type { AuthSession } from '@/types/auth';

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = (await res.json()) as {
        error?: string;
        session?: AuthSession;
      };
      if (!res.ok || !data.session) {
        setError(data.error || 'Could not sign in.');
        return;
      }
      setSession(data.session);
      if (data.session.role === 'admin') {
        router.push('/admin');
        return;
      }
      if (data.session.personSlug) {
        router.push(`/people/${data.session.personSlug}`);
        return;
      }
      router.push('/account');
    } catch {
      setError('Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {error ? <p className={authErrorClass}>{error}</p> : null}

      <form className="space-y-8" onSubmit={onSubmit}>
        <label className={authLabelClass}>
          Email Address*
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
            placeholder=" "
          />
        </label>
        <AuthPasswordField
          label="Password*"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <label className="flex cursor-pointer items-start gap-3 font-sans text-sm text-ink">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[#0b233f]"
          />
          <span>
            <span className="font-medium">Remember me</span>
            <span className="mt-0.5 block text-[#525252]">
              Stay signed in on this browser for 30 days.
            </span>
          </span>
        </label>

        <div className="space-y-3 pt-2">
          <p className="text-sm leading-5 text-ink">
            Use the email and password from your BKSR invitation or profile
            claim. Your information is encrypted and secure.
          </p>
          <button type="submit" disabled={busy} className={authSubmitClass}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="text-center text-sm text-ink/70">
            <Link
              href="/forgot-password"
              className="font-medium underline-offset-2 hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

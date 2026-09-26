'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  authErrorClass,
  authInputClass,
  authLabelClass,
  authNoticeClass,
  authSubmitClass,
} from '@/components/auth/auth-styles';
import { CloudinaryImageField } from '@/components/media/CloudinaryImageField';

type Step = 'email' | 'otp' | 'profile' | 'password';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const { setSession } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [registerToken, setRegisterToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [preview, setPreview] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [inviteReady, setInviteReady] = useState(!inviteToken);

  useEffect(() => {
    if (!inviteToken) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/auth/session?invite=${encodeURIComponent(inviteToken)}`,
        );
        const data = (await res.json()) as {
          error?: string;
          email?: string;
          personPreview?: { name: string; email: string; role: string };
        };
        if (cancelled) return;
        if (!res.ok || !data.email || !data.personPreview) {
          setError(data.error || 'This invite link is not valid.');
          setInviteReady(true);
          return;
        }
        setEmail(data.email);
        setName(data.personPreview.name);
        setPreview(data.personPreview);
        setInviteReady(true);
      } catch {
        if (!cancelled) {
          setError('Could not load invite.');
          setInviteReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inviteToken]);

  const requestCode = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inviteToken }),
      });
      const data = (await res.json()) as {
        error?: string;
        personPreview?: { name: string; email: string; role: string };
        devOtp?: string;
      };
      if (!res.ok) {
        setError(data.error || 'Could not send code.');
        return;
      }
      setPreview(data.personPreview ?? null);
      setDevOtp(data.devOtp ?? null);
      setName((prev) => prev || data.personPreview?.name || '');
      setStep('otp');
    } catch {
      setError('Could not send code.');
    } finally {
      setBusy(false);
    }
  };

  if (!inviteReady) {
    return <p className="text-sm text-muted">Checking your invitation…</p>;
  }

  return (
    <div className="space-y-8">
      {preview ? (
        <div className={authNoticeClass}>
          <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Team position
          </p>
          <p className="mt-1 font-display text-xl text-ink">{preview.name}</p>
          <p className="text-muted">{preview.role}</p>
          <p className="mt-1 text-xs text-muted">{preview.email}</p>
        </div>
      ) : null}

      {error ? <p className={authErrorClass}>{error}</p> : null}

      {step === 'email' ? (
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            void requestCode();
          }}
        >
          <label className={authLabelClass}>
            Email Address*
            <input
              type="email"
              required
              className={authInputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={Boolean(inviteToken)}
              placeholder=" "
            />
          </label>
          <div className="space-y-3 pt-2">
            <p className="text-sm leading-5 text-ink">
              Your information is encrypted and secure. We only email invited or
              allowlisted addresses.
            </p>
            <button type="submit" disabled={busy} className={authSubmitClass}>
              {busy ? 'Sending…' : 'Send verification code'}
            </button>
          </div>
        </form>
      ) : null}

      {step === 'otp' ? (
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            void (async () => {
              try {
                const res = await fetch('/api/auth/otp/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, otp }),
                });
                const data = (await res.json()) as {
                  error?: string;
                  registerToken?: string;
                  personPreview?: {
                    name: string;
                    email: string;
                    role: string;
                  };
                };
                if (!res.ok || !data.registerToken) {
                  setError(data.error || 'Incorrect code.');
                  return;
                }
                setRegisterToken(data.registerToken);
                setPreview(data.personPreview ?? preview);
                setDevOtp(null);
                setStep('profile');
              } catch {
                setError('Could not verify code.');
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          {devOtp ? (
            <p className={authNoticeClass}>
              Dev mode: your code is{' '}
              <strong className="font-mono">{devOtp}</strong> (email delivery is
              not configured).
            </p>
          ) : (
            <p className="text-sm text-ink/80">
              We sent a verification code to {email}.
            </p>
          )}
          <label className={authLabelClass}>
            Verification code*
            <input
              required
              className={authInputClass}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder=" "
            />
          </label>
          <div className="space-y-3 pt-2">
            <button type="submit" disabled={busy} className={authSubmitClass}>
              {busy ? 'Checking…' : 'Continue'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void requestCode()}
              className="w-full text-center text-sm font-medium text-ink underline-offset-2 hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
          </div>
        </form>
      ) : null}

      {step === 'profile' ? (
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            setStep('password');
          }}
        >
          <label className={authLabelClass}>
            Display name*
            <input
              required
              className={authInputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
            />
          </label>
          <label className={authLabelClass}>
            Short bio*
            <textarea
              required
              rows={3}
              className={`${authInputClass} resize-y`}
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="One or two sentences about your work"
            />
          </label>
          <label className={authLabelClass}>
            Fuller bio
            <textarea
              rows={4}
              className={`${authInputClass} resize-y`}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder=" "
            />
          </label>
          <CloudinaryImageField
            label="Photo (optional)"
            value={photoUrl}
            onChange={setPhotoUrl}
            uploadEndpoint="/api/auth/upload-photo"
            uploadExtraFields={
              registerToken ? { registerToken } : undefined
            }
            help="Upload a portrait, or paste an image URL."
            className="text-ink [&_label]:text-base [&_label]:font-normal [&_label]:text-[#525252]"
          />
          <label className={authLabelClass}>
            Affiliation
            <input
              className={authInputClass}
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder=" "
            />
          </label>
          <button type="submit" className={authSubmitClass}>
            Continue to password
          </button>
        </form>
      ) : null}

      {step === 'password' ? (
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (!registerToken) return;
            if (password !== confirm) {
              setError('Passwords do not match.');
              return;
            }
            setBusy(true);
            setError(null);
            void (async () => {
              try {
                const res = await fetch('/api/auth/register', {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    registerToken,
                    password,
                    inviteToken,
                    profile: {
                      name,
                      shortBio,
                      bio: bio || shortBio,
                      photoUrl,
                      affiliation,
                    },
                  }),
                });
                const data = (await res.json()) as {
                  error?: string;
                  session?: Parameters<typeof setSession>[0];
                  personSlug?: string;
                };
                if (!res.ok || !data.session || !data.personSlug) {
                  setError(data.error || 'Could not create account.');
                  return;
                }
                setSession(data.session);
                router.push(`/people/${data.personSlug}`);
              } catch {
                setError('Could not create account.');
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
            <label className={authLabelClass}>
              Create Password*
              <input
                type="password"
                required
                minLength={8}
                className={authInputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
              />
            </label>
            <label className={authLabelClass}>
              Confirm Password*
              <input
                type="password"
                required
                minLength={8}
                className={authInputClass}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder=" "
              />
            </label>
          </div>
          <div className="space-y-3 pt-2">
            <p className="text-sm leading-5 text-ink">
              Your information is encrypted and secure.
            </p>
            <button type="submit" disabled={busy} className={authSubmitClass}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>
      ) : null}

      <p className="text-sm text-ink/70">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-ink underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

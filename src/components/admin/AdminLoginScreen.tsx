'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  AuthFooterLink,
  AuthSplitShell,
} from '@/components/layout/AuthSplitShell';
import { AuthPasswordField } from '@/components/auth/AuthPasswordField';
import {
  authErrorClass,
  authInputClass,
  authLabelClass,
  authNoticeClass,
  authSubmitClass,
} from '@/components/auth/auth-styles';
import { useCms } from './CmsProvider';

type Step = 'credentials' | 'otp';

export function AdminLoginScreen() {
  const { loginCms, verifyCmsOtp, resendCmsOtp } = useCms();
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [mailSent, setMailSent] = useState(true);
  const [mailError, setMailError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = step === 'credentials' ? 'Admin sign in' : 'Verify email';
  const description =
    step === 'credentials'
      ? 'Sign in to the Content Studio. After your password, we email a one-time code to confirm it is you.'
      : `Enter the verification code we sent to ${maskedEmail || 'your admin email'}.`;

  return (
    <AuthSplitShell
      title={title}
      description={description}
      footer={
        step === 'credentials' ? (
          <>
            Looking for a member account?{' '}
            <AuthFooterLink href="/login">Member sign in</AuthFooterLink>
          </>
        ) : (
          <>
            Wrong account?{' '}
            <button
              type="button"
              className="font-medium text-ink underline-offset-2 hover:underline"
              onClick={() => {
                setStep('credentials');
                setOtp('');
                setDevOtp(null);
                setError(null);
              }}
            >
              Back to sign in
            </button>
          </>
        )
      }
    >
      <div className="space-y-8">
        {error ? <p className={authErrorClass}>{error}</p> : null}

        {step === 'credentials' ? (
          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              setBusy(true);
              void (async () => {
                try {
                  const result = await loginCms(email, password);
                  if (result.step === 'otp') {
                    setMaskedEmail(result.maskedEmail ?? '');
                    setMailSent(result.mailSent !== false);
                    setDevOtp(result.devOtp ?? null);
                    setMailError(result.mailError ?? null);
                    setStep('otp');
                    return;
                  }
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : 'Could not sign in.',
                  );
                } finally {
                  setBusy(false);
                }
              })();
            }}
          >
            <label className={authLabelClass}>
              Email Address*
              <input
                required
                type="email"
                autoComplete="username"
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
                Use the CMS admin email and password from the server
                environment. A one-time code will be sent next.
              </p>
              <button type="submit" disabled={busy} className={authSubmitClass}>
                {busy ? 'Continuing…' : 'Continue'}
              </button>
            </div>
          </form>
        ) : (
          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              setBusy(true);
              void (async () => {
                try {
                  await verifyCmsOtp(otp, remember);
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : 'Could not verify code.',
                  );
                } finally {
                  setBusy(false);
                }
              })();
            }}
          >
            {devOtp ? (
              <p className={authNoticeClass}>
                {mailError
                  ? `Could not email the code (${mailError}). `
                  : mailSent
                    ? ''
                    : 'Email was not delivered. '}
                Temporary code for this session:{' '}
                <strong className="font-mono">{devOtp}</strong>
              </p>
            ) : (
              <p className={authNoticeClass}>
                {mailSent
                  ? `We sent a verification code to ${maskedEmail}.`
                  : `We could not send email${mailError ? ` (${mailError})` : ''}. Check Resend settings, or ask for a new code.`}
              </p>
            )}

            <label className={authLabelClass}>
              Verification code*
              <input
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={authInputClass}
                placeholder=" "
                maxLength={6}
              />
            </label>

            <div className="space-y-3 pt-2">
              <button type="submit" disabled={busy} className={authSubmitClass}>
                {busy ? 'Verifying…' : 'Verify and enter CMS'}
              </button>
              <p className="text-center text-sm text-ink/70">
                <button
                  type="button"
                  disabled={busy}
                  className="font-medium underline-offset-2 hover:underline disabled:opacity-50"
                  onClick={() => {
                    setError(null);
                    setBusy(true);
                    void (async () => {
                      try {
                        const result = await resendCmsOtp();
                        setMaskedEmail(result.maskedEmail ?? maskedEmail);
                        setMailSent(result.mailSent !== false);
                        setDevOtp(result.devOtp ?? null);
                        setMailError(result.mailError ?? null);
                      } catch (err) {
                        setError(
                          err instanceof Error
                            ? err.message
                            : 'Could not resend code.',
                        );
                      } finally {
                        setBusy(false);
                      }
                    })();
                  }}
                >
                  Resend code
                </button>
                {' · '}
                <Link
                  href="/"
                  className="font-medium underline-offset-2 hover:underline"
                >
                  Back to website
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </AuthSplitShell>
  );
}

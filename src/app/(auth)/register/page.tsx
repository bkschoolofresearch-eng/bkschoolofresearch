import { Suspense } from 'react';
import {
  AuthFooterLink,
  AuthSplitShell,
} from '@/components/layout/AuthSplitShell';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata(
  'Create account',
  'Accept your BKSR invitation or claim an allowlisted team profile.',
  '/register',
);

export default function RegisterPage() {
  return (
    <AuthSplitShell
      title="Create Account"
      description="If an administrator invited you, verify with a one-time code, complete your profile, then set a password. Apply to join first if you are not yet on the team."
      footer={
        <>
          Need access?{' '}
          <AuthFooterLink href="/join">Apply to join</AuthFooterLink>
          {' · '}
          <AuthFooterLink href="/login">Sign in</AuthFooterLink>
        </>
      }
    >
      <Suspense
        fallback={<p className="text-sm text-muted">Loading registration…</p>}
      >
        <RegisterForm />
      </Suspense>
    </AuthSplitShell>
  );
}

import Link from 'next/link';
import {
  AuthFooterLink,
  AuthSplitShell,
} from '@/components/layout/AuthSplitShell';
import {
  authNoticeClass,
  authSubmitClass,
} from '@/components/auth/auth-styles';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata(
  'Forgot password',
  'Password reset will be available when email delivery is connected.',
  '/forgot-password',
  { noIndex: true },
);

export default function ForgotPasswordPage() {
  return (
    <AuthSplitShell
      title="Forgot password"
      description="Secure email reset ships with the production auth backend. Until then, use the options below."
      footer={
        <>
          <AuthFooterLink href="/login">Back to sign in</AuthFooterLink>
          {' · '}
          <AuthFooterLink href="/contact">Contact BKSR</AuthFooterLink>
        </>
      }
    >
      <div className="space-y-8">
        <div className={authNoticeClass}>
          <p className="font-semibold text-ink">Demo stub</p>
          <p className="mt-1.5">
            OTP-backed reset links will be emailed securely in Phase 2. For now,
            ask an administrator to clear the demo auth store, or register again
            after they unlink your profile.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm leading-5 text-ink">
            Your information is encrypted and secure.
          </p>
          <Link href="/login" className={authSubmitClass}>
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthSplitShell>
  );
}

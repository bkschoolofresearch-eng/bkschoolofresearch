import {
  AuthFooterLink,
  AuthSplitShell,
} from '@/components/layout/AuthSplitShell';
import { LoginForm } from '@/components/auth/LoginForm';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata(
  'Sign in',
  'Sign in to BK School of Research to manage your claimed profile.',
  '/login',
  { noIndex: true },
);

export default function LoginPage() {
  return (
    <AuthSplitShell
      title="Sign in"
      description="Members manage their claimed profiles. Administrators open the Content Studio after signing in."
      footer={
        <>
          Invited?{' '}
          <AuthFooterLink href="/register">Create your account</AuthFooterLink>
          {' · '}
          <AuthFooterLink href="/join">Apply to join</AuthFooterLink>
        </>
      }
    >
      <LoginForm />
    </AuthSplitShell>
  );
}

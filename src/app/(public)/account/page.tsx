import { AccountRedirect } from '@/components/auth/AccountRedirect';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata(
  'Account',
  'Your BK School of Research account.',
  '/account',
  { noIndex: true },
);

export default function AccountPage() {
  return (
    <Section tone="white" className="pt-28">
      <Container>
        <AccountRedirect />
      </Container>
    </Section>
  );
}

import {
  UtilityFormFooterLink,
  UtilityFormShell,
} from '@/components/layout/UtilityFormShell';
import { FormSidePanel } from '@/components/layout/FormSidePanel';
import { VerifyLookup } from '@/components/public/VerifyLookup';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata(
  'Verify',
  'Verify a BKSR membership or achievement certificate code.',
  '/verify',
  { noIndex: true },
);

export default function VerifyPage() {
  return (
    <UtilityFormShell
      title="Verify a BKSR code"
      description="Enter a membership code (BKSR-#####M) or certificate code (BKSR-#####C)."
      panel={
        <FormSidePanel
          eyebrow="Verification"
          title="Confirm a BKSR credential."
          description="Look up membership and certificate codes issued by BK School of Research."
          lottieSrc="/media/lottie/verify-check.json"
        />
      }
      cardEyebrow="Lookup"
      cardTitle="Enter code"
      footer={
        <>
          Team member?{' '}
          <UtilityFormFooterLink href="/login">Sign in</UtilityFormFooterLink>
          {' · '}
          <UtilityFormFooterLink href="/contact">Contact</UtilityFormFooterLink>
        </>
      }
    >
      <VerifyLookup />
    </UtilityFormShell>
  );
}

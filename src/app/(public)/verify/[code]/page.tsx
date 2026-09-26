import {
  UtilityFormFooterLink,
  UtilityFormShell,
} from '@/components/layout/UtilityFormShell';
import { FormSidePanel } from '@/components/layout/FormSidePanel';
import { VerifyLookup } from '@/components/public/VerifyLookup';
import { buildPageMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);
  return buildPageMetadata(
    `Verify ${decoded}`,
    'BKSR membership or certificate verification.',
    `/verify/${decoded}`,
  );
}

export default async function VerifyCodePage({ params }: Props) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);

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
      <VerifyLookup initialCode={decoded} />
    </UtilityFormShell>
  );
}

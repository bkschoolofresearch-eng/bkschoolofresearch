import { notFound } from 'next/navigation';
import { FormSidePanel } from '@/components/layout/FormSidePanel';
import {
  UtilityFormFooterLink,
  UtilityFormShell,
} from '@/components/layout/UtilityFormShell';
import { PublicRegistrationForm } from '@/components/public/PublicRegistrationForm';
import { getContentDatabase } from '@/lib/cms/get-content-database';
import {
  getEntityPublicHref,
  getEntityTitle,
  getFormBySlug,
  isFormFull,
} from '@/lib/content/registration-forms';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { isProductionBuild } from '@/lib/cms/build-phase';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  if (isProductionBuild()) return [];
  const db = await getContentDatabase();
  return db.registrationForms
    .filter((form) => form.entityType !== 'join')
    .map((form) => ({
      slug: form.slug,
    }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const form = getFormBySlug(await getContentDatabase(), slug);
  if (!form) return {};
  return buildPageMetadata(
    form.title,
    form.description ?? 'Event registration form',
    `/forms/${form.slug}`,
  );
}

export default async function RegistrationFormPage({ params }: Props) {
  const { slug } = await params;
  const db = await getContentDatabase();
  const form = getFormBySlug(db, slug);
  if (!form || form.status === 'archived' || form.entityType === 'join') {
    notFound();
  }

  const entityTitle = getEntityTitle(db, form);
  const entityHref = getEntityPublicHref(db, form);

  return (
    <UtilityFormShell
      title={form.title}
      description={
        form.description ??
        (entityTitle
          ? `Register for ${entityTitle}.`
          : 'Complete the form below to register.')
      }
      panel={
        <FormSidePanel
          eyebrow="Registration"
          title="Secure your place."
          description={
            entityTitle
              ? `This form is linked to ${entityTitle}. Submit your details and wait for confirmation.`
              : 'Submit your details. BKSR will confirm after review when approval is required.'
          }
          lottieSrc="/media/lottie/join-apply.json"
          footer={
            entityHref ? (
              <>
                Back to{' '}
                <a
                  href={entityHref}
                  className="font-semibold text-paper underline-offset-2 hover:underline"
                >
                  {entityTitle || 'event'}
                </a>
                .
              </>
            ) : null
          }
        />
      }
      cardEyebrow="Form"
      cardTitle="Your details"
      footer={
        <>
          {entityHref ? (
            <>
              <UtilityFormFooterLink href={entityHref}>
                Back to event
              </UtilityFormFooterLink>
              {' · '}
            </>
          ) : null}
          <UtilityFormFooterLink href="/contact">Contact</UtilityFormFooterLink>
        </>
      }
    >
      <PublicRegistrationForm
        initialForm={form}
        entityTitle={entityTitle}
        entityHref={entityHref}
        isFull={isFormFull(db, form)}
      />
    </UtilityFormShell>
  );
}

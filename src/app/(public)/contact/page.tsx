import { PageHero } from '@/components/layout/PageHero';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import {
  SocialGlyph,
  type SocialNetwork,
} from '@/components/ui/SocialGlyph';
import { ContactForm } from '@/components/public/ContactForm';
import { pageHeroMedia } from '@/lib/content/page-heroes';
import { getSiteSettings } from '@/lib/content/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata(
  'Contact',
  'Contact BK School of Research in Shahjadpur, Sirajganj, Bangladesh.',
  '/contact',
);

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const phoneHref = `tel:${settings.phone.replace(/\s/g, '')}`;
  const socialEntries = (
    [
      { label: 'Facebook', href: settings.social.facebook, name: 'facebook' },
      { label: 'YouTube', href: settings.social.youtube, name: 'youtube' },
      { label: 'LinkedIn', href: settings.social.linkedin, name: 'linkedin' },
      { label: 'X', href: settings.social.twitter, name: 'twitter' },
      { label: 'Instagram', href: settings.social.instagram, name: 'instagram' },
    ] satisfies ReadonlyArray<{
      label: string;
      href?: string;
      name: SocialNetwork;
    }>
  ).filter(
    (entry): entry is { label: string; href: string; name: SocialNetwork } =>
      Boolean(entry.href),
  );

  const desks = [
    { label: 'Executive Director', email: settings.emails.executiveDirector },
    { label: 'Research Director', email: settings.emails.researchDirector },
  ];

  return (
    <>
      <PageHero
        eyebrow="Connect"
        title="Contact"
        description="For collaboration, enquiry, and correspondence with BK School of Research."
        imageSrc={pageHeroMedia.contact}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <Section
        tone="white"
        spaced={false}
        className="py-10 sm:py-14 md:py-20"
      >
        <Container>
          <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-10">
            <aside className="order-1 lg:sticky lg:top-28 lg:order-2 lg:col-span-5">
              <div className="overflow-hidden rounded-[1.5rem] bg-[#0b233f] text-paper sm:rounded-[1.75rem]">
                <div className="px-6 py-7 sm:px-8 sm:py-8">
                  <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-paper/55">
                    Reach us
                  </p>
                  <a
                    href={phoneHref}
                    className="mt-4 block font-display text-[1.85rem] leading-tight tracking-[-0.02em] text-paper transition-colors hover:text-white sm:text-[2.15rem]"
                  >
                    {settings.phone}
                  </a>
                  <a
                    href={`mailto:${settings.emails.general}`}
                    className="mt-3 block break-all font-instrument text-lg text-paper/85 transition-colors hover:text-paper"
                  >
                    {settings.emails.general}
                  </a>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/70 sm:text-base">
                    {settings.address.full}
                  </p>

                  {socialEntries.length > 0 ? (
                    <ul className="mt-6 flex flex-wrap gap-2.5">
                      {socialEntries.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={item.label}
                            title={item.label}
                            className="inline-flex size-11 items-center justify-center rounded-full bg-paper text-ink transition hover:bg-white"
                          >
                            <SocialGlyph name={item.name} className="size-4" />
                            <span className="sr-only">{item.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="border-t border-white/10 px-6 py-6 sm:px-8 sm:py-7">
                  <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-paper/55">
                    Write directly
                  </p>
                  <ul className="mt-4 space-y-4">
                    {desks.map((desk) => (
                      <li key={desk.label}>
                        <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-paper/45">
                          {desk.label}
                        </p>
                        <a
                          href={`mailto:${desk.email}`}
                          className="mt-1 block break-all text-sm font-medium text-paper/90 transition-colors hover:text-white"
                        >
                          {desk.email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            <div className="order-2 lg:order-1 lg:col-span-7">
              <div className="rounded-[1.5rem] border border-ink/10 bg-white px-5 py-6 sm:rounded-[1.75rem] sm:px-8 sm:py-8">
                <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted">
                  Message
                </p>
                <h2 className="mt-2 font-display text-[1.85rem] leading-tight tracking-[-0.02em] text-ink sm:text-4xl">
                  Send a message
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                  Collaboration, a programme question, or a general enquiry.
                  We reply to the email you leave here.
                </p>
                <div className="mt-7">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

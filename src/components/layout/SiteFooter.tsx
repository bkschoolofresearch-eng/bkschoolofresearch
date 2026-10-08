import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SocialGlyph } from '@/components/ui/SocialGlyph';
import type { NavigationItem, SiteSettings } from '@/types/content';
import { cn } from '@/lib/utils';

type SiteFooterProps = {
  settings: SiteSettings;
  footerNav: NavigationItem[];
  knowledgeHub: NavigationItem[];
  className?: string;
};

/**
 * Illustration blooms in the lower art band.
 * Link columns sit on a frosted paper raft so type stays readable.
 */
const FOOTER_ILLUSTRATION = '/media/brand/bksr-footer-fruitful.png';
const FOOTER_SURFACE = '#F7F1E6';
/** Public inbox connected to Resend. */
const FOOTER_EMAIL = 'bkschoolofresearch@gmail.com';

const exploreLinks = [
  { id: 'ex-about', label: 'About BKSR', href: '/about' },
  { id: 'ex-people', label: 'People', href: '/people' },
  { id: 'ex-activities', label: 'Activities', href: '/activities' },
  { id: 'ex-events', label: 'Events', href: '/events' },
  { id: 'ex-notices', label: 'Notices', href: '/notices' },
  { id: 'ex-news', label: 'News', href: '/news' },
] as const;

const researchLinks = [
  { id: 're-overview', label: 'Research', href: '/research' },
  { id: 're-areas', label: 'Research areas', href: '/research/areas' },
  { id: 're-pubs', label: 'Publications', href: '/publications' },
  { id: 're-hub', label: 'Knowledge hub', href: '/resources' },
  { id: 're-gallery', label: 'Gallery', href: '/gallery' },
] as const;

const instituteLinks = [
  { id: 'in-career', label: 'Vacancy at BKSR', href: '/people/career' },
  { id: 'in-join', label: 'Apply to join', href: '/join' },
  { id: 'in-policies', label: 'Our policies', href: '/about/policies' },
  { id: 'in-governance', label: 'Governance', href: '/about/governance' },
  { id: 'in-contact', label: 'Contact', href: '/contact' },
  { id: 'in-privacy', label: 'Privacy', href: '/privacy' },
] as const;

/** Scene stays quiet behind type, then opens in the art band. */
const ILLUSTRATION_MASK =
  'linear-gradient(180deg, transparent 0%, transparent 20%, rgba(0,0,0,0.04) 38%, rgba(0,0,0,0.14) 52%, rgba(0,0,0,0.4) 64%, rgba(0,0,0,0.75) 76%, rgba(0,0,0,0.95) 88%, #000 96%)';

function FooterEmail({ address }: { address: string }) {
  const at = address.indexOf('@');
  if (at < 1) return <span className="min-w-0 leading-snug">{address}</span>;

  return (
    <span className="leading-snug">
      {address.slice(0, at)}@<wbr />
      {address.slice(at + 1)}
    </span>
  );
}

function ContactIcon({ kind }: { kind: 'phone' | 'mail' }) {
  if (kind === 'phone') {
    return (
      <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden>
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden>
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z" />
    </svg>
  );
}

const socialTone: Record<
  'facebook' | 'youtube' | 'linkedin',
  string
> = {
  facebook: 'bg-[#1877F2] text-white hover:bg-[#0f5fcc]',
  youtube: 'bg-[#FF0000] text-white hover:bg-[#d60000]',
  linkedin: 'bg-[#0A66C2] text-white hover:bg-[#084e96]',
};

export function SiteFooter({
  settings,
  footerNav: _footerNav,
  knowledgeHub: _knowledgeHub,
  className,
}: SiteFooterProps) {
  const social = [
    {
      label: 'Facebook',
      href: settings.social.facebook,
      name: 'facebook' as const,
    },
    {
      label: 'YouTube',
      href: settings.social.youtube,
      name: 'youtube' as const,
    },
    {
      label: 'LinkedIn',
      href: settings.social.linkedin,
      name: 'linkedin' as const,
    },
  ].filter((item) => Boolean(item.href));

  return (
    <footer
      className={cn('relative isolate overflow-hidden text-ink', className)}
      style={{ backgroundColor: FOOTER_SURFACE }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={FOOTER_ILLUSTRATION}
          alt=""
          fill
          sizes="100vw"
          quality={100}
          priority={false}
          className="object-cover object-[center_62%] opacity-90 sm:opacity-100"
          style={{
            maskImage: ILLUSTRATION_MASK,
            WebkitMaskImage: ILLUSTRATION_MASK,
          }}
        />
        {/* Heavy paper wash through the type zone — art clears underneath */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #F7F1E6 0%, #F7F1E6 28%, rgba(247,241,230,0.97) 42%, rgba(247,241,230,0.88) 52%, rgba(247,241,230,0.55) 62%, rgba(247,241,230,0.18) 74%, transparent 88%)',
          }}
        />
      </div>

      <Container className="relative z-1 pt-10 pb-4 sm:pt-12 md:pt-14">
        {/* Frosted content raft — keeps links readable over the scene */}
        <div className="rounded-[1.5rem] border border-white/50 bg-[#F7F1E6]/82 px-4 py-6 shadow-[0_8px_32px_rgba(11,35,63,0.06)] backdrop-blur-[6px] sm:rounded-[1.75rem] sm:px-6 sm:py-7 md:px-8 md:py-8 lg:bg-[#F7F1E6]/72">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-8 lg:gap-y-0">
            <div className="lg:col-span-4">
              <Link href="/" className="inline-flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/bksr-logo.png"
                  alt=""
                  width={280}
                  height={90}
                  className="h-10 w-auto max-w-full object-contain object-left sm:h-11"
                />
                <span className="sr-only">{settings.organizationShortName}</span>
              </Link>

              <p className="mt-6 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink/75">
                Reach us
              </p>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-3 font-instrument text-[0.9375rem] text-ink transition-colors hover:text-accent sm:text-base"
                  >
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ink/8 text-accent">
                      <ContactIcon kind="phone" />
                    </span>
                    {settings.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${FOOTER_EMAIL}`}
                    className="inline-flex items-start gap-3 font-instrument text-[0.9375rem] text-ink transition-colors hover:text-accent sm:text-base"
                  >
                    <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ink/8 text-accent">
                      <ContactIcon kind="mail" />
                    </span>
                    <FooterEmail address={FOOTER_EMAIL} />
                  </a>
                </li>
              </ul>

              {social.length ? (
                <div className="mt-6">
                  <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink/75">
                    Follow BKSR
                  </p>
                  <ul className="mt-3 flex flex-wrap items-center gap-2.5">
                    {social.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'inline-flex size-10 items-center justify-center rounded-full shadow-sm transition-[transform,background-color] duration-200 hover:scale-[1.05]',
                            socialTone[item.name],
                          )}
                          aria-label={item.label}
                        >
                          <SocialGlyph name={item.name} className="size-4" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Equal nav columns from the smallest screens — no staggered wrap */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:col-span-7 lg:col-start-6 lg:gap-8">
              <FooterColumn title="Explore" items={exploreLinks} />
              <FooterColumn title="Research" items={researchLinks} />
              <FooterColumn title="Institute" items={instituteLinks} />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-ink/10 pt-5 sm:mt-9 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <p className="font-sans text-xs font-medium text-ink/80 sm:text-sm">
                {settings.copyright}
              </p>
              <p className="mt-1 font-instrument text-xs text-ink/70 sm:text-sm">
                Founded {settings.foundedYear} · {settings.organizationShortName}
              </p>
            </div>
            <Link
              href="/people/ratul-saha-roy"
              className="inline-flex items-center gap-1 font-sans text-[0.6875rem] leading-snug text-ink/65 transition-colors hover:text-ink sm:text-xs"
            >
              Website developed by{' '}
              <span className="font-semibold text-ink">Ratul Saha Roy</span>
              <ArrowUpRight className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
            </Link>
          </div>
        </div>
      </Container>

      {/* Art band only — no copyright strip over the illustration */}
      <div
        className="relative z-1 h-[9.5rem] sm:h-[12rem] md:h-[14rem] lg:h-[15.5rem]"
        aria-hidden
      />
    </footer>
  );
}

function FooterColumn({
  title,
  items,
  className,
}: {
  title: string;
  items: readonly { id: string; label: string; href: string }[];
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="font-sans text-[0.75rem] font-semibold tracking-[0.02em] text-ink sm:text-[0.8125rem]">
        {title}
      </p>
      <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="block font-instrument text-[0.8125rem] leading-snug text-ink transition-colors hover:text-accent sm:text-[0.9375rem] sm:leading-normal"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

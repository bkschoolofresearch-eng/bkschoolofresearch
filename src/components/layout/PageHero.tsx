import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { EditorialHeading } from '@/components/ui/EditorialHeading';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { prototypeMedia } from '@/lib/content/prototype-media';
import { cn } from '@/lib/utils';

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Required on every inner page — sitewide orientation trail */
  breadcrumbs: BreadcrumbItem[];
  actions?: React.ReactNode;
  /** Optional hero photograph — defaults to institute seminar imagery */
  imageSrc?: string;
  imageAlt?: string;
  /**
   * `photo` — full-bleed image + navy wash (homepage language).
   * `surface` — quiet paper band for rare utility pages.
   */
  tone?: 'photo' | 'surface';
  className?: string;
};

const DEFAULT_HERO_IMAGE = prototypeMedia.heroSlideSeminar.url;

/**
 * Inner-page masthead aligned to the homepage hero language:
 * photography plane, deep navy wash, display title, restrained CTAs.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  imageSrc = DEFAULT_HERO_IMAGE,
  imageAlt = '',
  tone = 'photo',
  className,
}: PageHeroProps) {
  if (tone === 'surface') {
    return (
      <header
        className={cn(
          'relative overflow-hidden border-b border-border bg-surface-subtle pt-28 pb-12 md:pt-32 md:pb-16',
          className,
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(23,59,108,0.07),transparent_50%),radial-gradient(ellipse_at_100%_100%,rgba(184,58,58,0.04),transparent_45%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 top-0 w-[3px] bg-brand-red"
          aria-hidden
        />
        <Container className="relative">
          <Breadcrumb items={breadcrumbs} />
          {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
          <EditorialHeading as="h1" size="xl" className="max-w-4xl">
            {title}
          </EditorialHeading>
          {description ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
          {actions ? (
            <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
          ) : null}
        </Container>
      </header>
    );
  }

  return (
    <header
      className={cn(
        'relative isolate overflow-hidden bg-ink pt-24 pb-10 text-paper sm:pt-28 sm:pb-14 md:pt-32 md:pb-20 lg:min-h-[22rem] lg:pb-24',
        '[@media(max-height:500px)]:pt-20 [@media(max-height:500px)]:pb-8 [@media(max-height:500px)]:lg:min-h-0',
        className,
      )}
    >
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_35%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(13,39,69,0.96)_0%,rgba(13,39,69,0.88)_38%,rgba(13,39,69,0.55)_72%,rgba(13,39,69,0.35)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(184,58,58,0.16),transparent_42%)]" />
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 top-0 z-[1] w-[3px] bg-brand-red"
        aria-hidden
      />

      <Container className="relative z-[2] min-w-0">
        <Breadcrumb
          items={breadcrumbs}
          tone="onDark"
          className="mb-4 sm:mb-7 [@media(max-height:500px)]:mb-3"
        />
        {eyebrow ? (
          <Eyebrow className="mb-2 text-paper/65 sm:mb-3">
            {eyebrow}
          </Eyebrow>
        ) : null}
        <EditorialHeading
          as="h1"
          size="xl"
          className="max-w-4xl text-balance text-paper"
        >
          {title}
        </EditorialHeading>
        {description ? (
          <p className="mt-3 max-w-2xl text-pretty font-instrument text-sm leading-relaxed text-paper/78 sm:mt-5 sm:text-lg md:text-xl [@media(max-height:500px)]:mt-2 [@media(max-height:500px)]:text-sm">
            {description}
          </p>
        ) : null}
        {actions ? (
          <div
            className={cn(
              'mt-9 flex flex-wrap items-center gap-x-5 gap-y-3',
              '[&_a]:text-paper/88 [&_a]:hover:text-white',
              '[&_button]:border-paper/35 [&_button]:text-paper',
            )}
          >
            {actions}
          </div>
        ) : null}
      </Container>
    </header>
  );
}

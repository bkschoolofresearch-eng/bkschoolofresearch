import { Container } from '@/components/ui/Container';
import { ImageFrame } from '@/components/ui/ImageFrame';
import { RichText } from '@/components/ui/RichText';
import { Section } from '@/components/ui/Section';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type ArticleReadingProps = {
  body: string;
  imageUrl?: string | null;
  imageAlt?: string;
  imageAspect?: 'square' | 'video' | 'portrait' | 'wide';
  meta?: React.ReactNode;
  aside?: React.ReactNode;
  legacyUrl?: string | null;
  backHref?: string;
  backLabel?: string;
  className?: string;
  bodySlot?: React.ReactNode;
};

/**
 * Narrow reading column for notices, news, events, and long-form public copy.
 * Image sits above the text — never competing in a wide two-column squeeze.
 */
export function ArticleReading({
  body,
  imageUrl,
  imageAlt = '',
  imageAspect = 'video',
  meta,
  aside,
  legacyUrl,
  backHref,
  backLabel = 'Back',
  className,
  bodySlot,
}: ArticleReadingProps) {
  return (
    <Section
      tone="white"
      spaced={false}
      className={cn('py-10 sm:py-14 md:py-20', className)}
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16">
          <article className="min-w-0 lg:col-span-8">
            {imageUrl ? (
              <figure className="mb-8 max-w-2xl sm:mb-10">
                <ImageFrame
                  src={imageUrl}
                  alt={imageAlt}
                  aspect={imageAspect}
                  sizes="(max-width: 1024px) 92vw, 48vw"
                  frameClassName="overflow-hidden rounded-[1.15rem] border border-ink/8 bg-surface-subtle sm:rounded-[1.5rem]"
                  className="object-cover"
                />
              </figure>
            ) : null}

            {meta ? (
              <div className="mb-8 border-b border-border pb-6 sm:mb-10 sm:pb-8">
                {meta}
              </div>
            ) : null}

            {bodySlot ?? (
              <RichText
                content={body}
                className={cn(
                  'max-w-160',
                  '[&_h2]:scroll-mt-28 [&_h3]:scroll-mt-28',
                  'sm:[&>*+*]:mt-6',
                  '[&_h2]:mt-11 sm:[&_h2]:mt-12',
                  '[&_h3]:mt-9',
                )}
              />
            )}

            {legacyUrl || backHref ? (
              <footer className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-8 sm:mt-14">
                {backHref ? (
                  <ArrowLink href={backHref}>{backLabel}</ArrowLink>
                ) : null}
                {legacyUrl ? (
                  <a
                    href={legacyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent"
                  >
                    Legacy archive →
                  </a>
                ) : null}
              </footer>
            ) : null}
          </article>

          {aside ? (
            <aside className="min-w-0 lg:col-span-4">
              <div className="scrollbar-gutter-stable lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
                <div className="rounded-[1.35rem] border border-ink/8 bg-surface-subtle p-5 sm:rounded-[1.75rem] sm:p-6">
                  {aside}
                </div>
              </div>
            </aside>
          ) : (
            <aside className="hidden lg:col-span-4 lg:block" aria-hidden>
              <div className="mt-2 h-px w-16 bg-border" />
            </aside>
          )}
        </div>
      </Container>
    </Section>
  );
}

type VacancyAsideProps = {
  applyHref?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  deadline?: string | null;
};

export function VacancyAside({
  applyHref,
  email,
  whatsapp,
  deadline,
}: VacancyAsideProps) {
  return (
    <div className="space-y-5">
      <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
        Apply
      </p>
      {deadline ? (
        <p className="text-sm leading-relaxed text-body">
          <span className="font-semibold text-ink">Deadline</span>
          <br />
          {deadline}
        </p>
      ) : null}
      {applyHref ? (
        <Button
          href={applyHref}
          external={/^https?:\/\//i.test(applyHref)}
          variant="ink"
          size="md"
          className="w-full"
        >
          Apply online
        </Button>
      ) : null}
      {(email || whatsapp) && (
        <div className="space-y-2 border-t border-border pt-5 text-sm text-muted">
          <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
            Contact
          </p>
          {email ? (
            <p>
              <a
                href={`mailto:${email}`}
                className="font-medium text-accent hover:underline"
              >
                {email}
              </a>
            </p>
          ) : null}
          {whatsapp ? <p>WhatsApp: {whatsapp}</p> : null}
        </div>
      )}
    </div>
  );
}

type EventAsideProps = {
  when: string;
  where?: string | null;
  isOnline?: boolean;
  speakers?: string[];
  status?: 'upcoming' | 'past' | 'cancelled';
  registerHref?: string | null;
  watchHref?: string | null;
};

export function EventAside({
  when,
  where,
  isOnline,
  speakers,
  status = 'past',
  registerHref,
  watchHref,
}: EventAsideProps) {
  const primaryHref =
    watchHref || (status === 'upcoming' ? registerHref : null);
  const primaryLabel = watchHref
    ? 'Watch recording'
    : status === 'upcoming'
      ? 'Register'
      : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
          Event details
        </p>
        <p className="mt-1.5 font-instrument text-lg leading-snug text-ink">
          {status === 'upcoming'
            ? 'Session information'
            : status === 'cancelled'
              ? 'This session was cancelled'
              : 'Archive session'}
        </p>
      </div>

      <dl className="space-y-5 text-sm">
        <div className="border-b border-border/80 pb-4">
          <dt className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
            When
          </dt>
          <dd className="mt-1.5 font-medium leading-relaxed text-ink">{when}</dd>
        </div>
        {where || isOnline ? (
          <div className="border-b border-border/80 pb-4">
            <dt className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Where
            </dt>
            <dd className="mt-1.5 leading-relaxed text-body">
              {where || (isOnline ? 'Online' : null)}
            </dd>
          </div>
        ) : null}
        {speakers && speakers.length > 0 ? (
          <div>
            <dt className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Speakers
            </dt>
            <dd className="mt-1.5 space-y-1.5 leading-relaxed text-body">
              {speakers.map((speaker) => (
                <p key={speaker}>{speaker}</p>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>

      {primaryHref && primaryLabel ? (
        <Button
          href={primaryHref}
          external
          variant="ink"
          size="md"
          className="w-full"
        >
          {primaryLabel}
        </Button>
      ) : null}

      {watchHref && registerHref && status === 'past' ? (
        <ArrowLink href={registerHref} external>
          Registration form
        </ArrowLink>
      ) : null}

      {!watchHref && registerHref && status === 'past' ? (
        <p className="text-sm leading-relaxed text-muted">
          This session has ended. Registration is closed.
        </p>
      ) : null}
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { ImageFrame } from '@/components/ui/ImageFrame';
import { cn, formatDate } from '@/lib/utils';
import type { Activity, Event } from '@/types/content';

export type ActivityProgrammeItem = {
  routeSlug: string;
  label: string;
  activity: Activity;
  href: string;
};

type ActivitiesHubProps = {
  programmes: ActivityProgrammeItem[];
  relatedEvents: Event[];
  fallbackImage: string;
};

function MetaChip({
  children,
  onInk = false,
}: {
  children: React.ReactNode;
  onInk?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[0.625rem] font-semibold uppercase tracking-[0.1em] sm:px-3 sm:py-1 sm:text-[0.65rem] sm:tracking-[0.12em]',
        onInk
          ? 'border-paper/25 text-paper/75'
          : 'border-ink/12 text-ink/65',
      )}
    >
      {children}
    </span>
  );
}

/** Short focus line so each stream reads clearly at a glance. */
const STREAM_FOCUS: Record<string, string> = {
  'capacity-building': 'Training, funding, and mentorship',
  'research-talk': 'Dialogue, briefings, and partnerships',
  'awareness-campaign': 'Fieldwork, outreach, and community impact',
  'innovation-showcasing': 'Creative and literary initiatives',
};

function FeaturedProgrammeCard({
  item,
  eventCount,
  fallbackImage,
}: {
  item: ActivityProgrammeItem;
  eventCount: number;
  fallbackImage: string;
}) {
  const { activity, href, label } = item;
  const imageSrc = activity.imageUrl || fallbackImage;
  const focus =
    STREAM_FOCUS[activity.type] ?? 'Public programme stream at BKSR';

  return (
    <article className="min-w-0 overflow-hidden rounded-[1.35rem] bg-ink p-2.5 sm:rounded-[2.5rem] sm:p-4 lg:p-5">
      <div className="grid gap-3 sm:gap-5 lg:grid-cols-12 lg:items-stretch lg:gap-6">
        <Link
          href={href}
          className="relative block min-w-0 overflow-hidden rounded-[1.1rem] lg:col-span-5 sm:rounded-[1.75rem]"
          aria-hidden
        >
          <ImageFrame
            src={imageSrc}
            alt=""
            aspect="video"
            sizes="(max-width: 1024px) 100vw, 42vw"
            frameClassName="border-0 bg-[#d9d9d9] rounded-[1.1rem] sm:rounded-[1.75rem]"
            className="object-cover"
          />
          <span className="pointer-events-none absolute left-3 top-3 sm:left-4 sm:top-4">
            <span className="inline-flex rounded-[1rem] bg-paper/95 px-3 py-2 font-display text-2xl tabular-nums leading-none text-ink sm:rounded-[1.25rem] sm:px-4 sm:py-3 sm:text-4xl">
              01
            </span>
          </span>
        </Link>

        <div className="flex min-w-0 flex-col justify-center px-1 pb-1 pt-0.5 text-paper sm:px-3 lg:col-span-7 lg:px-4 lg:py-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <MetaChip onInk>{label}</MetaChip>
            {eventCount ? (
              <MetaChip onInk>
                {eventCount} linked{' '}
                {eventCount === 1 ? 'gathering' : 'gatherings'}
              </MetaChip>
            ) : (
              <MetaChip onInk>Programme stream</MetaChip>
            )}
          </div>

          <p className="mt-3 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-paper/55 sm:mt-4">
            {focus}
          </p>

          <h2 className="mt-1.5 text-balance font-instrument text-[1.45rem] font-medium leading-snug text-paper sm:mt-2 sm:text-4xl lg:text-[2.65rem] lg:leading-tight">
            <Link
              href={href}
              className="break-words transition-colors hover:text-white"
            >
              {activity.title}
            </Link>
          </h2>

          <p className="mt-2.5 max-w-2xl font-instrument text-sm leading-relaxed text-paper/80 sm:mt-4 sm:text-lg">
            {activity.summary}
          </p>

          <div className="mt-5 sm:mt-8">
            <Button
              href={href}
              variant="onInk"
              size="md"
              className="w-full font-normal tracking-normal sm:w-auto sm:h-[3.25rem] sm:px-8 sm:text-[0.9375rem]"
            >
              Explore programme
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Compact homepage-style card for the More programmes grid. */
function CompactProgrammeCard({
  item,
  index,
  eventCount,
  fallbackImage,
}: {
  item: ActivityProgrammeItem;
  index: number;
  eventCount: number;
  fallbackImage: string;
}) {
  const { activity, href, label } = item;
  const imageSrc = activity.imageUrl || fallbackImage;
  const focus =
    STREAM_FOCUS[activity.type] ?? 'Public programme stream at BKSR';
  const indexLabel = String(index + 1).padStart(2, '0');

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-[1.25rem] bg-accent p-2 sm:rounded-[1.75rem] sm:p-2.5">
      <Link
        href={href}
        className="relative block min-w-0 overflow-hidden rounded-[1rem] sm:rounded-[1.35rem]"
        aria-hidden
      >
        <ImageFrame
          src={imageSrc}
          alt=""
          aspect="video"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          frameClassName="border-0 bg-[#d9d9d9] rounded-[1rem] sm:rounded-[1.35rem]"
          className="object-cover"
        />
        <span className="pointer-events-none absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
          <span className="inline-flex rounded-xl bg-paper/95 px-2.5 py-1.5 font-display text-xl tabular-nums leading-none text-ink sm:rounded-[1rem] sm:px-3 sm:py-2 sm:text-2xl">
            {indexLabel}
          </span>
        </span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col px-2 pb-2 pt-3 text-paper sm:px-3 sm:pb-3 sm:pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <MetaChip onInk>{label}</MetaChip>
          {eventCount ? (
            <MetaChip onInk>
              {eventCount} linked
            </MetaChip>
          ) : null}
        </div>

        <p className="mt-2.5 font-sans text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-paper/55">
          {focus}
        </p>

        <h3 className="mt-1 text-balance font-instrument text-xl font-medium leading-snug text-paper sm:text-2xl">
          <Link
            href={href}
            className="break-words transition-colors hover:text-white"
          >
            {activity.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-3 font-instrument text-sm leading-relaxed text-paper/80">
          {activity.summary}
        </p>

        <div className="mt-auto pt-4">
          <Button
            href={href}
            variant="onInk"
            size="sm"
            className="w-full font-normal tracking-normal sm:w-auto"
          >
            View programme
          </Button>
        </div>
      </div>
    </article>
  );
}

function RelatedEventCard({ event }: { event: Event }) {
  return (
    <li className="min-w-0">
      <Link
        href={`/events/${event.slug}`}
        className="group flex h-full min-w-0 gap-3 overflow-hidden rounded-[1.25rem] border border-ink/8 bg-surface-subtle p-3 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-ink/18 hover:bg-white motion-reduce:hover:translate-y-0 sm:gap-4 sm:rounded-[1.5rem] sm:p-4"
      >
        <span className="flex min-w-[3.5rem] shrink-0 flex-col items-center justify-center rounded-[1rem] bg-ink/90 px-2 py-2 text-center text-paper sm:min-w-[4.25rem]">
          <span className="font-sans text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-white/70">
            {formatDate(event.startAt, 'MMM')}
          </span>
          <span className="mt-0.5 font-display text-2xl leading-none sm:text-3xl">
            {formatDate(event.startAt, 'd')}
          </span>
          <span className="mt-0.5 font-sans text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-white/55">
            {formatDate(event.startAt, 'yyyy')}
          </span>
        </span>
        <span className="min-w-0 flex-1 py-0.5">
          <span className="flex flex-wrap gap-1.5">
            <MetaChip>
              {event.eventStatus === 'upcoming' ? 'Upcoming' : 'Archive'}
            </MetaChip>
            {event.isOnline ? <MetaChip>Online</MetaChip> : null}
          </span>
          <span className="mt-1.5 block text-balance font-instrument text-[0.95rem] font-medium leading-snug text-ink transition-colors group-hover:text-accent sm:text-lg">
            {event.title}
          </span>
        </span>
      </Link>
    </li>
  );
}

export function ActivitiesHub({
  programmes,
  relatedEvents,
  fallbackImage,
}: ActivitiesHubProps) {
  const [featured, ...rest] = programmes;

  return (
    <div className="min-w-0 space-y-8 sm:space-y-12 lg:space-y-14">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
          Programme portfolio
        </p>
        <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">
          {programmes.length}{' '}
          {programmes.length === 1 ? 'stream' : 'streams'}
          {relatedEvents.length
            ? ` · ${relatedEvents.length} linked ${
                relatedEvents.length === 1 ? 'gathering' : 'gatherings'
              }`
            : null}
        </p>
      </div>

      {featured ? (
        <FeaturedProgrammeCard
          item={featured}
          eventCount={featured.activity.relatedEventIds?.length ?? 0}
          fallbackImage={fallbackImage}
        />
      ) : null}

      {rest.length ? (
        <section
          className="min-w-0 space-y-4 sm:space-y-5"
          aria-labelledby="more-programmes-heading"
        >
          <header className="min-w-0">
            <h3
              id="more-programmes-heading"
              className="font-display text-xl text-ink sm:text-3xl"
            >
              More programmes
            </h3>
          </header>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-5">
            {rest.map((item, i) => (
              <li key={item.routeSlug} className="min-w-0">
                <CompactProgrammeCard
                  item={item}
                  index={i + 1}
                  eventCount={item.activity.relatedEventIds?.length ?? 0}
                  fallbackImage={fallbackImage}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {relatedEvents.length ? (
        <section className="min-w-0" aria-labelledby="activities-events-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2 sm:mb-6 sm:gap-4">
            <div className="min-w-0">
              <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
                From these programmes
              </p>
              <h2
                id="activities-events-heading"
                className="mt-1 font-display text-xl text-ink sm:text-3xl"
              >
                Related events
              </h2>
            </div>
            <ArrowLink href="/events">All events</ArrowLink>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {relatedEvents.map((event) => (
              <RelatedEventCard key={event.id} event={event} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

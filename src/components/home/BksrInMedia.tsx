'use client';

import { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImageFrame } from '@/components/ui/ImageFrame';
import { getMediaAppearanceCoverUrl } from '@/lib/content/prototype-media';
import { cn, formatDate } from '@/lib/utils';

export type MediaPublication = {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  year: number;
  venue?: string | null;
  publishedAt?: string | null;
  abstract?: string | null;
  citation: string;
  coverImageUrl?: string | null;
  language?: string | null;
  url?: string | null;
};

type BksrInMediaProps = {
  items: MediaPublication[];
};

const FOCUS_Y = 0.46;
const DESKTOP_QUERY = '(min-width: 1024px)';

type MediaChannel = 'Newspaper' | 'Television' | 'YouTube';

/** Distinct channel strips — high contrast, not CTA navy pills. */
const CHANNEL_STRIP: Record<
  MediaChannel,
  { label: string; className: string }
> = {
  Newspaper: {
    label: 'Newspaper',
    className: 'bg-[#1a4a7a] text-[#f4f7fb]',
  },
  Television: {
    label: 'Television',
    className: 'bg-[#5a4578] text-[#f6f3fb]',
  },
  YouTube: {
    label: 'YouTube',
    className: 'bg-[#a33d3d] text-[#fdf6f6]',
  },
};

function mediaChannel(publication: MediaPublication): MediaChannel {
  const url = publication.url?.toLowerCase() ?? '';
  const venue = publication.venue?.toLowerCase() ?? '';
  if (url.includes('youtu.be') || url.includes('youtube.com')) {
    return 'YouTube';
  }
  if (
    url.includes('jamuna.tv') ||
    venue.includes('maasranga') ||
    venue.includes('jamuna') ||
    venue.includes('television')
  ) {
    return 'Television';
  }
  return 'Newspaper';
}

/** Research-style label strip along the bottom edge of media. */
function ChannelStrip({
  channel,
  compact = false,
}: {
  channel: MediaChannel;
  compact?: boolean;
}) {
  const style = CHANNEL_STRIP[channel];
  return (
    <span
      className={cn(
        'absolute inset-x-0 bottom-0 z-10 flex items-center justify-center text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        compact ? 'px-1 py-1.5' : 'px-2 py-2.5',
        style.className,
      )}
    >
      <span
        className={cn(
          'font-sans font-semibold uppercase leading-none tracking-[0.14em]',
          compact ? 'text-[0.5625rem] sm:text-[0.625rem]' : 'text-[0.6875rem]',
        )}
      >
        {style.label}
      </span>
    </span>
  );
}

function dateLabel(publication: MediaPublication) {
  if (publication.publishedAt) {
    return formatDate(publication.publishedAt, 'd MMM yyyy');
  }
  return String(publication.year);
}

function outletLine(publication: MediaPublication) {
  return [publication.venue, dateLabel(publication)].filter(Boolean).join(' · ');
}

/** Supporting blurb — never repeats the outlet already shown in outletLine. */
function summaryLine(publication: MediaPublication) {
  const text = publication.abstract?.trim();
  if (!text) return null;
  return text;
}

function clippingHref(item: MediaPublication) {
  return item.url?.trim() || `/publications/${item.slug}`;
}

function isExternalClipping(item: MediaPublication) {
  return Boolean(item.url?.trim());
}

function ClippingLink({
  item,
  className,
  children,
}: {
  item: MediaPublication;
  className?: string;
  children: React.ReactNode;
}) {
  const href = clippingHref(item);
  const external = isExternalClipping(item);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

/** Small screens: horizontal snap deck — no sticky / focus-line choreography. */
function MediaMobileDeck({ feed }: { feed: MediaPublication[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const syncIndex = () => {
    const root = scrollerRef.current;
    if (!root) return;
    const slide = root.children[0] as HTMLElement | undefined;
    if (!slide) return;
    const step = slide.offsetWidth + 16;
    if (step <= 0) return;
    const next = Math.round(root.scrollLeft / step);
    setIndex(Math.max(0, Math.min(feed.length - 1, next)));
  };

  const goTo = (next: number) => {
    const root = scrollerRef.current;
    const clamped = Math.max(0, Math.min(feed.length - 1, next));
    const slide = root?.children[clamped] as HTMLElement | undefined;
    if (root && slide) {
      root.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
    }
    setIndex(clamped);
  };

  return (
    <div className="lg:hidden">
      <div className="mb-4 flex items-end justify-between gap-3">
        <p className="font-sans text-[0.6875rem] font-semibold tracking-[0.12em] text-ink/55">
          FROM THE PRESS
        </p>
        <p className="font-sans text-[0.6875rem] font-medium tabular-nums text-ink/45">
          {String(index + 1).padStart(2, '0')} /{' '}
          {String(feed.length).padStart(2, '0')}
        </p>
      </div>

      <ul
        ref={scrollerRef}
        data-lenis-prevent
        onScroll={syncIndex}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Press clippings"
      >
        {feed.map((item, i) => {
          const summary = summaryLine(item);
          return (
          <li
            key={item.id}
            className="w-[min(100%,20.5rem)] shrink-0 snap-start sm:w-[22rem]"
          >
            <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-ink/18 bg-[#f4f7fa] p-2">
              <div className="relative overflow-hidden rounded-[1.15rem] bg-white">
                {(() => {
                  const cover = getMediaAppearanceCoverUrl(item);
                  return cover ? (
                    <ImageFrame
                      src={cover}
                      alt=""
                      aspect="video"
                      sizes="(max-width: 640px) 85vw, 352px"
                      frameClassName="border-0"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex aspect-video items-end justify-between bg-surface-subtle p-3">
                      <span className="font-sans text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted">
                        {item.venue ?? 'Press'}
                      </span>
                      <span className="font-display text-2xl leading-none tabular-nums text-ink/25">
                        {String(item.year).slice(2)}
                      </span>
                    </span>
                  );
                })()}
                <ChannelStrip channel={mediaChannel(item)} />
              </div>

              <div className="flex flex-1 flex-col gap-3 px-3 pb-3 pt-4 text-ink">
                <p className="font-sans text-sm text-ink/55">
                  {outletLine(item)}
                </p>
                <h3 className="font-sans text-lg font-semibold leading-snug tracking-tight text-ink">
                  <ClippingLink
                    item={item}
                    className="transition-colors hover:text-accent"
                  >
                    {item.title}
                  </ClippingLink>
                </h3>
                {summary ? (
                  <p className="line-clamp-2 font-sans text-sm leading-relaxed text-ink/70">
                    {summary}
                  </p>
                ) : null}
                <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                  <p className="min-w-0 truncate font-sans text-sm text-ink/55">
                    {item.authors[0] ?? ''}
                  </p>
                  <ClippingLink
                    item={item}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 font-sans text-sm font-medium text-paper transition-colors hover:bg-accent"
                  >
                    View
                    <ArrowUpRight className="size-3.5" strokeWidth={1.75} aria-hidden />
                  </ClippingLink>
                </div>
              </div>
            </article>
          </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5" aria-hidden>
          {feed.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Go to clipping ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'h-1.5 rounded-full transition-[width,background-color] duration-300',
                i === index ? 'w-6 bg-ink' : 'w-1.5 bg-ink/25',
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous clipping"
            disabled={index <= 0}
            onClick={() => goTo(index - 1)}
            className="inline-flex size-10 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Next clipping"
            disabled={index >= feed.length - 1}
            onClick={() => goTo(index + 1)}
            className="inline-flex size-10 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowRight className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Desktop: sticky preview + scroll-synced list. */
function MediaDesktopBoard({ feed }: { feed: MediaPublication[] }) {
  const [activeId, setActiveId] = useState(feed[0]?.id ?? '');
  const [focusLine, setFocusLine] = useState({
    left: 0,
    visible: false,
  });
  const rowRefs = useRef<Map<string, HTMLElement>>(new Map());
  const listColRef = useRef<HTMLDivElement>(null);
  const feedIds = feed.map((item) => item.id).join('|');
  const activeIdRef = useRef(activeId);
  const frameRef = useRef(0);

  const active = feed.find((item) => item.id === activeId) ?? feed[0];
  const activeIndex = Math.max(
    0,
    feed.findIndex((item) => item.id === active?.id),
  );

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const syncFocus = () => {
    if (!window.matchMedia(DESKTOP_QUERY).matches) {
      setFocusLine((prev) => (prev.visible ? { left: prev.left, visible: false } : prev));
      return;
    }

    const triggerY = window.innerHeight * FOCUS_Y;
    let crossingId = '';
    let crossingScore = Number.POSITIVE_INFINITY;
    let nearestId = '';
    let nearestDist = Number.POSITIVE_INFINITY;

    rowRefs.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - triggerY);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestId = id;
      }

      if (rect.top <= triggerY && rect.bottom >= triggerY) {
        const edgeBias = Math.min(
          Math.abs(rect.top - triggerY),
          Math.abs(rect.bottom - triggerY),
        );
        if (edgeBias < crossingScore) {
          crossingScore = edgeBias;
          crossingId = id;
        }
      }
    });

    const nextId = crossingId || nearestId;
    if (nextId && nextId !== activeIdRef.current) {
      setActiveId(nextId);
    }

    const col = listColRef.current;
    if (col) {
      const rect = col.getBoundingClientRect();
      // Only show the spinner tip while the focus Y actually cuts through the list column
      // (keeps it off the section title / intro above the board)
      const lineInsideList =
        triggerY >= rect.top + 8 && triggerY <= rect.bottom - 8;
      setFocusLine({
        left: rect.left,
        visible: lineInsideList,
      });
    }
  };

  const scheduleSync = () => {
    if (frameRef.current) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = 0;
      syncFocus();
    });
  };

  useLenis(() => {
    scheduleSync();
  });

  useEffect(() => {
    if (feed.length < 1) return;

    syncFocus();
    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', scheduleSync);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on list identity
  }, [feedIds, feed.length]);

  if (!active) return null;

  return (
    <div className="hidden lg:block">
      {focusLine.visible ? (
        <div
          className="pointer-events-none fixed z-30"
          style={{
            top: `${FOCUS_Y * 100}%`,
            left: focusLine.left,
          }}
          aria-hidden
        >
          {/* Spinner-style trigger in the column gutter — not over the cards */}
          <div className="flex -translate-x-[calc(100%+0.15rem)] -translate-y-1/2 items-center gap-1">
            <span className="size-1.5 shrink-0 rounded-full bg-ink" />
            <svg
              width="14"
              height="18"
              viewBox="0 0 14 18"
              className="shrink-0 text-ink drop-shadow-[0_1px_2px_rgba(13,39,69,0.25)]"
            >
              <path fill="currentColor" d="M0 0.5 L14 9 L0 17.5 Z" />
            </svg>
          </div>
        </div>
      ) : null}

      <div className="grid min-w-0 items-start gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:gap-16">
        <aside className="sticky top-[22vh] z-10 min-w-0 self-start">
          <div className="flex flex-col gap-3 rounded-[1.875rem] bg-ink p-2.5">
            <ClippingLink
              item={active}
              className="group relative block overflow-hidden rounded-[1.35rem] bg-[#0b233f]"
            >
              {(() => {
                const cover = getMediaAppearanceCoverUrl(active);
                return cover ? (
                  <ImageFrame
                    key={active.id}
                    src={cover}
                    alt=""
                    aspect="portrait"
                    sizes="384px"
                    frameClassName="border-0"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <span key={active.id} className="flex aspect-3/4 items-end justify-between p-5">
                    <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-paper/55">
                      {active.venue ?? 'Press'}
                    </span>
                    <span className="font-display text-4xl leading-none tabular-nums text-paper/30">
                      {String(active.year).slice(2)}
                    </span>
                  </span>
                );
              })()}
              <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/55 to-ink/10" />
              <div className="absolute inset-x-0 bottom-0 space-y-2 px-6 pb-11 pt-6">
                <p className="line-clamp-4 font-sans text-xl font-semibold leading-snug text-paper">
                  {active.title}
                </p>
                <p className="font-sans text-sm text-paper/70">
                  {outletLine(active)}
                </p>
              </div>
              <ChannelStrip channel={mediaChannel(active)} />
            </ClippingLink>

            <div className="px-1.5 pb-1.5 pt-0.5">
              <Button
                href={clippingHref(active)}
                external={isExternalClipping(active)}
                variant="onInk"
                size="md"
                className="w-full font-sans font-medium tracking-normal"
                withArrow
              >
                Open clipping
              </Button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 px-1">
            <p className="font-sans text-[0.6875rem] font-semibold tracking-[0.12em] text-ink/55">
              IN FOCUS
            </p>
            <p className="font-sans text-[0.6875rem] font-medium tabular-nums text-ink/45">
              {String(activeIndex + 1).padStart(2, '0')} /{' '}
              {String(feed.length).padStart(2, '0')}
            </p>
          </div>
          <div
            className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#e5ebf3]"
            aria-hidden
          >
            <div
              className="h-1 rounded-full bg-ink transition-[width] duration-300 ease-out"
              style={{
                width: `${((activeIndex + 1) / feed.length) * 100}%`,
              }}
            />
          </div>
        </aside>

        <div ref={listColRef} className="relative min-w-0">
          <p className="mb-6 font-sans text-[0.6875rem] font-semibold tracking-[0.12em] text-ink/55">
            FROM THE PRESS
          </p>

          <ul className="flex min-w-0 flex-col gap-5">
            {feed.map((item, index) => {
              const isActive = item.id === active.id;
              const summary = summaryLine(item);
              return (
                <li
                  key={item.id}
                  data-media-id={item.id}
                  ref={(el) => {
                    if (el) rowRefs.current.set(item.id, el);
                    else rowRefs.current.delete(item.id);
                  }}
                  className="min-w-0"
                >
                  <article
                    className={cn(
                      'flex min-w-0 flex-row items-stretch gap-5 rounded-[1.875rem] p-5 transition-[background-color,box-shadow] duration-300',
                      isActive
                        ? 'bg-[#e5ebf3] shadow-[0_16px_36px_-24px_rgba(13,39,69,0.55)]'
                        : 'bg-surface-subtle hover:bg-[#e5ebf3]',
                    )}
                  >
                    <div className="relative w-28 shrink-0 overflow-hidden rounded-[1.15rem]">
                      {(() => {
                        const cover = getMediaAppearanceCoverUrl(item);
                        return cover ? (
                          <ImageFrame
                            src={cover}
                            alt=""
                            aspect="square"
                            sizes="112px"
                            frameClassName="border-0 bg-surface"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex aspect-square flex-col items-center justify-center bg-surface-subtle p-2">
                            <span className="font-sans text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-muted">
                              {item.venue ?? 'Press'}
                            </span>
                            <span className="mt-1 font-display text-lg leading-none tabular-nums text-ink/25">
                              {String(item.year).slice(2)}
                            </span>
                          </span>
                        );
                      })()}
                      <ChannelStrip
                        channel={mediaChannel(item)}
                        compact
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                          <span
                            className={cn(
                              'font-display text-[1.75rem] leading-none tracking-tight',
                              isActive ? 'text-ink' : 'text-ink/35',
                            )}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <p className="min-w-0 font-sans text-sm text-ink/60">
                            {outletLine(item)}
                          </p>
                        </div>

                        <h3 className="mt-3 font-sans text-xl font-semibold leading-snug tracking-tight text-ink">
                          <ClippingLink
                            item={item}
                            className="transition-colors hover:text-accent"
                          >
                            {item.title}
                          </ClippingLink>
                        </h3>

                        {summary ? (
                          <p className="mt-2 line-clamp-2 font-sans text-sm leading-relaxed text-ink/75">
                            {summary}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex min-w-0 items-center justify-between gap-4">
                        {item.authors[0] ? (
                          <p className="min-w-0 truncate font-sans text-sm font-medium text-ink/70">
                            {item.authors[0]}
                          </p>
                        ) : (
                          <span />
                        )}
                        <ClippingLink
                          item={item}
                          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink py-2.5 pl-5 pr-4 font-sans text-sm font-medium text-paper transition-colors hover:bg-accent"
                        >
                          View clipping
                          <ArrowUpRight
                            className="size-4 shrink-0"
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        </ClippingLink>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Desktop: sticky preview + focus-line list.
 * Mobile / tablet: swipe deck (no sticky dual-column choreography).
 */
export function BksrInMedia({ items }: BksrInMediaProps) {
  const feed = items.slice(0, 6);

  if (!feed.length) return null;

  return (
    <div className="mt-10 lg:mt-12">
      <MediaMobileDeck feed={feed} />
      <MediaDesktopBoard feed={feed} />

      <div className="mt-10 flex justify-center sm:mt-12">
        <Button
          href="/media"
          variant="ink"
          size="lg"
          className="w-full max-w-xs sm:w-auto"
          withArrow
        >
          View all coverage
        </Button>
      </div>
    </div>
  );
}

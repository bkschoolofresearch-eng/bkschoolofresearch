'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import gsap from 'gsap';
import { Reveal } from '@/components/motion/Reveal';
import { PersonPortrait } from '@/components/home/PersonPortrait';
import { EditorialHeading } from '@/components/ui/EditorialHeading';
import { cn } from '@/lib/utils';

export type ResearcherSayItem = {
  imageSrc: string;
  quote: string;
  name: string;
  role: string;
};

type ResearcherSayProps = {
  items: ResearcherSayItem[];
  title: string;
  subtitle?: string;
  className?: string;
};

const GAP_DESKTOP = 80;
const GAP_MOBILE = 16;
/** Closest gap while pushing — almost kisses, never stacks. */
const MIN_GAP_PX = 22;
/** How many cards participate in the visible push wave. */
const WAVE_CHAIN = 3;
const AUTOPLAY_MS = 4800;
/** Full step duration — includes the short push-wave cascade. */
const FLOW_TWEEN_S = 1.1;
/** Soften the overall step so it doesn't feel robotic. */
const FLOW_EASE = 'power1.inOut';
const NARROW_QUERY = '(max-width: 767px)';

function subscribeNarrow(onChange: () => void) {
  const media = window.matchMedia(NARROW_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function useIsNarrow() {
  return useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
}

function SectionIntro({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="mx-auto w-full max-w-6xl px-4 text-center sm:px-6 lg:px-8">
      <EditorialHeading
        as="h2"
        size="xl"
        className="text-pretty lg:text-nowrap"
      >
        {title}
      </EditorialHeading>
      {subtitle ? (
        <p className="mx-auto mt-3 max-w-5xl text-sm leading-relaxed text-muted sm:mt-4 sm:text-lg md:text-xl lg:max-w-none lg:whitespace-nowrap lg:text-lg xl:text-xl">
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}

function QuoteBody({
  item,
  onReadMore,
}: {
  item: ResearcherSayItem;
  onReadMore: (item: ResearcherSayItem) => void;
}) {
  return (
    <article className="flex h-full flex-col justify-between rounded-[1.5rem] bg-[#0b233f] p-4 text-paper sm:rounded-[1.875rem] sm:p-5">
      <div>
        <p className="line-clamp-6 font-sans text-sm leading-6 text-paper sm:line-clamp-7 sm:text-lg sm:leading-8">
          {item.quote}
        </p>
        <button
          type="button"
          onClick={() => onReadMore(item)}
          className="mt-2 font-sans text-sm font-semibold text-paper underline decoration-paper/50 underline-offset-4 transition-colors hover:text-white"
        >
          Read more
        </button>
      </div>
      <div className="mt-6 flex items-center gap-2.5 sm:mt-0">
        <div className="relative h-[56px] w-[48px] shrink-0 overflow-hidden rounded-[6px] bg-surface sm:h-[70px] sm:w-[60px]">
          <PersonPortrait
            src={item.imageSrc}
            alt=""
            sizes="60px"
            className="object-cover grayscale"
          />
        </div>
        <div className="min-w-0 text-paper">
          <p className="font-sans text-base font-medium leading-6 sm:text-xl sm:leading-7">
            {item.name}
          </p>
          <p className="mt-0.5 font-sans text-sm leading-5 text-paper/80 sm:mt-1 sm:text-base sm:leading-6">
            {item.role}
          </p>
        </div>
      </div>
    </article>
  );
}

function QuoteBodyCompact({
  item,
  onReadMore,
}: {
  item: ResearcherSayItem;
  onReadMore: (item: ResearcherSayItem) => void;
}) {
  return (
    <article className="flex flex-col justify-between gap-4 rounded-[1.25rem] bg-[#0b233f] p-3.5 text-paper">
      <div>
        <p className="line-clamp-5 font-sans text-sm leading-6 text-paper">
          {item.quote}
        </p>
        <button
          type="button"
          onClick={() => onReadMore(item)}
          className="mt-2 font-sans text-xs font-semibold text-paper underline decoration-paper/50 underline-offset-4 transition-colors hover:text-white"
        >
          Read more
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative h-10 w-9 shrink-0 overflow-hidden rounded-[5px] bg-surface">
          <PersonPortrait
            src={item.imageSrc}
            alt=""
            sizes="36px"
            className="object-cover grayscale"
          />
        </div>
        <div className="min-w-0 text-paper">
          <p className="font-sans text-sm font-medium leading-5">{item.name}</p>
          <p className="mt-0.5 font-sans text-xs leading-4 text-paper/80">
            {item.role}
          </p>
        </div>
      </div>
    </article>
  );
}

function TrackCardsStacked({
  items,
  keyPrefix,
  onReadMore,
}: {
  items: ResearcherSayItem[];
  keyPrefix: string;
  onReadMore: (item: ResearcherSayItem) => void;
}) {
  return (
    <>
      {items.map((item, index) => (
        <li
          key={`${keyPrefix}-${item.imageSrc}-stack-${index}`}
          data-inchworm-card
          className="flex w-[min(100vw-2.5rem,17.5rem)] shrink-0 flex-col gap-2.5 will-change-transform"
        >
          <div className="relative aspect-[3/3.4] w-full overflow-hidden rounded-[1.25rem] bg-surface">
            <PersonPortrait
              src={item.imageSrc}
              alt=""
              sizes="(max-width: 767px) 70vw, 280px"
              className="object-cover grayscale"
            />
          </div>
          <QuoteBodyCompact item={item} onReadMore={onReadMore} />
        </li>
      ))}
    </>
  );
}

function TrackCardsDesktop({
  items,
  keyPrefix,
  onReadMore,
}: {
  items: ResearcherSayItem[];
  keyPrefix: string;
  onReadMore: (item: ResearcherSayItem) => void;
}) {
  return (
    <>
      {items.flatMap((item, index) => [
        <li
          key={`${keyPrefix}-${item.imageSrc}-photo-${index}`}
          data-inchworm-card
          className="relative aspect-412/531 w-[min(78vw,20rem)] shrink-0 overflow-hidden rounded-[1.875rem] bg-surface will-change-transform"
        >
          <PersonPortrait
            src={item.imageSrc}
            alt=""
            sizes="320px"
            className="object-cover grayscale"
          />
        </li>,
        <li
          key={`${keyPrefix}-${item.imageSrc}-quote-${index}`}
          data-inchworm-card
          className="aspect-412/531 w-[min(78vw,20rem)] shrink-0 will-change-transform"
        >
          <QuoteBody item={item} onReadMore={onReadMore} />
        </li>,
      ])}
    </>
  );
}

function NavButton({
  label,
  onClick,
  mirrored,
}: {
  label: string;
  onClick: () => void;
  mirrored?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full bg-ink p-2.5 text-paper transition-colors hover:bg-accent"
    >
      {mirrored ? (
        <ArrowLeft className="size-7.5" strokeWidth={1.5} aria-hidden />
      ) : (
        <ArrowRight className="size-7.5" strokeWidth={1.5} aria-hidden />
      )}
    </button>
  );
}

function readX(el: HTMLElement) {
  return Number(gsap.getProperty(el, 'x')) || 0;
}

function syncClones(originals: HTMLElement[], clones: HTMLElement[]) {
  const count = Math.min(originals.length, clones.length);
  for (let i = 0; i < count; i += 1) {
    gsap.set(clones[i], { x: readX(originals[i]) });
  }
}

/**
 * Video inchworm paint: the rightmost on-screen card leads, gap compresses,
 * then pushes leftward through a short wave. Cards outside the wave share
 * the wave edge (pack behind / lead ahead) — never a full-row accordion.
 *
 * Linear local progress ⇒ peak adjacent lead ≈ gap − minGap.
 */
function paintInchworm(
  originals: HTMLElement[],
  clones: HTMLElement[],
  baseX: number,
  progress: number,
  deltaX: number,
  gapPx: number,
  movingLeft: boolean,
  anchorIndex: number,
) {
  const n = originals.length;
  if (!n) return;

  const t = Math.min(1, Math.max(0, progress));
  const maxLead = Math.max(8, gapPx - MIN_GAP_PX);
  const adjLag = Math.min(0.22, Math.max(0.05, maxLead / Math.abs(deltaX || 1)));
  const chain = Math.min(WAVE_CHAIN, n);
  const span = 1 + (chain - 1) * adjLag;
  const timelineT = t * span;
  const anchor = Math.min(Math.max(anchorIndex, 0), n - 1);

  for (let i = 0; i < n; i += 1) {
    // Distance from the on-screen leading edge of the wave.
    const distFromLeader = movingLeft
      ? Math.max(0, anchor - i)
      : Math.max(0, i - anchor);
    const delay = Math.min(distFromLeader, chain - 1) * adjLag;
    const localT = Math.min(1, Math.max(0, timelineT - delay));
    gsap.set(originals[i], { x: baseX + deltaX * localT });
  }
  syncClones(originals, clones);
}

function visibleAnchorIndex(
  originals: HTMLElement[],
  viewport: HTMLElement | null,
  movingLeft: boolean,
) {
  if (!viewport || !originals.length) {
    return movingLeft ? originals.length - 1 : 0;
  }
  const vr = viewport.getBoundingClientRect();
  if (movingLeft) {
    for (let i = originals.length - 1; i >= 0; i -= 1) {
      const r = originals[i].getBoundingClientRect();
      if (r.left < vr.right - 12 && r.right > vr.left + 12) return i;
    }
    return originals.length - 1;
  }
  for (let i = 0; i < originals.length; i += 1) {
    const r = originals[i].getBoundingClientRect();
    if (r.left < vr.right - 12 && r.right > vr.left + 12) return i;
  }
  return 0;
}

/**
 * Infinite auto inchworm + always-on manual pager (circular).
 * Motion matches Made With GSAP inchworm: trailing card leads, gap
 * compresses, then pushes — independent stagger, not a rigid slide.
 */
export function ResearcherSay({
  items,
  title,
  subtitle,
  className,
}: ResearcherSayProps) {
  const isNarrow = useIsNarrow();
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  const metricsRef = useRef({
    flowStep: 320,
    loopWidth: 0,
    gapPx: GAP_DESKTOP,
  });
  const logicalIndexRef = useRef(0);
  const inViewRef = useRef(false);
  const pausedRef = useRef(false);
  const tweenRef = useRef<gsap.core.Timeline | null>(null);

  const [logicalIndex, setLogicalIndex] = useState(0);
  const [activeQuote, setActiveQuote] = useState<ResearcherSayItem | null>(null);
  const quoteTitleId = useId();
  const closeQuoteRef = useRef<HTMLButtonElement>(null);

  const cardsPerFlow = isNarrow ? 1 : 2;
  const loopSteps = items.length;

  const getCardSets = () => {
    const track = trackRef.current;
    if (!track) {
      return { all: [] as HTMLElement[], originals: [] as HTMLElement[], clones: [] as HTMLElement[] };
    }
    const all = gsap.utils.toArray<HTMLElement>(
      track.querySelectorAll('[data-inchworm-card]'),
    );
    const half = Math.floor(all.length / 2);
    return {
      all,
      originals: all.slice(0, half),
      clones: all.slice(half),
    };
  };

  const setAllX = (x: number) => {
    const { all } = getCardSets();
    gsap.set(all, { x });
  };

  const animateStep = (
    direction: -1 | 1,
    onSettled?: (logical: number) => void,
  ) => {
    const { originals, clones } = getCardSets();
    if (!originals.length) return;

    const { flowStep, gapPx, loopWidth } = metricsRef.current;
    if (flowStep <= 0) return;

    tweenRef.current?.kill();

    const from = logicalIndexRef.current;
    let targetLogical = from + direction;

    // Seamless loop: when wrapping backward from 0, jump into the clone
    // twin first so motion continues in the same visual direction.
    if (direction === -1 && from === 0 && loopWidth > 0) {
      const jumped = -loopWidth;
      gsap.set(originals, { x: jumped });
      syncClones(originals, clones);
      targetLogical = loopSteps - 1;
    }

    const crossesIntoClone = direction === 1 && from === loopSteps - 1;
    const movingLeft = direction === 1;
    const baseX = readX(originals[0]);
    // If cards aren't uniform (shouldn't happen at rest), prefer logical base.
    const startX = originals.every((el) => Math.abs(readX(el) - baseX) < 1)
      ? baseX
      : -from * flowStep;
    if (startX !== baseX) {
      gsap.set(originals, { x: startX });
      syncClones(originals, clones);
    }

    const deltaX = -direction * flowStep;
    const proxy = { t: 0 };
    const anchor = visibleAnchorIndex(originals, viewportRef.current, movingLeft);

    const tl = gsap.timeline({
      onComplete: () => {
        if (crossesIntoClone && loopWidth > 0) {
          targetLogical = 0;
        }

        const settledX = -targetLogical * flowStep;
        gsap.set(originals, { x: settledX });
        syncClones(originals, clones);

        logicalIndexRef.current = targetLogical;
        onSettled?.(targetLogical);
      },
    });

    tl.to(proxy, {
      t: 1,
      duration: FLOW_TWEEN_S,
      ease: FLOW_EASE,
      onUpdate: () => {
        paintInchworm(
          originals,
          clones,
          startX,
          proxy.t,
          deltaX,
          gapPx,
          movingLeft,
          anchor,
        );
      },
    });

    tweenRef.current = tl;
  };

  const animateStepRef = useRef(animateStep);
  useEffect(() => {
    animateStepRef.current = animateStep;
  });

  useEffect(() => {
    logicalIndexRef.current = logicalIndex;
  }, [logicalIndex]);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track || !items.length) return;

    const measure = () => {
      const { originals, clones, all } = getCardSets();
      const first = originals[0];
      if (!first) return;

      const styles = getComputedStyle(track);
      const gap =
        Number.parseFloat(styles.columnGap || styles.gap || String(GAP_DESKTOP)) ||
        (isNarrow ? GAP_MOBILE : GAP_DESKTOP);
      const pitch = first.offsetWidth + gap;
      const flowStep = pitch * cardsPerFlow;
      const loopWidth =
        clones[0] && originals[0]
          ? clones[0].offsetLeft - originals[0].offsetLeft
          : pitch * originals.length;

      metricsRef.current = {
        flowStep,
        loopWidth,
        gapPx: gap,
      };

      // Never stomp mid-inchworm — ResizeObserver fires often during tweens.
      if (tweenRef.current?.isActive()) return;

      const logical = ((logicalIndexRef.current % loopSteps) + loopSteps) % loopSteps;
      logicalIndexRef.current = logical;
      setLogicalIndex(logical);
      gsap.set(all, { x: -logical * flowStep });
    };

    logicalIndexRef.current = 0;
    setLogicalIndex(0);
    setAllX(0);
    measure();

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.25 },
    );
    io.observe(section);

    window.addEventListener('load', measure);
    const images = [...track.querySelectorAll('img')];
    images.forEach((img) => {
      if (!img.complete) img.addEventListener('load', measure);
    });
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(track);
    const readyTimer = window.setTimeout(measure, 120);

    return () => {
      window.clearTimeout(readyTimer);
      window.removeEventListener('load', measure);
      images.forEach((img) => img.removeEventListener('load', measure));
      ro.disconnect();
      io.disconnect();
      tweenRef.current?.kill();
    };
  }, [items.length, isNarrow, cardsPerFlow, loopSteps]);

  useEffect(() => {
    if (loopSteps <= 1 || activeQuote) return;

    const id = window.setInterval(() => {
      if (pausedRef.current || !inViewRef.current) return;
      if (tweenRef.current?.isActive()) return;

      animateStepRef.current(1, (logical) => {
        setLogicalIndex(logical);
      });
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [loopSteps, activeQuote]);

  useEffect(() => {
    if (!activeQuote) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveQuote(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    closeQuoteRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeQuote]);

  const go = (direction: -1 | 1) => {
    if (tweenRef.current?.isActive() || loopSteps <= 1) return;
    animateStepRef.current(direction, (logical) => setLogicalIndex(logical));
  };

  if (!items.length) return null;

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative overflow-x-clip border-t border-border bg-white py-12 sm:py-16 md:py-24',
        className,
      )}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <SectionIntro title={title} subtitle={subtitle} />

      <div
        ref={viewportRef}
        data-researcher-viewport
        className="relative mt-8 w-full overflow-hidden sm:mt-14 md:mt-16"
      >
        <ul
          ref={trackRef}
          className={cn(
            'flex w-max flex-nowrap',
            isNarrow
              ? 'gap-4 px-4'
              : 'gap-6 px-4 sm:gap-12 sm:px-6 md:gap-20 lg:px-8 xl:px-16 2xl:px-[100px]',
          )}
        >
          {isNarrow ? (
            <>
              <TrackCardsStacked
                items={items}
                keyPrefix="a"
                onReadMore={setActiveQuote}
              />
              <TrackCardsStacked
                items={items}
                keyPrefix="b"
                onReadMore={setActiveQuote}
              />
            </>
          ) : (
            <>
              <TrackCardsDesktop
                items={items}
                keyPrefix="a"
                onReadMore={setActiveQuote}
              />
              <TrackCardsDesktop
                items={items}
                keyPrefix="b"
                onReadMore={setActiveQuote}
              />
            </>
          )}
        </ul>
      </div>

      <div
        data-researcher-nav
        className="mt-8 flex items-center justify-center gap-5 sm:mt-10 sm:gap-6"
      >
        <NavButton
          label="Previous researcher statements"
          onClick={() => go(-1)}
          mirrored
        />
        <NavButton
          label="Next researcher statements"
          onClick={() => go(1)}
        />
      </div>

      {activeQuote
        ? createPortal(
            <div className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-6">
              <button
                type="button"
                className="absolute inset-0 bg-[#0b233f]/65 backdrop-blur-[2px]"
                aria-label="Close statement"
                onClick={() => setActiveQuote(null)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={quoteTitleId}
                className="relative z-10 flex max-h-[90svh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#0b233f] text-paper shadow-2xl sm:max-w-2xl sm:rounded-[1.875rem]"
              >
                <div className="flex items-center gap-3 border-b border-white/15 px-5 py-4 sm:px-7 sm:py-5">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-surface sm:size-14">
                    <PersonPortrait
                      src={activeQuote.imageSrc}
                      alt=""
                      sizes="56px"
                      iconClassName="size-7 sm:size-8"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 id={quoteTitleId} className="font-sans text-lg font-semibold leading-tight sm:text-xl">
                      {activeQuote.name}
                    </h3>
                    <p className="mt-1 text-sm text-paper/75">{activeQuote.role}</p>
                  </div>
                  <button
                    ref={closeQuoteRef}
                    type="button"
                    onClick={() => setActiveQuote(null)}
                    aria-label="Close statement"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white/10"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
                <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                  <p className="whitespace-pre-line font-sans text-base leading-7 sm:text-lg sm:leading-8">
                    {activeQuote.quote}
                  </p>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}

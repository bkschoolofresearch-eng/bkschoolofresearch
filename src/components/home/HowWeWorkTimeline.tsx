'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

export type HowWeWorkStep = {
  id: string;
  title: string;
  description: string;
  href?: string;
  paragraphs?: readonly string[];
};

type HowWeWorkTimelineProps = {
  steps: readonly HowWeWorkStep[];
  className?: string;
  /** Homepage column highlights the step in view. A reading page shows every step in full. */
  mode?: 'scroll' | 'reading';
  showLabel?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function HowWeWorkTimeline({
  steps,
  className,
  mode = 'scroll',
  showLabel = true,
}: HowWeWorkTimelineProps) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const rafRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (mode !== 'scroll') return;

    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || !steps.length) return;

    const rail = track.querySelector<HTMLElement>('[data-how-rail]');
    const progress = track.querySelector<HTMLElement>('[data-how-progress]');
    if (!rail || !progress) return;

    const sync = () => {
      const nodes = [
        ...track.querySelectorAll<HTMLElement>('[data-how-marker]'),
      ];
      if (nodes.length < 1) return;

      const trackRect = track.getBoundingClientRect();
      const viewLine = window.innerHeight * 0.42;
      const markers = nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return rect.top + rect.height / 2 - trackRect.top;
      });

      const first = markers[0]!;
      const last = markers[markers.length - 1]!;
      const span = Math.max(last - first, 1);
      const raw = clamp((viewLine - trackRect.top - first) / span, 0, 1);

      rail.style.top = `${first}px`;
      rail.style.height = `${span}px`;
      progress.style.top = `${first}px`;
      progress.style.height = `${raw * span}px`;

      const nearest = Math.round(raw * (markers.length - 1));

      if (activeRef.current !== nearest) {
        activeRef.current = nearest;
        setActiveIndex(nearest);
      }
    };

    let watching = false;
    const tick = () => {
      sync();
      if (watching) rafRef.current = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (watching) return;
      watching = true;
      rafRef.current = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      watching = false;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) start();
        else stop();
      },
      { rootMargin: '20% 0px' },
    );
    io.observe(root);

    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [mode, steps.length]);

  if (!steps.length) return null;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      {showLabel ? (
        <p className="mb-4 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink sm:mb-5 sm:text-[0.8125rem]">
          What we do
        </p>
      ) : null}

      <div ref={trackRef} className="relative">
        <div
          aria-hidden
          data-how-rail
          className="absolute left-[1.05rem] w-px bg-border sm:left-[1.15rem]"
        />
        <div
          aria-hidden
          data-how-progress
          className={cn(
            'absolute left-[1.05rem] w-px bg-accent sm:left-[1.15rem]',
            !reduceMotion && 'transition-[height] duration-100 ease-linear',
          )}
          style={{ boxShadow: '0 0 10px rgba(23, 59, 108, 0.35)' }}
        />

        <ol className="relative space-y-4 sm:space-y-5">
          {steps.map((step, index) => {
            const isActive = mode === 'reading' || index === activeIndex;
            const isPassed = mode === 'reading' || index < activeIndex;
            const Heading = mode === 'reading' ? 'h2' : 'h3';

            return (
              <li
                key={step.id}
                className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-3.5"
              >
                <div className="relative z-1 flex justify-center self-start pt-4 sm:pt-5">
                  <span
                    data-how-marker
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full border-2 font-sans text-sm font-semibold sm:size-9 sm:text-[0.9375rem]',
                      reduceMotion
                        ? undefined
                        : 'transition-[background-color,border-color,color,box-shadow] duration-300',
                      isPassed || isActive
                        ? 'border-accent bg-accent text-white shadow-[0_0_0_3px_rgba(23,59,108,0.14)]'
                        : 'border-border bg-white text-muted',
                    )}
                  >
                    {index + 1}
                  </span>
                </div>

                <article
                  className={cn(
                    'rounded-[1.25rem] bg-[#0b233f] px-5 py-5 text-paper sm:rounded-[1.5rem] sm:px-6 sm:py-6',
                    mode === 'reading' && 'px-5 py-6 sm:px-7 sm:py-7',
                    reduceMotion || mode === 'reading'
                      ? undefined
                      : 'transition-[box-shadow,opacity] duration-300',
                    isActive
                      ? 'opacity-100 shadow-[0_12px_28px_rgba(11,35,63,0.24)]'
                      : 'opacity-[0.9]',
                  )}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
                    <Heading
                      className={cn(
                        'font-instrument font-medium leading-snug tracking-tight',
                        mode === 'reading'
                          ? 'text-[1.35rem] sm:text-[1.65rem]'
                          : 'text-xl sm:text-2xl',
                      )}
                    >
                      {step.title}
                    </Heading>
                    {step.href ? (
                      <Link
                        href={step.href}
                        className="shrink-0 text-sm font-semibold tracking-[0.04em] text-paper/80 underline-offset-4 transition-colors hover:text-white hover:underline"
                      >
                        Learn more
                      </Link>
                    ) : null}
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-paper/88 sm:mt-3 sm:text-base sm:leading-7">
                    {step.description}
                  </p>
                  {mode === 'reading' && step.paragraphs?.length ? (
                    <div className="mt-4 space-y-3 border-t border-white/10 pt-4 sm:mt-5 sm:space-y-4 sm:pt-5">
                      {step.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph.slice(0, 48)}
                          className="text-sm leading-relaxed text-paper/78 sm:text-base sm:leading-7"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

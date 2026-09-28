'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSimplifiedMotion } from '@/hooks/useSimplifiedMotion';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils';
import './our-programs.css';

export type OurProgramItem = {
  href: string;
  title: string;
  summary: string;
  imageSrc: string;
};

type OurProgramsProps = {
  items: OurProgramItem[];
  className?: string;
};

const SCROLL_PER_ITEM = 0.85;
const LERP = 0.26;

function circularDelta(index: number, position: number, length: number) {
  let delta = index - position;
  if (delta > length / 2) delta -= length;
  if (delta < -length / 2) delta += length;
  return delta;
}

function smoothstep(t: number) {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
}

/**
 * Wheel motion + continuous focus (0→1) so the card grows smoothly
 * into the tall center state — no hard short/tall layout swap.
 */
function layoutForDelta(delta: number, step = 290) {
  const abs = Math.abs(delta);
  const sign = delta < 0 ? -1 : 1;

  if (abs >= 2.15) {
    return {
      y: sign * (step * 2.15),
      scale: 0.8,
      opacity: 0,
      z: 1,
      focus: 0,
      interactive: false,
      visible: false,
    };
  }

  if (abs <= 1) {
    const focus = smoothstep(1 - abs);
    return {
      y: sign * abs * step,
      scale: 0.9 + 0.1 * focus,
      opacity: 1,
      z: Math.round(20 + focus * 20),
      focus,
      interactive: focus > 0.62,
      visible: true,
    };
  }

  const t = abs - 1;
  return {
    y: sign * (step + t * (step * 0.52)),
    scale: 0.9 - t * 0.06,
    opacity: 1 - t * 0.5,
    z: Math.round(18 - t * 6),
    focus: 0,
    interactive: false,
    visible: t < 0.9,
  };
}

/**
 * Figma 175:90 — vertical program wheel + right title block.
 * On narrow screens: static stacked cards (pin/wheel fights touch scroll).
 */
export function OurPrograms({ items, className }: OurProgramsProps) {
  const simplified = useSimplifiedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const moreShown = useRef(false);
  const [showMore, setShowMore] = useState(false);

  const count = items.length;
  const pinExtra = Math.max(
    Math.round(count * SCROLL_PER_ITEM * 700),
    Math.round(count * 420),
  );

  useEffect(() => {
    if (simplified || count < 2) return;

    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    let alive = true;
    let target = 0;
    let current = 0;
    let running = false;
    let scrollable = 0;
    const step = 290;
    const wasInteractive: boolean[] = Array.from({ length: count }, () => false);
    const wasVisible: boolean[] = Array.from({ length: count }, () => true);

    const measure = () => {
      scrollable = Math.max(section.offsetHeight - window.innerHeight, 0);
    };

    const apply = (position: number) => {
      for (let index = 0; index < count; index += 1) {
        const el = cardRefs.current[index];
        if (!el) continue;
        const layout = layoutForDelta(
          circularDelta(index, position, count),
          step,
        );

        const y = Math.round(layout.y * 10) / 10;
        const scale = Math.round(layout.scale * 1000) / 1000;
        const opacity = layout.visible
          ? Math.round(layout.opacity * 100) / 100
          : 0;
        const focus = Math.round(layout.focus * 1000) / 1000;

        el.style.transform = `translate3d(-50%, calc(-50% + ${y}px), 0) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(layout.z);
        el.style.setProperty('--focus', String(focus));

        if (wasVisible[index] !== layout.visible) {
          wasVisible[index] = layout.visible;
          el.style.visibility = layout.visible ? 'visible' : 'hidden';
        }

        if (wasInteractive[index] !== layout.interactive) {
          wasInteractive[index] = layout.interactive;
          el.classList.toggle('is-interactive', layout.interactive);
          el.style.pointerEvents = layout.interactive ? 'auto' : 'none';
        }
      }
    };

    const readTarget = () => {
      if (scrollable <= 0) {
        target = 0;
        return;
      }
      const top = section.getBoundingClientRect().top;
      const progress = Math.min(Math.max(-top / scrollable, 0), 1);
      target = progress * count;
      const finished = progress >= (count - 1) / count;
      if (finished !== moreShown.current) {
        moreShown.current = finished;
        setShowMore(finished);
      }
    };

    const tick = () => {
      if (!alive) return;
      readTarget();
      const prev = current;
      current += (target - current) * LERP;
      if (Math.abs(target - current) < 0.0006) current = target;

      const moving =
        Math.abs(current - prev) > 0.00005 ||
        Math.abs(target - current) > 0.00005;

      if (moving) {
        apply(current);
        frame = window.requestAnimationFrame(tick);
        running = true;
      } else {
        running = false;
      }
    };

    const kick = () => {
      if (!alive || running) return;
      running = true;
      frame = window.requestAnimationFrame(tick);
    };

    const onResize = () => {
      measure();
      kick();
    };

    measure();
    wasInteractive[0] = true;
    apply(0);
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    kick();

    return () => {
      alive = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', onResize);
    };
  }, [count, simplified]);

  if (!count) return null;

  if (simplified) {
    return (
      <section
        className={cn(
          'border-t border-border bg-white py-12 sm:py-16 md:py-24',
          className,
        )}
      >
        <Container>
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
            <ProgramsCopy />
            <ul className="mx-auto w-full max-w-lg space-y-4 sm:max-w-none sm:space-y-5">
              {items.map((item) => (
                <li
                  key={item.href}
                  className="program-wheel-card is-active is-interactive"
                >
                  <ProgramCard item={item} />
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-center sm:mt-8 lg:justify-start">
              <Button href="/activities" variant="ink" size="lg">
                View more
              </Button>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={cn('relative border-t border-border bg-white', className)}
      style={{ height: `calc(100svh + ${pinExtra}px)` }}
    >
      <div className="sticky top-0 flex min-h-svh items-center overflow-x-clip overflow-y-hidden">
        <Container className="grid w-full min-w-0 items-center gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)] lg:gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] xl:gap-10">
          <div className="relative order-last w-full min-w-0 overflow-hidden lg:order-first">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-30 h-12 bg-linear-to-b from-white to-transparent sm:h-24"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-12 bg-linear-to-t from-white to-transparent sm:h-24"
              aria-hidden
            />

            <div className="relative mx-auto h-[min(72svh,40rem)] w-full max-w-[38rem] sm:h-[min(86svh,52rem)] xl:max-w-[42rem]">
              {items.map((item, index) => (
                <div
                  key={item.href}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  className={cn(
                    'program-wheel-card absolute top-1/2 left-1/2 w-full',
                    index === 0 && 'is-interactive',
                  )}
                  style={{
                    transform: 'translate3d(-50%, -50%, 0) scale(1)',
                    zIndex: count - index,
                    ['--focus' as string]: index === 0 ? 1 : 0,
                  }}
                >
                  <ProgramCard item={item} />
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-20 order-first min-w-0 text-center lg:order-last lg:self-center lg:text-left">
            <ProgramsCopy />
            <div
              className={cn(
                'mt-6 flex justify-center transition-[opacity,transform] duration-500 ease-out sm:mt-8 lg:justify-start',
                showMore
                  ? 'translate-y-0 opacity-100'
                  : 'pointer-events-none -translate-y-4 opacity-0',
              )}
              inert={showMore ? undefined : true}
            >
              <Button href="/activities" variant="ink" size="lg">
                View more
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

function ProgramsCopy() {
  return (
    <div className="mx-auto max-w-lg lg:mx-0 lg:max-w-none">
      <h2 className="font-display font-normal leading-[0.88] tracking-normal text-ink">
        <span className="block text-[clamp(3.25rem,12vw,10rem)] lg:text-[clamp(4rem,8vw,11rem)]">
          Our
        </span>
        <span className="mt-1 block text-[clamp(2rem,8vw,5rem)] lg:text-[clamp(2.5rem,4.5vw,5.25rem)]">
          Programs
        </span>
      </h2>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink/80 sm:mt-5 sm:text-base lg:mx-0 lg:mt-4 lg:max-w-72">
        Empowering researchers, engaging policymakers, and impacting
        communities.
      </p>
    </div>
  );
}

/** Single morphing card — height / type / Explore follow --focus (0→1). */
function ProgramCard({ item }: { item: OurProgramItem }) {
  return (
    <article className="program-card-shell w-full">
      <div className="program-card-media">
        <Image
          src={item.imageSrc}
          alt=""
          fill
          sizes="(max-width: 1024px) 50vw, 22rem"
          className="object-cover"
          draggable={false}
        />
      </div>

      <div className="program-card-copy">
        <div className="program-card-copy-top">
          <h3 className="program-card-title">{item.title}</h3>
          <p className="program-card-summary">{item.summary}</p>
        </div>
        <Link href={item.href} className="program-card-explore">
          Explore
        </Link>
      </div>
    </article>
  );
}

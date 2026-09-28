import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Container } from '@/components/ui/Container';
import { ImageFrame } from '@/components/ui/ImageFrame';
import { HowWeWorkTimeline } from '@/components/home/HowWeWorkTimeline';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';
import {
  ABOUT_AWARDS,
  ABOUT_FIELDS,
  ABOUT_GOVERNANCE_PREVIEW,
  ABOUT_HIGHLIGHT_STATS,
  ABOUT_MISSIONS,
  ABOUT_OVERVIEW_PARAGRAPHS,
  ABOUT_PARTNERS,
  ABOUT_VALUES,
  ABOUT_VISION,
  WHAT_WE_DO_PILLARS,
} from '@/content/about-hub';
import type { Person } from '@/types/content';

type AboutLink = {
  href: string;
  label: string;
  excerpt?: string | null;
  imageSrc: string;
};

type AboutHubProps = {
  director: Person | null;
  links: AboutLink[];
  storyImage: string;
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
        'inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[0.625rem] font-semibold uppercase tracking-[0.1em]',
        onInk
          ? 'border-paper/25 text-paper/75'
          : 'border-ink/12 text-ink/65',
      )}
    >
      {children}
    </span>
  );
}

function SectionHead({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-balance font-instrument text-2xl font-medium leading-snug text-ink sm:text-3xl md:text-[2.15rem] md:leading-tight">
          {title}
        </h2>
        {children ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-[0.975rem] sm:leading-[1.7]">
            {children}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * About hub — homepage navy-card language + editorial reading.
 * Order: story → numbers → vision/missions/values → work → recognition → governance → explore.
 */
export function AboutHub({ director, links, storyImage }: AboutHubProps) {
  const [lead, ...restOverview] = ABOUT_OVERVIEW_PARAGRAPHS;

  return (
    <>
      {/* ── 1. Our story: reading + navy media card ─────────────── */}
      <section id="overview" className="scroll-mt-28 bg-paper py-12 sm:py-16 md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
            <div className="lg:col-span-6 xl:col-span-7">
              <Reveal>
                <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
                  Our story
                </p>
                <h2 className="mt-3 max-w-xl text-balance font-instrument text-2xl font-medium leading-snug text-ink sm:text-3xl md:text-[2.15rem] md:leading-tight">
                  A bridge between evidence and impact
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ABOUT_FIELDS.map((field) => (
                    <MetaChip key={field}>{field}</MetaChip>
                  ))}
                </div>
              </Reveal>

              <div className="mt-8 space-y-5 sm:mt-10">
                <Reveal>
                  <p className="text-[1.05rem] leading-[1.8] text-body sm:text-[1.075rem] sm:leading-[1.85]">
                    {lead}
                  </p>
                </Reveal>
                {restOverview.map((paragraph, index) => (
                  <Reveal key={paragraph.slice(0, 24)} delay={0.03 * (index + 1)}>
                    <p className="text-[1.025rem] leading-[1.8] text-body sm:text-[1.05rem]">
                      {paragraph}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal className="lg:col-span-6 xl:col-span-5" delay={0.06}>
              <article className="overflow-hidden rounded-[1.35rem] bg-ink p-2.5 sm:rounded-[2rem] sm:p-3">
                <div className="relative overflow-hidden rounded-[1.1rem] sm:rounded-[1.6rem]">
                  <ImageFrame
                    src={storyImage}
                    alt=""
                    aspect="video"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    frameClassName="border-0 bg-[#d9d9d9] rounded-[1.1rem] sm:rounded-[1.6rem]"
                    className="object-cover"
                  />
                </div>
                <div className="px-2 pb-2 pt-4 text-paper sm:px-3 sm:pb-3 sm:pt-5">
                  <MetaChip onInk>Since 2015</MetaChip>
                  <p className="mt-3 font-instrument text-xl font-medium leading-snug sm:text-2xl">
                    Globally engaged research for policy and practice
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-paper/65">
                    WHO &amp; UNICEF · Elsevier, Springer, Taylor &amp; Francis ·
                    Conferences across UK, UAE, South Asia
                  </p>
                  <div className="mt-4">
                    <Button
                      href="/about/who-we-are"
                      variant="onInk"
                      size="sm"
                      className="font-normal tracking-normal"
                    >
                      Who we are
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── 2. Numbers — navy stats deck ────────────────────────── */}
      <section
        id="at-a-glance"
        className="scroll-mt-28 border-y border-border bg-surface-subtle py-10 sm:py-14"
      >
        <Container>
          <Reveal>
            <SectionHead
              eyebrow="At a glance"
              title="BKSR in numbers"
            >
              Fellows, scholars, and field teams working across borders.
            </SectionHead>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {ABOUT_HIGHLIGHT_STATS.map((stat, index) => (
              <Reveal key={stat.id} delay={0.03 * index}>
                <article
                  className={cn(
                    'rounded-[1.25rem] p-5 text-paper sm:rounded-[1.5rem] sm:p-6',
                    index % 2 === 0 ? 'bg-ink' : 'bg-accent',
                  )}
                >
                  <p className="font-display text-4xl tabular-nums tracking-normal sm:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-paper/55">
                    {stat.label}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 3. Vision + missions + values ───────────────────────── */}
      <section
        id="who-we-are"
        className="scroll-mt-28 bg-paper py-12 sm:py-16 md:py-20"
      >
        <Container>
          <Reveal>
            <SectionHead
              eyebrow="Who we are"
              title="Vision, missions & values"
              action={
                <ArrowLink href="/about/who-we-are">Full Who we are</ArrowLink>
              }
            >
              How BKSR defines excellence — and the commitments that guide every
              project.
            </SectionHead>
          </Reveal>

          {/* Vision — lead navy card */}
          <Reveal delay={0.04}>
            <article className="mt-8 overflow-hidden rounded-[1.35rem] bg-ink p-6 text-paper sm:mt-10 sm:rounded-[2rem] sm:p-8 md:p-10">
              <MetaChip onInk>Vision</MetaChip>
              <p className="mt-5 max-w-3xl font-instrument text-xl font-medium leading-snug sm:text-2xl md:text-[1.85rem] md:leading-snug">
                {ABOUT_VISION}
              </p>
            </article>
          </Reveal>

          {/* Missions grid */}
          <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ABOUT_MISSIONS.map((mission, index) => {
              const last = index === ABOUT_MISSIONS.length - 1;
              return (
                <Reveal
                  key={mission.id}
                  delay={0.03 * index}
                  className={cn(last && 'md:col-span-2 xl:col-span-1')}
                >
                  <article className="flex h-full flex-col rounded-[1.25rem] bg-accent p-5 text-paper sm:rounded-[1.5rem] sm:p-6">
                    <span className="font-display text-3xl tabular-nums leading-none text-paper/30 sm:text-4xl">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-4 font-instrument text-lg font-medium leading-snug sm:text-xl">
                      {mission.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-paper/70 sm:text-[0.9375rem] sm:leading-[1.7]">
                      {mission.body}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>

          {/* Values — paper cards */}
          <div className="mt-10 sm:mt-12">
            <Reveal>
              <h3 className="font-instrument text-xl font-medium text-ink sm:text-2xl">
                Core values
              </h3>
            </Reveal>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
              {ABOUT_VALUES.map((value, index) => (
                <Reveal key={value.id} delay={0.02 * index}>
                  <article className="flex h-full flex-col rounded-[1.15rem] border border-ink/10 bg-surface-subtle p-4 sm:rounded-[1.35rem] sm:p-5">
                    <span className="font-sans text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h4 className="mt-3 font-instrument text-base font-medium leading-snug text-ink sm:text-lg">
                      {value.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {value.body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── 4. What we do — work cards ──────────────────────────── */}
      <section
        id="what-we-do"
        className="scroll-mt-28 border-y border-border bg-surface-subtle py-12 sm:py-16 md:py-20"
      >
        <Container>
          <Reveal>
            <SectionHead
              eyebrow="About"
              title="What we do"
              action={
                <ArrowLink href="/about/what-we-do">Full What we do</ArrowLink>
              }
            >
              Research and publications, capacity building, policy engagement,
              and community impact.
            </SectionHead>
          </Reveal>

          <div className="mt-8 sm:mt-10">
            <HowWeWorkTimeline
              showLabel={false}
              steps={WHAT_WE_DO_PILLARS.map((pillar) => ({
                id: pillar.id,
                title: pillar.title,
                description: pillar.description,
                href: pillar.href,
              }))}
            />
          </div>
        </Container>
      </section>

      {/* ── 5. Recognition ──────────────────────────────────────── */}
      <section
        id="recognition"
        className="scroll-mt-28 bg-paper py-12 sm:py-16 md:py-20"
      >
        <Container>
          <Reveal>
            <SectionHead
              eyebrow="Recognition"
              title="Awards & partnerships"
            >
              National recognition, and partners who share a commitment to
              research for good.
            </SectionHead>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12">
            {ABOUT_AWARDS.map((award, index) => (
              <Reveal
                key={award.id}
                delay={0.03 * index}
                className="lg:col-span-4"
              >
                <article className="flex h-full flex-col justify-between rounded-[1.25rem] bg-ink p-5 text-paper sm:rounded-[1.6rem] sm:p-6">
                  <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-paper/50">
                    {award.year}
                  </p>
                  <h3 className="mt-6 font-instrument text-xl font-medium leading-snug sm:text-2xl">
                    {award.label}
                  </h3>
                </article>
              </Reveal>
            ))}

            <Reveal delay={0.08} className="sm:col-span-2 lg:col-span-4">
              <article className="flex h-full flex-col rounded-[1.25rem] border border-ink/10 bg-surface-subtle p-5 sm:rounded-[1.6rem] sm:p-6">
                <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent">
                  Partners on record
                </p>
                <ul className="mt-4 space-y-3">
                  {ABOUT_PARTNERS.map((partner) => (
                    <li
                      key={partner}
                      className="font-instrument text-base leading-snug text-ink sm:text-lg"
                    >
                      {partner}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── 6. Governance ───────────────────────────────────────── */}
      <section
        id="governance"
        className="scroll-mt-28 border-t border-border bg-surface-subtle py-12 sm:py-16 md:py-20"
      >
        <Container>
          <Reveal>
            <SectionHead
              eyebrow="Governance"
              title="Accountability built in"
              action={
                <ArrowLink href="/about/governance">Full governance</ArrowLink>
              }
            >
              {ABOUT_GOVERNANCE_PREVIEW.intro}
            </SectionHead>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {ABOUT_GOVERNANCE_PREVIEW.pillars.map((pillar, index) => (
              <Reveal key={pillar.id} delay={0.03 * index}>
                <article className="flex h-full flex-col rounded-[1.15rem] bg-accent p-5 text-paper sm:rounded-[1.4rem] sm:p-5">
                  <span className="font-display text-2xl tabular-nums text-paper/30">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 font-instrument text-lg font-medium leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper/70">
                    {pillar.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          {director ? (
            <Reveal delay={0.08}>
              <article className="mt-6 overflow-hidden rounded-[1.35rem] bg-ink p-3 sm:mt-8 sm:rounded-[1.75rem] sm:p-4">
                <div className="grid gap-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center sm:gap-5">
                  <div className="relative mx-auto aspect-4/5 w-28 overflow-hidden rounded-[1rem] bg-accent sm:mx-0 sm:w-full sm:rounded-[1.15rem]">
                    {director.photoUrl ? (
                      <Image
                        src={director.photoUrl}
                        alt={director.name}
                        fill
                        sizes="112px"
                        className="object-cover object-top"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 px-1 text-center text-paper sm:px-0 sm:text-left">
                    <MetaChip onInk>Executive Director</MetaChip>
                    <h3 className="mt-2 font-instrument text-xl font-medium leading-snug sm:text-2xl">
                      {director.name}
                    </h3>
                    <p className="mt-1 text-sm text-paper/60">{director.role}</p>
                    {director.shortBio ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-paper/70">
                        {director.shortBio}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex justify-center sm:justify-end">
                    <Button
                      href={`/people/${director.slug}`}
                      variant="onInk"
                      size="sm"
                      className="font-normal tracking-normal"
                    >
                      View profile
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          ) : null}
        </Container>
      </section>

      {/* ── 7. Explore pathways ─────────────────────────────────── */}
      <section
        id="explore"
        className="scroll-mt-28 border-t border-border bg-paper py-12 sm:py-16 md:py-20"
      >
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Reveal>
              <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
                Inside BKSR
              </p>
              <h2 className="mt-2 font-instrument text-2xl font-medium text-ink sm:text-3xl">
                Explore the institute
              </h2>
            </Reveal>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <ArrowLink href="/people">People</ArrowLink>
              <ArrowLink href="/research">Research</ArrowLink>
              <ArrowLink href="/contact">Contact</ArrowLink>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {links.map((item, index) => {
              const tone = index % 2 === 0 ? 'deep' : 'soft';
              return (
                <Reveal key={item.href} delay={0.03 * index}>
                  <article
                    className={cn(
                      'flex h-full min-w-0 flex-col overflow-hidden rounded-[1.25rem] p-2.5 sm:rounded-[1.6rem] sm:p-3',
                      tone === 'soft' ? 'bg-accent' : 'bg-ink',
                    )}
                  >
                    <Link
                      href={item.href}
                      className="relative block overflow-hidden rounded-[1rem] sm:rounded-[1.25rem]"
                      aria-hidden
                    >
                      <ImageFrame
                        src={item.imageSrc}
                        alt=""
                        aspect="wide"
                        sizes="(max-width: 768px) 100vw, 25vw"
                        frameClassName="border-0 bg-[#d9d9d9] rounded-[1rem] sm:rounded-[1.25rem]"
                        className="object-cover"
                      />
                    </Link>
                    <div className="mt-3 flex flex-1 flex-col px-1 pb-1 text-paper sm:px-1.5">
                      <MetaChip onInk>
                        {String(index + 1).padStart(2, '0')}
                      </MetaChip>
                      <h3 className="mt-2 font-instrument text-lg font-medium leading-snug">
                        <Link
                          href={item.href}
                          className="transition-colors hover:text-white"
                        >
                          {item.label}
                        </Link>
                      </h3>
                      {item.excerpt ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-paper/65">
                          {item.excerpt}
                        </p>
                      ) : null}
                      <div className="mt-auto pt-3">
                        <Button
                          href={item.href}
                          variant="onInk"
                          size="sm"
                          className="font-normal tracking-normal"
                        >
                          Read more
                        </Button>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}

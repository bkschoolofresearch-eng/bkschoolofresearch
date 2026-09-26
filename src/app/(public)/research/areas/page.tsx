import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { Container } from '@/components/ui/Container';
import { EditorialHeading } from '@/components/ui/EditorialHeading';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/motion/Reveal';
import {
  getPublications,
  getResearchAreas,
  getResearchProjects,
} from '@/lib/content/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils';

export const metadata = buildPageMetadata(
  'Research Areas',
  'Fields of inquiry at BK School of Research — economics, technology, health, climate, gender, education, and related themes.',
  '/research/areas',
);

function cleanDescription(text: string) {
  return text.replace(/\s*\(legacy ongoing list:[^)]+\)\.?/gi, '').trim();
}

export default async function ResearchAreasPage() {
  const areas = await getResearchAreas();
  const projects = await getResearchProjects();
  const publications = await getPublications();

  const rows = areas.map((area, index) => {
    const projectCount = projects.filter((project) =>
      project.areaIds.includes(area.id),
    ).length;
    const publicationCount = publications.filter((pub) =>
      (pub.areaIds ?? []).includes(area.id),
    ).length;
    const weight = projectCount + publicationCount;
    return {
      area,
      index,
      projectCount,
      publicationCount,
      weight,
      blurb: area.shortDescription ?? cleanDescription(area.description),
      description: cleanDescription(area.description),
    };
  });

  const featured =
    [...rows].sort((a, b) => b.weight - a.weight)[0] ?? rows[0];
  const grid = rows.filter((row) => row.area.id !== featured?.area.id);

  return (
    <>
      <PageHero
        eyebrow="Inquiry"
        title="Our Focus"
        description="Eleven fields at the intersection of people, policy, and progress — economics, technology, health, climate, gender, education, and more."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Research', href: '/research' },
          { label: 'Areas' },
        ]}
      />

      <Section className="py-14 md:py-20">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
            <div>
              <Eyebrow>Fields</Eyebrow>
              <EditorialHeading as="h2" size="md" className="mt-3">
                Where we inquire
              </EditorialHeading>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Each card is a field of inquiry — linked project and publication
              counts from the current library.
            </p>
          </div>

          {/* Featured lead card */}
          {featured ? (
            <Reveal>
              <article
                id={featured.area.slug}
                className="scroll-mt-28 border border-border bg-white"
              >
                <Link
                  href={`/research/areas/${featured.area.slug}`}
                  className="group grid gap-0 lg:grid-cols-12"
                >
                  <div className="flex flex-col justify-between border-b border-border bg-ink px-6 py-8 sm:px-8 sm:py-10 lg:col-span-4 lg:border-b-0 lg:border-r">
                    <div>
                      <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-paper/45">
                        Focus field
                      </p>
                      <p className="mt-6 font-display text-5xl font-medium leading-none tracking-[-0.04em] text-paper/25 md:text-6xl">
                        {String(featured.index + 1).padStart(2, '0')}
                      </p>
                    </div>
                    <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-paper/55">
                      <span>
                        {featured.projectCount} project
                        {featured.projectCount === 1 ? '' : 's'}
                      </span>
                      <span>
                        {featured.publicationCount} publication
                        {featured.publicationCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:col-span-8 lg:px-10">
                    <h3 className="font-display text-3xl leading-snug text-ink transition-colors group-hover:text-accent md:text-4xl">
                      {featured.area.title}
                    </h3>
                    <p className="mt-4 max-w-2xl text-[0.975rem] leading-[1.75] text-muted">
                      {featured.description}
                    </p>
                    <span className="mt-8 inline-flex items-center gap-2 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent">
                      Browse related research
                      <span
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                        aria-hidden
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </article>
            </Reveal>
          ) : null}

          {/* Card grid */}
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {grid.map(
              (
                { area, index, projectCount, publicationCount, blurb },
                i,
              ) => (
                <li key={area.id} id={area.slug} className="scroll-mt-28">
                  <Reveal delay={Math.min(i * 0.03, 0.12)} className="h-full">
                    <Link
                      href={`/research/areas/${area.slug}`}
                      className={cn(
                        'group/card relative flex h-full flex-col border border-border bg-white p-6 sm:p-7',
                        'transition-[border-color,background-color] duration-200',
                        'hover:border-ink/30 hover:bg-paper',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                      )}
                    >
                      <span
                        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover/card:scale-x-100"
                        aria-hidden
                      />
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-sans text-[0.6875rem] font-semibold tracking-[0.16em] text-brand-red">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                          {projectCount > 0
                            ? `${projectCount} proj.`
                            : 'Open'}
                          {publicationCount > 0
                            ? ` · ${publicationCount} pub.`
                            : ''}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-2xl leading-snug text-ink transition-colors group-hover/card:text-accent">
                        {area.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                        {blurb}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-1.5 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
                        Explore
                        <span
                          className="transition-transform duration-300 group-hover/card:translate-x-0.5"
                          aria-hidden
                        >
                          →
                        </span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ),
            )}
          </ul>
        </Container>
      </Section>

      <Section tone="ink" className="py-16 md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <Eyebrow className="text-paper/45">Next</Eyebrow>
              <EditorialHeading as="h2" size="md" className="mt-3 text-paper">
                Follow a field into the portfolio
              </EditorialHeading>
              <p className="mt-4 max-w-lg text-[0.975rem] leading-[1.7] text-paper/65">
                Move from theme to project, or from field to published evidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:col-span-4 lg:justify-end">
              <Link
                href="/research"
                className="inline-flex h-11 items-center justify-center bg-paper px-6 font-sans text-sm font-semibold tracking-[0.04em] text-ink transition-colors hover:bg-white"
              >
                Research projects
              </Link>
              <Link
                href="/publications"
                className="inline-flex h-11 items-center justify-center border border-paper/45 px-6 font-sans text-sm font-semibold tracking-[0.04em] text-paper transition-colors hover:border-paper hover:bg-paper/10"
              >
                Publications
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

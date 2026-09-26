import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ResearchProjectAnchor,
  researchProjectHref,
} from '@/components/editorial/ResearchFeature';
import { ResearchProjectMedia } from '@/components/editorial/ResearchProjectMedia';
import { PageHero } from '@/components/layout/PageHero';
import { Container } from '@/components/ui/Container';
import { EditorialHeading } from '@/components/ui/EditorialHeading';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Section } from '@/components/ui/Section';
import { pageHeroMedia } from '@/lib/content/page-heroes';
import { withResearchExternalUrls } from '@/lib/content/research-links';
import { researchProjectVenueLine } from '@/lib/content/research-links';
import {
  getPublications,
  getResearchAreaBySlug,
  getResearchAreas,
  getResearchProjects,
} from '@/lib/content/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { RESEARCH_STATUS_LABELS } from '@/lib/public/labels';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const areas = await getResearchAreas();
  return areas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const area = await getResearchAreaBySlug(slug);
  if (!area) {
    return buildPageMetadata(
      'Research area',
      'Focus field at BK School of Research.',
      `/research/areas/${slug}`,
    );
  }
  return buildPageMetadata(
    area.seo?.title?.replace(/\s*\|\s*BKSR\s*$/i, '') || area.title,
    area.seo?.description ||
      area.shortDescription ||
      area.description ||
      `${area.title} research at BK School of Research.`,
    area.seo?.canonicalPath || `/research/areas/${area.slug}`,
  );
}

export default async function ResearchAreaDetailPage({ params }: Props) {
  const { slug } = await params;
  const area = await getResearchAreaBySlug(slug);
  if (!area) notFound();

  const [rawProjects, publications] = await Promise.all([
    getResearchProjects(),
    getPublications(),
  ]);
  const projects = withResearchExternalUrls(rawProjects, publications).filter(
    (project) => (project.areaIds ?? []).includes(area.id),
  );
  const publicationCount = publications.filter((pub) =>
    (pub.areaIds ?? []).includes(area.id),
  ).length;
  const preview = projects.slice(0, 6);

  return (
    <>
      <PageHero
        eyebrow="Focus field"
        title={area.title}
        description={
          area.shortDescription ||
          area.description ||
          'A field of inquiry at BK School of Research.'
        }
        imageSrc={pageHeroMedia.research}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Research', href: '/research' },
          { label: 'Areas', href: '/research/areas' },
          { label: area.title },
        ]}
      />

      <Section tone="white" className="py-14 md:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <Eyebrow>About this field</Eyebrow>
              <EditorialHeading as="h2" size="md" className="mt-3">
                {area.title}
              </EditorialHeading>
              <p className="mt-5 max-w-2xl text-[1rem] leading-[1.75] text-muted">
                {area.description || area.shortDescription}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/research?area=${area.slug}`}
                  className="inline-flex h-11 items-center justify-center bg-ink px-6 font-sans text-sm font-semibold tracking-[0.04em] text-paper transition-colors hover:bg-accent"
                >
                  Browse related research
                </Link>
                <Link
                  href="/research/areas"
                  className="inline-flex h-11 items-center justify-center border border-ink/20 px-6 font-sans text-sm font-semibold tracking-[0.04em] text-ink transition-colors hover:border-ink/40"
                >
                  All focus fields
                </Link>
              </div>
            </div>
            <aside className="lg:col-span-5">
              <div className="border border-border bg-[#F7F1E6] p-6 sm:p-8">
                <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted">
                  In the library
                </p>
                <dl className="mt-5 space-y-4">
                  <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-3">
                    <dt className="text-sm text-muted">Research projects</dt>
                    <dd className="font-display text-2xl text-ink">
                      {projects.length}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-muted">Publications tagged</dt>
                    <dd className="font-display text-2xl text-ink">
                      {publicationCount}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section className="bg-[#F7F1E6] py-14 md:py-20">
        <Container>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Projects</Eyebrow>
              <EditorialHeading as="h2" size="md" className="mt-3">
                Related research
              </EditorialHeading>
            </div>
            {projects.length > preview.length ? (
              <Link
                href={`/research?area=${area.slug}`}
                className="font-sans text-sm font-semibold text-accent hover:underline"
              >
                View all {projects.length} →
              </Link>
            ) : null}
          </div>

          {preview.length ? (
            <ul className="divide-y divide-border border-y border-border bg-white/60">
              {preview.map((project) => {
                const href = researchProjectHref(project);
                const venueLine = researchProjectVenueLine(project);
                return (
                  <li key={project.id}>
                    <ResearchProjectAnchor
                      project={project}
                      className={cn(
                        'group flex items-start gap-4 px-4 py-6 sm:gap-7 sm:px-6 sm:py-8',
                        !href && 'cursor-default',
                      )}
                    >
                      <span className="w-[4.5rem] shrink-0 sm:w-[5.5rem]">
                        <ResearchProjectMedia project={project} size="list" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                          {[
                            RESEARCH_STATUS_LABELS[project.researchStatus],
                            project.year ? String(project.year) : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                        <span
                          className={cn(
                            'mt-2 block font-display text-lg leading-[1.2] text-ink sm:text-[1.35rem]',
                            href && 'transition-colors group-hover:text-accent',
                          )}
                        >
                          {project.title}
                        </span>
                        {project.leadAuthorNames.length ? (
                          <span className="mt-2 block text-sm text-muted">
                            {project.leadAuthorNames.join(', ')}
                          </span>
                        ) : null}
                        {venueLine ? (
                          <span className="mt-1.5 block font-serif text-sm italic text-body/80">
                            {venueLine}
                          </span>
                        ) : null}
                      </span>
                    </ResearchProjectAnchor>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="border border-dashed border-border bg-white/70 px-6 py-10 text-sm text-muted">
              No research projects are tagged to this field yet. Browse the full
              portfolio or check back as new work is published.
            </p>
          )}
        </Container>
      </Section>
    </>
  );
}

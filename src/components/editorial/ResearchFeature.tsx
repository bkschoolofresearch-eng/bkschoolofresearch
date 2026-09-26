import { ArrowLink } from '@/components/ui/ArrowLink';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ImageFrame } from '@/components/ui/ImageFrame';
import { ResearchProjectMedia } from '@/components/editorial/ResearchProjectMedia';
import { asExternalHttpUrl } from '@/lib/content/research-links';
import { getResearchProjectCoverUrl } from '@/lib/content/prototype-media';
import { RESEARCH_STATUS_LABELS } from '@/lib/public/labels';
import type { ResearchProject } from '@/types/content';
import { cn } from '@/lib/utils';

/** External journal/DOI/source only — never an internal detail route. */
export function researchProjectHref(project: ResearchProject): string | null {
  return asExternalHttpUrl(project.url);
}

export function researchProjectIsExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

type ResearchProjectAnchorProps = {
  project: ResearchProject;
  className?: string;
  children: React.ReactNode;
};

/** Opens attached external journal/source; non-link when none is set. */
export function ResearchProjectAnchor({
  project,
  className,
  children,
}: ResearchProjectAnchorProps) {
  const href = researchProjectHref(project);
  if (!href) {
    return <div className={className}>{children}</div>;
  }
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

type ResearchFeatureProps = {
  project: ResearchProject;
  imageIndex?: number;
  className?: string;
};

/**
 * Single featured strip (legacy / publications-style). Prefer
 * ResearchFeaturedGrid on `/research`.
 */
export function ResearchFeature({
  project,
  className,
}: ResearchFeatureProps) {
  const href = researchProjectHref(project);
  const cover = getResearchProjectCoverUrl(project);
  const statusLabel = RESEARCH_STATUS_LABELS[project.researchStatus];
  const yearLabel = project.year ? String(project.year) : null;
  const meta = [statusLabel, yearLabel].filter(Boolean).join(' · ');

  return (
    <article
      className={cn(
        'grid items-start gap-8 lg:grid-cols-12 lg:gap-x-12 xl:gap-x-14',
        className,
      )}
    >
      <div className="lg:col-span-3">
        {cover ? (
          <ImageFrame
            src={cover}
            alt=""
            aspect="portrait"
            sizes="(max-width: 1024px) 40vw, 18vw"
            framed
            frameClassName="mx-auto max-w-[11rem] lg:mx-0 lg:max-w-none"
          />
        ) : (
          <div
            className="mx-auto flex aspect-3/4 w-full max-w-[11rem] flex-col justify-between rounded-[0.65rem] border border-ink/8 bg-surface-subtle p-4 lg:mx-0 lg:max-w-none"
            aria-hidden
          >
            <span className="font-sans text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted">
              {statusLabel}
            </span>
            <span className="font-display text-3xl leading-none tabular-nums text-ink/25 sm:text-4xl">
              {yearLabel ?? statusLabel.slice(0, 2)}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 self-center lg:col-span-9">
        <Eyebrow>Featured</Eyebrow>
        {meta ? (
          <p className="mt-4 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
            {meta}
          </p>
        ) : null}
        <h2 className="mt-3 max-w-3xl font-display text-2xl leading-snug text-ink sm:text-3xl">
          {href ? (
            <a
              href={href}
              className="transition-colors hover:text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h2>
        {project.leadAuthorNames.length ? (
          <p className="mt-3 text-sm text-muted">
            {project.leadAuthorNames.join(', ')}
          </p>
        ) : null}
        {href ? (
          <ArrowLink href={href} className="mt-6" external>
            Open publication
          </ArrowLink>
        ) : null}
      </div>
    </article>
  );
}

const FEATURED_HUB_LIMIT = 4;

/** Prefer admin-flagged items; otherwise fall back to ongoing then newest. */
export function pickResearchHubFeatured(
  projects: ResearchProject[],
  limit = FEATURED_HUB_LIMIT,
): ResearchProject[] {
  const flagged = projects.filter((p) => p.featuredOnResearchPage);
  if (flagged.length) {
    return flagged
      .slice()
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      .slice(0, limit);
  }
  const ongoing = projects.filter((p) => p.researchStatus === 'ongoing');
  const pool = ongoing.length ? ongoing : projects;
  return pool.slice(0, limit);
}

type ResearchFeaturedGridProps = {
  projects: ResearchProject[];
  className?: string;
};

/**
 * `/research` featured row — up to four equal cards (admin-picked).
 */
export function ResearchFeaturedGrid({
  projects,
  className,
}: ResearchFeaturedGridProps) {
  if (!projects.length) return null;

  return (
    <ul
      className={cn(
        'grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4',
        className,
      )}
    >
      {projects.map((project) => {
        const href = researchProjectHref(project);
        const statusLabel = RESEARCH_STATUS_LABELS[project.researchStatus];
        const yearLabel = project.year ? String(project.year) : null;
        const meta = [statusLabel, yearLabel].filter(Boolean).join(' · ');

        return (
          <li key={project.id} className="min-w-0">
            <ResearchProjectAnchor
              project={project}
              className={cn(
                'group flex h-full flex-col',
                href && 'transition-opacity hover:opacity-95',
              )}
            >
              <div className="w-full max-w-[8.5rem] overflow-hidden rounded-[0.65rem] sm:max-w-[9.5rem]">
                <ResearchProjectMedia project={project} size="feature" />
              </div>
              <div className="mt-3 flex min-h-0 flex-1 flex-col">
                <Eyebrow>Featured</Eyebrow>
                {meta ? (
                  <p className="mt-2 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
                    {meta}
                  </p>
                ) : null}
                <h2
                  className={cn(
                    'mt-2 font-display text-base leading-snug text-ink sm:text-lg',
                    href && 'transition-colors group-hover:text-accent',
                  )}
                >
                  <span className="line-clamp-5">{project.title}</span>
                </h2>
              </div>
            </ResearchProjectAnchor>
          </li>
        );
      })}
    </ul>
  );
}

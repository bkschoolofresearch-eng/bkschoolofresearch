import { ArrowRight } from 'lucide-react';
import {
  ResearchProjectAnchor,
  researchProjectHref,
} from '@/components/editorial/ResearchFeature';
import { ResearchProjectMedia } from '@/components/editorial/ResearchProjectMedia';
import {
  MediaCardBody,
  MediaCardMedia,
  MediaCardMeta,
  MediaCardTitle,
} from '@/components/ui/MediaCard';
import { RESEARCH_STATUS_LABELS } from '@/lib/public/labels';
import type { ResearchProject } from '@/types/content';
import { cn } from '@/lib/utils';

type ResearchProjectCardProps = {
  project: ResearchProject;
  imageIndex?: number;
  areaLabels?: string[];
  className?: string;
};

/** Homepage-language research tile — CMS cover or typographic plate. */
export function ResearchProjectCard({
  project,
  areaLabels = [],
  className,
}: ResearchProjectCardProps) {
  const href = researchProjectHref(project);
  const meta = [
    RESEARCH_STATUS_LABELS[project.researchStatus],
    project.year ? String(project.year) : null,
    areaLabels[0],
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ResearchProjectAnchor
      project={project}
      className={cn(
        'group/card relative flex h-full flex-col overflow-hidden bg-white',
        'border border-border',
        href && 'transition-[border-color] duration-200 hover:border-ink/35',
        href &&
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className,
      )}
    >
      <MediaCardMedia>
        <ResearchProjectMedia
          project={project}
          size="list"
          className="sm:rounded-[0.65rem] sm:border-ink/8"
        />
      </MediaCardMedia>
      <MediaCardBody>
        <MediaCardMeta>{meta}</MediaCardMeta>
        <MediaCardTitle>{project.title}</MediaCardTitle>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">
          {project.summary}
        </p>
        {project.leadAuthorNames.length ? (
          <p className="font-instrument text-sm text-body">
            {project.leadAuthorNames.join(', ')}
          </p>
        ) : null}
        {href ? (
          <span className="mt-auto inline-flex items-center gap-2 border-b border-ink pb-0.5 font-instrument text-sm font-medium text-ink transition-colors group-hover/card:border-accent group-hover/card:text-accent">
            Open publication
            <ArrowRight className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
        ) : null}
      </MediaCardBody>
    </ResearchProjectAnchor>
  );
}

type ResearchFeatureCardProps = {
  project: ResearchProject;
  imageIndex?: number;
  areaLabels?: string[];
  className?: string;
};

/** Lead project strip — From the library / news featured language. */
export function ResearchFeatureCard({
  project,
  areaLabels = [],
  className,
}: ResearchFeatureCardProps) {
  const href = researchProjectHref(project);

  return (
    <article
      className={cn(
        'grid gap-6 border border-border bg-white lg:grid-cols-12 lg:gap-0',
        className,
      )}
    >
      <ResearchProjectAnchor
        project={project}
        className="relative block overflow-hidden bg-surface lg:col-span-5"
      >
        <ResearchProjectMedia
          project={project}
          size="feature"
          className="mx-0 max-w-none rounded-none border-0 lg:aspect-video lg:max-h-none"
        />
      </ResearchProjectAnchor>
      <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-7 lg:p-10 xl:p-12">
        <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent">
          {[
            RESEARCH_STATUS_LABELS[project.researchStatus],
            project.year ? String(project.year) : null,
            ...areaLabels.slice(0, 2),
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl lg:text-[2.75rem]">
          {href ? (
            <ResearchProjectAnchor
              project={project}
              className="transition-colors hover:text-accent"
            >
              {project.title}
            </ResearchProjectAnchor>
          ) : (
            project.title
          )}
        </h2>
        <p className="mt-4 max-w-2xl font-instrument text-base leading-relaxed text-muted md:text-lg">
          {project.summary}
        </p>
        {project.leadAuthorNames.length ? (
          <p className="mt-4 text-sm text-body">
            {project.leadAuthorNames.join(', ')}
          </p>
        ) : null}
        {href ? (
          <ResearchProjectAnchor
            project={project}
            className="mt-8 inline-flex w-fit items-center gap-2 border-b border-ink pb-0.5 font-instrument text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Open publication
            <ArrowRight className="size-5" strokeWidth={1.5} aria-hidden />
          </ResearchProjectAnchor>
        ) : null}
      </div>
    </article>
  );
}

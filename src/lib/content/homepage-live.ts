import { demoResearcherQuotes } from '@/content/seed/demo-roster';
import { researchProjectVenueLine } from '@/lib/content/research-links';
import type {
  Event,
  HomepageConfig,
  MediaClipping,
  Notice,
  Person,
  Publication,
  ResearchArea,
  ResearchProject,
} from '@/types/content';

export type HomepageQuote = {
  imageSrc: string;
  quote: string;
  name: string;
  role: string;
};

type LiveSources = {
  areas: ResearchArea[];
  projects: ResearchProject[];
  people: Person[];
  notices: Notice[];
  events: Event[];
  media: MediaClipping[];
  opinions: Publication[];
};

export type LiveHomepage = {
  areas: ResearchArea[];
  research: ResearchProject[];
  people: Person[];
  notices: Notice[];
  events: Event[];
  media: MediaClipping[];
  opinions: Publication[];
  quotes: HomepageQuote[];
};

function published<T extends { status?: string }>(items: T[] | undefined): T[] {
  return (items ?? []).filter((item) => item.status === 'published');
}

function orderedPicks<T extends { id: string }>(
  ids: string[] | undefined,
  items: T[],
): T[] {
  if (!ids?.length) return [];
  return ids
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is T => Boolean(item));
}

function byOrder<T extends { order?: number; title?: string; name?: string }>(
  a: T,
  b: T,
) {
  return (
    (a.order ?? 999) - (b.order ?? 999) ||
    (a.title ?? a.name ?? '').localeCompare(b.title ?? b.name ?? '')
  );
}

function showcaseRank(project: ResearchProject) {
  let score = 0;
  if (project.researchStatus === 'completed') score += 10;
  if (project.featuredImageUrl?.trim()) score += 6;
  if ((project.leadAuthorNames?.length ?? 0) > 0) score += 3;
  if (researchProjectVenueLine(project) || project.venue?.trim()) score += 3;
  if (project.url?.trim()) score += 2;
  return score;
}

/** The records the public homepage is actually showing. Empty pick lists use the same automatic set as the site. */
export function resolveLiveHomepage(
  homepage: HomepageConfig,
  sources: LiveSources,
): LiveHomepage {
  const areas = published(sources.areas).sort(byOrder);
  const projects = published(sources.projects);
  const people = published(sources.people).sort(byOrder);
  const notices = published(sources.notices).sort((a, b) => {
    const aDate = a.publishedAt ?? a.createdAt;
    const bDate = b.publishedAt ?? b.createdAt;
    return bDate.localeCompare(aDate);
  });
  const events = published(sources.events).sort((a, b) =>
    b.startAt.localeCompare(a.startAt),
  );
  const media = published(sources.media).sort(
    (a, b) => b.year - a.year || a.title.localeCompare(b.title),
  );
  const opinions = published(sources.opinions)
    .filter((item) => item.type === 'opinion')
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

  const director =
    people.find((person) => person.id === homepage.directorPersonId) ??
    people.find((person) => person.category === 'executive-director');

  const pickedResearch = orderedPicks(
    homepage.featuredResearchProjectIds,
    projects,
  );
  const researchPool = pickedResearch.length
    ? pickedResearch
    : [...projects].sort(
        (a, b) =>
          showcaseRank(b) - showcaseRank(a) || (b.year ?? 0) - (a.year ?? 0),
      );

  const pickedPeople = orderedPicks(homepage.featuredPersonIds, people).filter(
    (person) => person.id !== director?.id,
  );
  const peoplePool = pickedPeople.length
    ? pickedPeople
    : people.filter((person) => person.id !== director?.id);

  const pickedEvents = orderedPicks(homepage.featuredEventIds, events);
  const pickedNotices = orderedPicks(homepage.featuredNoticeIds, notices);
  const pickedAreas = orderedPicks(homepage.featuredResearchAreaIds, areas);
  const pickedMedia = orderedPicks(homepage.featuredMediaClippingIds, media);
  const pickedOpinions = orderedPicks(
    homepage.featuredPublicationIds,
    opinions,
  );

  const quotes = homepage.researcherQuotes?.length
    ? homepage.researcherQuotes.map((quote) => ({ ...quote }))
    : demoResearcherQuotes.map((quote) => ({ ...quote }));

  return {
    areas: pickedAreas.length ? pickedAreas : areas,
    research: researchPool.slice(0, 5),
    people: peoplePool.slice(0, 4),
    notices: (pickedNotices.length ? pickedNotices : notices).slice(0, 3),
    events: (pickedEvents.length ? pickedEvents : events).slice(0, 3),
    media: (pickedMedia.length ? pickedMedia : media).slice(0, 6),
    opinions: (pickedOpinions.length ? pickedOpinions : opinions).slice(0, 3),
    quotes,
  };
}

/** Fill empty homepage pick lists with the items the public page is already showing. */
export function hydrateHomepagePicks(
  homepage: HomepageConfig,
  sources: LiveSources,
): HomepageConfig {
  const live = resolveLiveHomepage(homepage, sources);
  const opinionIds = new Set(
    published(sources.opinions)
      .filter((item) => item.type === 'opinion')
      .map((item) => item.id),
  );
  const storedPublications = homepage.featuredPublicationIds ?? [];
  const storedOpinions = storedPublications.filter((id) => opinionIds.has(id));
  const otherPublications = storedPublications.filter(
    (id) => !opinionIds.has(id),
  );

  return {
    ...homepage,
    featuredResearchAreaIds: homepage.featuredResearchAreaIds?.length
      ? homepage.featuredResearchAreaIds
      : live.areas.map((item) => item.id),
    featuredResearchProjectIds: homepage.featuredResearchProjectIds?.length
      ? homepage.featuredResearchProjectIds
      : live.research.map((item) => item.id),
    featuredPersonIds: homepage.featuredPersonIds?.length
      ? homepage.featuredPersonIds
      : live.people.map((item) => item.id),
    featuredNoticeIds: homepage.featuredNoticeIds?.length
      ? homepage.featuredNoticeIds
      : live.notices.map((item) => item.id),
    featuredEventIds: homepage.featuredEventIds?.length
      ? homepage.featuredEventIds
      : live.events.map((item) => item.id),
    featuredMediaClippingIds: homepage.featuredMediaClippingIds?.length
      ? homepage.featuredMediaClippingIds
      : live.media.map((item) => item.id),
    featuredPublicationIds: storedOpinions.length
      ? storedPublications
      : [...live.opinions.map((item) => item.id), ...otherPublications],
    researcherQuotes: homepage.researcherQuotes?.length
      ? homepage.researcherQuotes.map((quote) => ({ ...quote }))
      : live.quotes,
  };
}

import { getDatabase, getSeedDatabase } from '@/lib/cms/repository';
import { researchProjectExternalUrl } from '@/lib/content/research-links';
import type { ContentDatabase } from '@/types/content';

export type SearchCategory =
  | 'all'
  | 'publications'
  | 'research'
  | 'people'
  | 'news'
  | 'events'
  | 'notices'
  | 'resources'
  | 'media';

export interface SearchResult {
  id: string;
  category: Exclude<SearchCategory, 'all'>;
  title: string;
  slug: string;
  href: string;
  excerpt: string;
  keywords: string[];
}

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFKD');
}

function matchesQuery(haystack: string, query: string): boolean {
  if (!query) return true;
  return normalize(haystack).includes(normalize(query));
}

function buildIndex(database: ContentDatabase): SearchResult[] {
  const results: SearchResult[] = [];

  for (const pub of database.publications) {
    results.push({
      id: pub.id,
      category: 'publications',
      title: pub.title,
      slug: pub.slug,
      href: `/publications/${pub.slug}`,
      excerpt: pub.citation,
      keywords: [
        pub.type,
        pub.venue ?? '',
        ...pub.authors,
        String(pub.year),
        ...(pub.areaIds ?? []),
      ],
    });
  }

  for (const project of database.researchProjects) {
    const byId = new Map(database.publications.map((pub) => [pub.id, pub]));
    const href =
      researchProjectExternalUrl(project, byId) ?? '/research';
    results.push({
      id: project.id,
      category: 'research',
      title: project.title,
      slug: project.slug,
      href,
      excerpt: project.summary,
      keywords: [
        project.researchStatus,
        ...project.leadAuthorNames,
        ...project.areaIds,
      ],
    });
  }

  for (const area of database.researchAreas) {
    results.push({
      id: area.id,
      category: 'research',
      title: area.title,
      slug: area.slug,
      href: `/research/areas#${area.slug}`,
      excerpt: area.shortDescription ?? area.description,
      keywords: ['research-area', area.slug],
    });
  }

  for (const person of database.people) {
    results.push({
      id: person.id,
      category: 'people',
      title: person.name,
      slug: person.slug,
      href: `/people/${person.slug}`,
      excerpt: person.shortBio ?? person.bio.slice(0, 200),
      keywords: [person.role, person.category, person.affiliation ?? ''],
    });
  }

  for (const article of database.news) {
    results.push({
      id: article.id,
      category: 'news',
      title: article.title,
      slug: article.slug,
      href: `/news/${article.slug}`,
      excerpt: article.excerpt,
      keywords: [...(article.categoryLabels ?? []), article.author ?? ''],
    });
  }

  for (const event of database.events) {
    results.push({
      id: event.id,
      category: 'events',
      title: event.title,
      slug: event.slug,
      href: `/events/${event.slug}`,
      excerpt: event.summary,
      keywords: [...(event.speakers ?? []), event.eventStatus],
    });
  }

  for (const notice of database.notices) {
    results.push({
      id: notice.id,
      category: 'notices',
      title: notice.title,
      slug: notice.slug,
      href: `/notices/${notice.slug}`,
      excerpt: notice.summary,
      keywords: [notice.noticeType],
    });
  }

  for (const clipping of database.mediaClippings ?? []) {
    const href = clipping.url?.trim() || '/media';
    results.push({
      id: clipping.id,
      category: 'media',
      title: clipping.title,
      slug: clipping.slug,
      href,
      excerpt: clipping.abstract?.trim() || clipping.citation,
      keywords: [clipping.venue ?? '', ...clipping.authors, String(clipping.year)],
    });
  }

  for (const resource of database.resources) {
    results.push({
      id: resource.id,
      category: 'resources',
      title: resource.title,
      slug: resource.slug,
      href: `/resources/${resource.slug}`,
      excerpt: resource.summary,
      keywords: [
        resource.resourceType,
        ...(resource.topics ?? []),
        ...(resource.software ?? []),
      ],
    });
  }

  return results;
}

export function searchContent(
  query: string,
  category: SearchCategory = 'all',
  options?: { database?: ContentDatabase; useSeed?: boolean },
): SearchResult[] {
  const database =
    options?.database ??
    (options?.useSeed ? getSeedDatabase() : getDatabase());
  const index = buildIndex(database);
  const q = query.trim();

  return index.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    const blob = [item.title, item.excerpt, ...item.keywords].join(' ');
    return matchesQuery(blob, q);
  });
}

export function getSearchIndex(
  options?: { database?: ContentDatabase; useSeed?: boolean },
): SearchResult[] {
  return searchContent('', 'all', options);
}

/** Convenience alias for overlay / client search consumers */
export const searchIndex = getSearchIndex;

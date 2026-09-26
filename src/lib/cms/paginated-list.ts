import type {
  ContentCollectionKey,
  Publication,
  ResearchProject,
  ResearchStatus,
} from '@/types/content';
import {
  publicationExternalUrl,
  researchProjectExternalUrl,
} from '@/lib/content/research-links';

export const DEFAULT_LIST_PAGE_SIZE = 20;
export const MAX_LIST_PAGE_SIZE = 10_000;

export type ResearchListSort =
  | 'category'
  | 'type'
  | 'updated_desc'
  | 'updated_asc'
  | 'year_desc'
  | 'year_asc'
  | 'title_asc';

export type CollectionListQuery = {
  page: number;
  pageSize: number;
  q?: string;
  /** Content visibility: draft | published | archived */
  status?: string;
  /** Research category: ongoing | completed | planned | archived */
  researchStatus?: string;
  /** Publication type: journal | report | … */
  publicationType?: string;
  yearFrom?: number;
  yearTo?: number;
  areaId?: string;
  /** true = featured only, false = not featured */
  featured?: boolean;
  /** true = has link, false = missing link */
  hasLink?: boolean;
  sort?: ResearchListSort;
  /** Include global facet counts (for filter chips). */
  facets?: boolean;
};

export type ResearchListFacets = {
  total: number;
  published: number;
  featured: number;
  withLink: number;
  byCategory: Record<ResearchStatus, number>;
  byStatus: {
    draft: number;
    published: number;
    archived: number;
  };
};

export type PublicationListFacets = {
  total: number;
  published: number;
  withLink: number;
  byType: Record<string, number>;
  byStatus: {
    draft: number;
    published: number;
    archived: number;
  };
};

export type ResearchListOptions = {
  years: number[];
  areas: Array<{ id: string; title: string }>;
};

export type CollectionListResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  facets?: ResearchListFacets | PublicationListFacets;
  options?: ResearchListOptions;
  related?: {
    publications?: Array<{
      id: string;
      url?: string | null;
      doi?: string | null;
      citation?: string | null;
    }>;
    researchAreas: Array<{ id: string; title: string }>;
  };
};

const RESEARCH_STATUS_RANK: ResearchStatus[] = [
  'ongoing',
  'completed',
  'planned',
  'archived',
];

const SORT_VALUES = new Set<ResearchListSort>([
  'category',
  'type',
  'updated_desc',
  'updated_asc',
  'year_desc',
  'year_asc',
  'title_asc',
]);

function parseOptionalInt(value: string | null): number | undefined {
  if (!value?.trim()) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseOptionalBool(value: string | null): boolean | undefined {
  if (value === '1' || value === 'true') return true;
  if (value === '0' || value === 'false') return false;
  return undefined;
}

export function parseCollectionListQuery(
  searchParams: URLSearchParams,
): CollectionListQuery {
  const page = Math.max(1, Number(searchParams.get('page') || 1) || 1);
  const rawSize = Number(
    searchParams.get('limit') ||
      searchParams.get('pageSize') ||
      DEFAULT_LIST_PAGE_SIZE,
  );
  const pageSize = Math.min(
    MAX_LIST_PAGE_SIZE,
    Math.max(1, Number.isFinite(rawSize) ? rawSize : DEFAULT_LIST_PAGE_SIZE),
  );
  const sortRaw = searchParams.get('sort')?.trim() as ResearchListSort | undefined;
  const defaultSort: ResearchListSort = 'category';

  return {
    page,
    pageSize,
    q: searchParams.get('q')?.trim() || undefined,
    status: searchParams.get('status')?.trim() || undefined,
    researchStatus: searchParams.get('researchStatus')?.trim() || undefined,
    publicationType: searchParams.get('type')?.trim() || undefined,
    yearFrom: parseOptionalInt(searchParams.get('yearFrom')),
    yearTo: parseOptionalInt(searchParams.get('yearTo')),
    areaId: searchParams.get('areaId')?.trim() || undefined,
    featured: parseOptionalBool(searchParams.get('featured')),
    hasLink: parseOptionalBool(searchParams.get('hasLink')),
    sort: sortRaw && SORT_VALUES.has(sortRaw) ? sortRaw : defaultSort,
    facets: searchParams.get('facets') === '1',
  };
}

/**
 * Same rule as the admin Open column / public card click:
 * explicit URL, DOI in text, or a linked publication with a real URL/DOI.
 */
export function researchHasLink(
  item: ResearchProject,
  publicationsById?: Map<
    string,
    Pick<Publication, 'url' | 'doi' | 'citation'>
  >,
): boolean {
  return Boolean(
    researchProjectExternalUrl(
      item,
      publicationsById as Map<string, Publication> | undefined,
    ),
  );
}

export function researchMatchesQuery(
  item: ResearchProject,
  q: string | undefined,
): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const blob = [
    item.title,
    item.summary,
    item.venue,
    item.description,
    item.url,
    ...(item.leadAuthorNames ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return blob.includes(needle);
}

export function sortResearchProjects(
  list: ResearchProject[],
  sort: ResearchListSort = 'category',
): ResearchProject[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'updated_asc':
        return String(a.updatedAt ?? '').localeCompare(String(b.updatedAt ?? ''));
      case 'updated_desc':
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
      case 'year_asc':
        return (a.year ?? 0) - (b.year ?? 0);
      case 'year_desc':
        return (b.year ?? 0) - (a.year ?? 0);
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'category':
      default: {
        const cat =
          RESEARCH_STATUS_RANK.indexOf(a.researchStatus) -
          RESEARCH_STATUS_RANK.indexOf(b.researchStatus);
        if (cat !== 0) return cat;
        const year = (b.year ?? 0) - (a.year ?? 0);
        if (year !== 0) return year;
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
      }
    }
  });
}

export function filterResearchProjects(
  list: ResearchProject[],
  query: CollectionListQuery,
  publicationsById?: Map<
    string,
    Pick<Publication, 'url' | 'doi' | 'citation'>
  >,
): ResearchProject[] {
  return list.filter((item) => {
    if (query.researchStatus && item.researchStatus !== query.researchStatus) {
      return false;
    }
    if (query.status && item.status !== query.status) return false;
    if (query.yearFrom != null && (item.year ?? 0) < query.yearFrom) return false;
    if (query.yearTo != null && (item.year ?? 9999) > query.yearTo) return false;
    if (query.areaId && !(item.areaIds ?? []).includes(query.areaId)) return false;
    if (query.featured === true && !item.featuredOnResearchPage) return false;
    if (query.featured === false && item.featuredOnResearchPage) return false;
    if (query.hasLink === true && !researchHasLink(item, publicationsById)) {
      return false;
    }
    if (query.hasLink === false && researchHasLink(item, publicationsById)) {
      return false;
    }
    return researchMatchesQuery(item, query.q);
  });
}

export function buildResearchFacets(
  list: ResearchProject[],
  publicationsById?: Map<
    string,
    Pick<Publication, 'url' | 'doi' | 'citation'>
  >,
): ResearchListFacets {
  const byCategory = {
    ongoing: 0,
    completed: 0,
    planned: 0,
    archived: 0,
  } satisfies Record<ResearchStatus, number>;
  const byStatus = { draft: 0, published: 0, archived: 0 };

  let featured = 0;
  let withLink = 0;
  let published = 0;

  for (const item of list) {
    byCategory[item.researchStatus] =
      (byCategory[item.researchStatus] ?? 0) + 1;
    if (item.status === 'draft' || item.status === 'published' || item.status === 'archived') {
      byStatus[item.status] += 1;
    }
    if (item.status === 'published') published += 1;
    if (item.featuredOnResearchPage) featured += 1;
    if (researchHasLink(item, publicationsById)) withLink += 1;
  }

  return {
    total: list.length,
    published,
    featured,
    withLink,
    byCategory,
    byStatus,
  };
}

export function buildResearchYears(list: ResearchProject[]): number[] {
  const years = new Set<number>();
  for (const item of list) {
    if (typeof item.year === 'number' && item.year > 0) years.add(item.year);
  }
  return [...years].sort((a, b) => b - a);
}

export function paginateInMemory<T>(
  list: T[],
  page: number,
  pageSize: number,
): { items: T[]; total: number; page: number; pageSize: number } {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: list.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
  };
}

export function publicationHasLink(item: Publication): boolean {
  return Boolean(publicationExternalUrl(item));
}

export function publicationMatchesQuery(
  item: Publication,
  q: string | undefined,
): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const blob = [
    item.title,
    item.citation,
    item.abstract,
    item.venue,
    item.doi,
    item.url,
    item.publisher,
    ...(item.authors ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return blob.includes(needle);
}

export function sortPublications(
  list: Publication[],
  sort: ResearchListSort = 'type',
): Publication[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'updated_asc':
        return String(a.updatedAt ?? '').localeCompare(String(b.updatedAt ?? ''));
      case 'updated_desc':
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
      case 'year_asc':
        return (a.year ?? 0) - (b.year ?? 0);
      case 'year_desc':
        return (b.year ?? 0) - (a.year ?? 0);
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'type':
      case 'category':
      default: {
        const typeCmp = String(a.type).localeCompare(String(b.type));
        if (typeCmp !== 0) return typeCmp;
        const year = (b.year ?? 0) - (a.year ?? 0);
        if (year !== 0) return year;
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
      }
    }
  });
}

export function filterPublications(
  list: Publication[],
  query: CollectionListQuery,
): Publication[] {
  return list.filter((item) => {
    if (query.publicationType && item.type !== query.publicationType) {
      return false;
    }
    if (query.status && item.status !== query.status) return false;
    if (query.yearFrom != null && (item.year ?? 0) < query.yearFrom) return false;
    if (query.yearTo != null && (item.year ?? 9999) > query.yearTo) return false;
    if (query.areaId && !(item.areaIds ?? []).includes(query.areaId)) return false;
    if (query.hasLink === true && !publicationHasLink(item)) return false;
    if (query.hasLink === false && publicationHasLink(item)) return false;
    return publicationMatchesQuery(item, query.q);
  });
}

export function buildPublicationFacets(
  list: Publication[],
): PublicationListFacets {
  const byType: Record<string, number> = {};
  const byStatus = { draft: 0, published: 0, archived: 0 };
  let withLink = 0;
  let published = 0;

  for (const item of list) {
    byType[item.type] = (byType[item.type] ?? 0) + 1;
    if (
      item.status === 'draft' ||
      item.status === 'published' ||
      item.status === 'archived'
    ) {
      byStatus[item.status] += 1;
    }
    if (item.status === 'published') published += 1;
    if (publicationHasLink(item)) withLink += 1;
  }

  return {
    total: list.length,
    published,
    withLink,
    byType,
    byStatus,
  };
}

export function buildPublicationYears(list: Publication[]): number[] {
  const years = new Set<number>();
  for (const item of list) {
    if (typeof item.year === 'number' && item.year > 0) years.add(item.year);
  }
  return [...years].sort((a, b) => b - a);
}

export function supportsResearchListQuery(
  collection: ContentCollectionKey,
): boolean {
  return collection === 'researchProjects';
}

export function supportsPublicationListQuery(
  collection: ContentCollectionKey,
): boolean {
  return collection === 'publications';
}

export function mongoSortStages(sort: ResearchListSort = 'category') {
  const researchRankField = {
    $addFields: {
      _rank: {
        $switch: {
          branches: [
            { case: { $eq: ['$researchStatus', 'ongoing'] }, then: 0 },
            { case: { $eq: ['$researchStatus', 'completed'] }, then: 1 },
            { case: { $eq: ['$researchStatus', 'planned'] }, then: 2 },
            { case: { $eq: ['$researchStatus', 'archived'] }, then: 3 },
          ],
          default: 9,
        },
      },
    },
  };

  switch (sort) {
    case 'updated_asc':
      return [{ $sort: { updatedAt: 1 as const } }];
    case 'updated_desc':
      return [{ $sort: { updatedAt: -1 as const } }];
    case 'year_asc':
      return [{ $sort: { year: 1 as const, updatedAt: -1 as const } }];
    case 'year_desc':
      return [{ $sort: { year: -1 as const, updatedAt: -1 as const } }];
    case 'title_asc':
      return [{ $sort: { title: 1 as const } }];
    case 'type':
      return [{ $sort: { type: 1 as const, year: -1 as const, updatedAt: -1 as const } }];
    case 'category':
    default:
      return [
        researchRankField,
        { $sort: { _rank: 1 as const, year: -1 as const, updatedAt: -1 as const } },
      ];
  }
}

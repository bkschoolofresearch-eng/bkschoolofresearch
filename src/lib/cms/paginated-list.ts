import type {
  ContentCollectionKey,
  Activity,
  ActivityType,
  Event,
  EventStatus,
  MediaClipping,
  NewsArticle,
  Notice,
  NoticeType,
  Publication,
  Resource,
  ResourceType,
  ResearchArea,
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
  | 'title_asc'
  | 'start_desc'
  | 'start_asc'
  | 'deadline_desc'
  | 'deadline_asc'
  | 'order_asc'
  | 'published_desc'
  | 'published_asc';

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
  /** Event calendar: upcoming | past | cancelled */
  eventStatus?: string;
  /** true = online only, false = in person only */
  online?: boolean;
  /** true = registration form or external link, false = neither */
  hasRegistration?: boolean;
  /** Notice type: vacancy | announcement | deadline | general */
  noticeType?: string;
  /** true = career application form attached */
  hasApplication?: boolean;
  /** Activity programme: capacity-building | awareness-campaign | … */
  activityType?: string;
  /** Resource kind: tutorial | video-series | archive | … */
  resourceType?: string;
  /** Exact software tag, for example Stata */
  software?: string;
  /** News language code, for example en or bn */
  newsLanguage?: string;
  /** News topic label, matched against categoryLabels */
  newsCategory?: string;
  /** Press clipping language code, for example en or bn */
  clippingLanguage?: string;
  /** Press outlet name, matched against venue */
  outlet?: string;
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

export type EventListFacets = {
  total: number;
  published: number;
  withRegistration: number;
  byCalendar: Record<EventStatus, number>;
  byStatus: {
    draft: number;
    published: number;
    archived: number;
  };
};

export type NoticeListFacets = {
  total: number;
  published: number;
  withApplication: number;
  byType: Record<NoticeType, number>;
  byStatus: {
    draft: number;
    published: number;
    archived: number;
  };
};

export type ActivityListFacets = {
  total: number;
  published: number;
  byType: Record<ActivityType, number>;
  byStatus: {
    draft: number;
    published: number;
    archived: number;
  };
};

export type MediaClippingListFacets = {
  total: number;
  published: number;
  byLanguage: Record<string, number>;
  byOutlet: Record<string, number>;
  byStatus: {
    draft: number;
    published: number;
    archived: number;
  };
};

export type NewsListFacets = {
  total: number;
  published: number;
  byLanguage: Record<string, number>;
  byCategory: Record<string, number>;
  byStatus: {
    draft: number;
    published: number;
    archived: number;
  };
};

export type ResourceListFacets = {
  total: number;
  published: number;
  byType: Record<ResourceType, number>;
  bySoftware: Record<string, number>;
  byStatus: {
    draft: number;
    published: number;
    archived: number;
  };
};

export type ResearchAreaListFacets = {
  total: number;
  published: number;
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
  facets?:
    | ResearchListFacets
    | PublicationListFacets
    | EventListFacets
    | NoticeListFacets
    | ActivityListFacets
    | ResourceListFacets
    | NewsListFacets
    | MediaClippingListFacets
    | ResearchAreaListFacets;
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
  'start_desc',
  'start_asc',
  'deadline_desc',
  'deadline_asc',
  'order_asc',
  'published_desc',
  'published_asc',
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
    eventStatus: searchParams.get('eventStatus')?.trim() || undefined,
    online: parseOptionalBool(searchParams.get('online')),
    hasRegistration: parseOptionalBool(searchParams.get('hasRegistration')),
    noticeType: searchParams.get('noticeType')?.trim() || undefined,
    hasApplication: parseOptionalBool(searchParams.get('hasApplication')),
    activityType: searchParams.get('activityType')?.trim() || undefined,
    resourceType: searchParams.get('resourceType')?.trim() || undefined,
    software: searchParams.get('software')?.trim() || undefined,
    newsLanguage: searchParams.get('newsLanguage')?.trim() || undefined,
    newsCategory: searchParams.get('newsCategory')?.trim() || undefined,
    clippingLanguage: searchParams.get('clippingLanguage')?.trim() || undefined,
    outlet: searchParams.get('outlet')?.trim() || undefined,
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

const EVENT_STATUS_RANK: EventStatus[] = ['upcoming', 'past', 'cancelled'];

export function eventStartYear(item: Pick<Event, 'startAt'>): number | null {
  const raw = item.startAt?.trim() ?? '';
  const year = Number(raw.slice(0, 4));
  return Number.isFinite(year) && year > 1900 && year < 3000 ? year : null;
}

export function eventHasRegistration(item: Event): boolean {
  return Boolean(item.registrationUrl?.trim() || item.registrationFormId?.trim());
}

export function eventMatchesQuery(item: Event, q: string | undefined): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const blob = [
    item.title,
    item.summary,
    item.description,
    item.location,
    ...(item.speakers ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return blob.includes(needle);
}

export function sortEvents(
  list: Event[],
  sort: ResearchListSort = 'start_desc',
): Event[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'start_asc':
        return String(a.startAt ?? '').localeCompare(String(b.startAt ?? ''));
      case 'updated_asc':
        return String(a.updatedAt ?? '').localeCompare(String(b.updatedAt ?? ''));
      case 'updated_desc':
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'start_desc':
      default: {
        const start = String(b.startAt ?? '').localeCompare(String(a.startAt ?? ''));
        if (start !== 0) return start;
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
      }
    }
  });
}

export function filterEvents(list: Event[], query: CollectionListQuery): Event[] {
  return list.filter((item) => {
    if (query.eventStatus && item.eventStatus !== query.eventStatus) return false;
    if (query.status && item.status !== query.status) return false;
    const year = eventStartYear(item);
    if (query.yearFrom != null && (year ?? 0) < query.yearFrom) return false;
    if (query.yearTo != null && (year ?? 9999) > query.yearTo) return false;
    if (query.online === true && !item.isOnline) return false;
    if (query.online === false && item.isOnline) return false;
    if (query.hasRegistration === true && !eventHasRegistration(item)) return false;
    if (query.hasRegistration === false && eventHasRegistration(item)) {
      return false;
    }
    return eventMatchesQuery(item, query.q);
  });
}

export function buildEventFacets(list: Event[]): EventListFacets {
  const byCalendar = {
    upcoming: 0,
    past: 0,
    cancelled: 0,
  } satisfies Record<EventStatus, number>;
  const byStatus = { draft: 0, published: 0, archived: 0 };
  let withRegistration = 0;
  let published = 0;

  for (const item of list) {
    if (EVENT_STATUS_RANK.includes(item.eventStatus)) {
      byCalendar[item.eventStatus] += 1;
    }
    if (
      item.status === 'draft' ||
      item.status === 'published' ||
      item.status === 'archived'
    ) {
      byStatus[item.status] += 1;
    }
    if (item.status === 'published') published += 1;
    if (eventHasRegistration(item)) withRegistration += 1;
  }

  return {
    total: list.length,
    published,
    withRegistration,
    byCalendar,
    byStatus,
  };
}

export function buildEventYears(list: Event[]): number[] {
  const years = new Set<number>();
  for (const item of list) {
    const year = eventStartYear(item);
    if (year) years.add(year);
  }
  return [...years].sort((a, b) => b - a);
}

export function supportsEventListQuery(
  collection: ContentCollectionKey,
): boolean {
  return collection === 'events';
}

const NOTICE_TYPES: NoticeType[] = [
  'vacancy',
  'announcement',
  'deadline',
  'general',
];

export function noticeHasApplication(item: Notice): boolean {
  return Boolean(item.applicationFormId?.trim());
}

function noticeStampYear(value: string | null | undefined): number | null {
  const raw = value?.trim() ?? '';
  const year = Number(raw.slice(0, 4));
  return Number.isFinite(year) && year > 1900 && year < 3000 ? year : null;
}

export function noticeMatchesQuery(item: Notice, q: string | undefined): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const blob = [item.title, item.summary, item.body, item.language]
    .join(' ')
    .toLowerCase();
  return blob.includes(needle);
}

export function sortNotices(
  list: Notice[],
  sort: ResearchListSort = 'updated_desc',
): Notice[] {
  const byDeadline = (a: Notice, b: Notice, direction: 'asc' | 'desc') => {
    const as = a.deadlineAt?.trim() || '';
    const bs = b.deadlineAt?.trim() || '';
    if (!as && !bs) return 0;
    if (!as) return 1;
    if (!bs) return -1;
    const cmp = as.localeCompare(bs);
    return direction === 'asc' ? cmp : -cmp;
  };
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'updated_asc':
        return String(a.updatedAt ?? '').localeCompare(String(b.updatedAt ?? ''));
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'deadline_asc':
        return byDeadline(a, b, 'asc');
      case 'deadline_desc':
        return byDeadline(a, b, 'desc');
      case 'updated_desc':
      default:
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
    }
  });
}

export function filterNotices(
  list: Notice[],
  query: CollectionListQuery,
): Notice[] {
  return list.filter((item) => {
    if (query.noticeType && item.noticeType !== query.noticeType) return false;
    if (query.status && item.status !== query.status) return false;
    const year = noticeStampYear(item.deadlineAt) ?? noticeStampYear(item.updatedAt);
    if (query.yearFrom != null && (year ?? 0) < query.yearFrom) return false;
    if (query.yearTo != null && (year ?? 9999) > query.yearTo) return false;
    if (query.hasApplication === true && !noticeHasApplication(item)) return false;
    if (query.hasApplication === false && noticeHasApplication(item)) return false;
    return noticeMatchesQuery(item, query.q);
  });
}

export function buildNoticeFacets(list: Notice[]): NoticeListFacets {
  const byType = {
    vacancy: 0,
    announcement: 0,
    deadline: 0,
    general: 0,
  } satisfies Record<NoticeType, number>;
  const byStatus = { draft: 0, published: 0, archived: 0 };
  let withApplication = 0;
  let published = 0;

  for (const item of list) {
    if (NOTICE_TYPES.includes(item.noticeType)) {
      byType[item.noticeType] += 1;
    }
    if (
      item.status === 'draft' ||
      item.status === 'published' ||
      item.status === 'archived'
    ) {
      byStatus[item.status] += 1;
    }
    if (item.status === 'published') published += 1;
    if (noticeHasApplication(item)) withApplication += 1;
  }

  return {
    total: list.length,
    published,
    withApplication,
    byType,
    byStatus,
  };
}

export function buildNoticeYears(list: Notice[]): number[] {
  const years = new Set<number>();
  for (const item of list) {
    const year = noticeStampYear(item.deadlineAt) ?? noticeStampYear(item.updatedAt);
    if (year) years.add(year);
  }
  return [...years].sort((a, b) => b - a);
}

export function supportsNoticeListQuery(
  collection: ContentCollectionKey,
): boolean {
  return collection === 'notices';
}

const ACTIVITY_TYPES: ActivityType[] = [
  'capacity-building',
  'research-talk',
  'awareness-campaign',
  'innovation-showcasing',
];

export function activityMatchesQuery(
  item: Activity,
  q: string | undefined,
): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [item.title, item.summary, item.description]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export function sortActivities(
  list: Activity[],
  sort: ResearchListSort = 'order_asc',
): Activity[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'updated_asc':
        return String(a.updatedAt ?? '').localeCompare(String(b.updatedAt ?? ''));
      case 'updated_desc':
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'order_asc':
      default: {
        const order = (a.order ?? 999) - (b.order ?? 999);
        if (order !== 0) return order;
        return a.title.localeCompare(b.title);
      }
    }
  });
}

export function filterActivities(
  list: Activity[],
  query: CollectionListQuery,
): Activity[] {
  return list.filter((item) => {
    if (query.activityType && item.type !== query.activityType) return false;
    if (query.status && item.status !== query.status) return false;
    return activityMatchesQuery(item, query.q);
  });
}

export function buildActivityFacets(list: Activity[]): ActivityListFacets {
  const byType = {
    'capacity-building': 0,
    'research-talk': 0,
    'awareness-campaign': 0,
    'innovation-showcasing': 0,
  } satisfies Record<ActivityType, number>;
  const byStatus = { draft: 0, published: 0, archived: 0 };
  let published = 0;

  for (const item of list) {
    if (ACTIVITY_TYPES.includes(item.type)) byType[item.type] += 1;
    if (
      item.status === 'draft' ||
      item.status === 'published' ||
      item.status === 'archived'
    ) {
      byStatus[item.status] += 1;
    }
    if (item.status === 'published') published += 1;
  }

  return { total: list.length, published, byType, byStatus };
}

export function supportsActivityListQuery(
  collection: ContentCollectionKey,
): boolean {
  return collection === 'activities';
}

const RESOURCE_TYPES: ResourceType[] = [
  'tutorial',
  'video-series',
  'archive',
  'tool-guide',
  'document',
  'other',
];

export function resourceMatchesQuery(
  item: Resource,
  q: string | undefined,
): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [item.title, item.summary, item.description, ...(item.topics ?? []), ...(item.software ?? [])]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export function sortResources(
  list: Resource[],
  sort: ResearchListSort = 'title_asc',
): Resource[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'updated_asc':
        return String(a.updatedAt ?? '').localeCompare(String(b.updatedAt ?? ''));
      case 'updated_desc':
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
      case 'title_asc':
      default:
        return a.title.localeCompare(b.title);
    }
  });
}

export function filterResources(
  list: Resource[],
  query: CollectionListQuery,
): Resource[] {
  return list.filter((item) => {
    if (query.resourceType && item.resourceType !== query.resourceType) return false;
    if (query.status && item.status !== query.status) return false;
    if (
      query.software &&
      !(item.software ?? []).some(
        (name) => name.toLowerCase() === query.software!.toLowerCase(),
      )
    ) {
      return false;
    }
    return resourceMatchesQuery(item, query.q);
  });
}

export function buildResourceFacets(list: Resource[]): ResourceListFacets {
  const byType = {
    tutorial: 0,
    'video-series': 0,
    archive: 0,
    'tool-guide': 0,
    document: 0,
    other: 0,
  } satisfies Record<ResourceType, number>;
  const bySoftware: Record<string, number> = {};
  const byStatus = { draft: 0, published: 0, archived: 0 };
  let published = 0;

  for (const item of list) {
    if (RESOURCE_TYPES.includes(item.resourceType)) byType[item.resourceType] += 1;
    for (const name of item.software ?? []) {
      const label = name.trim();
      if (!label) continue;
      bySoftware[label] = (bySoftware[label] ?? 0) + 1;
    }
    if (
      item.status === 'draft' ||
      item.status === 'published' ||
      item.status === 'archived'
    ) {
      byStatus[item.status] += 1;
    }
    if (item.status === 'published') published += 1;
  }

  return { total: list.length, published, byType, bySoftware, byStatus };
}

export function supportsResourceListQuery(
  collection: ContentCollectionKey,
): boolean {
  return collection === 'resources';
}

function newsStamp(item: NewsArticle): string {
  return item.publishedAt?.trim() || item.createdAt || '';
}

function newsStampYear(value: string | null | undefined): number | null {
  const raw = value?.trim() ?? '';
  const year = Number(raw.slice(0, 4));
  return Number.isFinite(year) && year > 1900 && year < 3000 ? year : null;
}

export function newsMatchesQuery(item: NewsArticle, q: string | undefined): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [item.title, item.excerpt, item.body, item.author, ...(item.categoryLabels ?? [])]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export function sortNews(
  list: NewsArticle[],
  sort: ResearchListSort = 'published_desc',
): NewsArticle[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'updated_asc':
        return String(a.updatedAt ?? '').localeCompare(String(b.updatedAt ?? ''));
      case 'updated_desc':
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'published_asc':
        return newsStamp(a).localeCompare(newsStamp(b));
      case 'published_desc':
      default:
        return newsStamp(b).localeCompare(newsStamp(a));
    }
  });
}

export function filterNews(
  list: NewsArticle[],
  query: CollectionListQuery,
): NewsArticle[] {
  return list.filter((item) => {
    if (query.newsLanguage && (item.language ?? '') !== query.newsLanguage) return false;
    if (
      query.newsCategory &&
      !(item.categoryLabels ?? []).some((label) => label === query.newsCategory)
    ) {
      return false;
    }
    if (query.status && item.status !== query.status) return false;
    const year = newsStampYear(newsStamp(item));
    if (query.yearFrom != null && (year ?? 0) < query.yearFrom) return false;
    if (query.yearTo != null && (year ?? 9999) > query.yearTo) return false;
    return newsMatchesQuery(item, query.q);
  });
}

export function buildNewsFacets(list: NewsArticle[]): NewsListFacets {
  const byLanguage: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byStatus = { draft: 0, published: 0, archived: 0 };
  let published = 0;

  for (const item of list) {
    const language = item.language?.trim();
    if (language) byLanguage[language] = (byLanguage[language] ?? 0) + 1;
    for (const label of item.categoryLabels ?? []) {
      const name = label.trim();
      if (!name) continue;
      byCategory[name] = (byCategory[name] ?? 0) + 1;
    }
    if (
      item.status === 'draft' ||
      item.status === 'published' ||
      item.status === 'archived'
    ) {
      byStatus[item.status] += 1;
    }
    if (item.status === 'published') published += 1;
  }

  return { total: list.length, published, byLanguage, byCategory, byStatus };
}

export function buildNewsYears(list: NewsArticle[]): number[] {
  const years = new Set<number>();
  for (const item of list) {
    const year = newsStampYear(newsStamp(item));
    if (year) years.add(year);
  }
  return [...years].sort((a, b) => b - a);
}

export function supportsNewsListQuery(collection: ContentCollectionKey): boolean {
  return collection === 'news';
}

export function clippingMatchesQuery(
  item: MediaClipping,
  q: string | undefined,
): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [item.title, item.citation, item.abstract, item.venue, ...(item.authors ?? [])]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export function sortMediaClippings(
  list: MediaClipping[],
  sort: ResearchListSort = 'year_desc',
): MediaClipping[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'updated_asc':
        return String(a.updatedAt ?? '').localeCompare(String(b.updatedAt ?? ''));
      case 'updated_desc':
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'year_asc':
        return (a.year ?? 0) - (b.year ?? 0) || a.title.localeCompare(b.title);
      case 'year_desc':
      default:
        return (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title);
    }
  });
}

export function filterMediaClippings(
  list: MediaClipping[],
  query: CollectionListQuery,
): MediaClipping[] {
  return list.filter((item) => {
    if (query.clippingLanguage && (item.language ?? '') !== query.clippingLanguage) {
      return false;
    }
    if (query.outlet && (item.venue ?? '').trim() !== query.outlet) return false;
    if (query.status && item.status !== query.status) return false;
    if (query.yearFrom != null && (item.year ?? 0) < query.yearFrom) return false;
    if (query.yearTo != null && (item.year ?? 9999) > query.yearTo) return false;
    return clippingMatchesQuery(item, query.q);
  });
}

export function buildMediaClippingFacets(list: MediaClipping[]): MediaClippingListFacets {
  const byLanguage: Record<string, number> = {};
  const byOutlet: Record<string, number> = {};
  const byStatus = { draft: 0, published: 0, archived: 0 };
  let published = 0;

  for (const item of list) {
    const language = item.language?.trim();
    if (language) byLanguage[language] = (byLanguage[language] ?? 0) + 1;
    const outlet = item.venue?.trim();
    if (outlet) byOutlet[outlet] = (byOutlet[outlet] ?? 0) + 1;
    if (
      item.status === 'draft' ||
      item.status === 'published' ||
      item.status === 'archived'
    ) {
      byStatus[item.status] += 1;
    }
    if (item.status === 'published') published += 1;
  }

  return { total: list.length, published, byLanguage, byOutlet, byStatus };
}

export function buildMediaClippingYears(list: MediaClipping[]): number[] {
  const years = new Set<number>();
  for (const item of list) {
    if (item.year > 1900 && item.year < 3000) years.add(item.year);
  }
  return [...years].sort((a, b) => b - a);
}

export function supportsMediaClippingListQuery(
  collection: ContentCollectionKey,
): boolean {
  return collection === 'mediaClippings';
}

export function researchAreaMatchesQuery(
  item: ResearchArea,
  q: string | undefined,
): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [item.title, item.shortDescription, item.description]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export function sortResearchAreas(
  list: ResearchArea[],
  sort: ResearchListSort = 'order_asc',
): ResearchArea[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'updated_asc':
        return String(a.updatedAt ?? '').localeCompare(String(b.updatedAt ?? ''));
      case 'updated_desc':
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'order_asc':
      default: {
        const order = (a.order ?? 999) - (b.order ?? 999);
        if (order !== 0) return order;
        return a.title.localeCompare(b.title);
      }
    }
  });
}

export function filterResearchAreas(
  list: ResearchArea[],
  query: CollectionListQuery,
): ResearchArea[] {
  return list.filter((item) => {
    if (query.status && item.status !== query.status) return false;
    return researchAreaMatchesQuery(item, query.q);
  });
}

export function buildResearchAreaFacets(list: ResearchArea[]): ResearchAreaListFacets {
  const byStatus = { draft: 0, published: 0, archived: 0 };
  let published = 0;
  for (const item of list) {
    if (
      item.status === 'draft' ||
      item.status === 'published' ||
      item.status === 'archived'
    ) {
      byStatus[item.status] += 1;
    }
    if (item.status === 'published') published += 1;
  }
  return { total: list.length, published, byStatus };
}

export function supportsResearchAreaListQuery(
  collection: ContentCollectionKey,
): boolean {
  return collection === 'researchAreas';
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
    case 'start_desc':
      return [{ $sort: { startAt: -1 as const, updatedAt: -1 as const } }];
    case 'start_asc':
      return [{ $sort: { startAt: 1 as const, updatedAt: -1 as const } }];
    case 'deadline_desc':
      return [{ $sort: { deadlineAt: -1 as const, updatedAt: -1 as const } }];
    case 'deadline_asc':
      return [{ $sort: { deadlineAt: 1 as const, updatedAt: -1 as const } }];
    case 'order_asc':
      return [{ $sort: { order: 1 as const, title: 1 as const } }];
    case 'published_desc':
      return [{ $sort: { publishedAt: -1 as const, createdAt: -1 as const } }];
    case 'published_asc':
      return [{ $sort: { publishedAt: 1 as const, createdAt: 1 as const } }];
    case 'category':
    default:
      return [
        researchRankField,
        { $sort: { _rank: 1 as const, year: -1 as const, updatedAt: -1 as const } },
      ];
  }
}

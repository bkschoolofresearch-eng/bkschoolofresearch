import 'server-only';
import { randomUUID } from 'crypto';
import { revalidateTag } from 'next/cache';
import {
  CMS_CACHE_TAGS,
  LIST_COLLECTION_KEYS,
  MONGO_COLLECTIONS,
  mongoNameForList,
} from '@/lib/db/collections';
import { getDb } from '@/lib/db/mongo';
import { ensureIndexes } from '@/lib/db/indexes';
import { seedDatabase } from '@/content/seed';
import type {
  CollectionEntityMap,
  ContentCollectionKey,
  ContentDatabase,
  HomepageConfig,
  NavigationItem,
  SiteSettings,
} from '@/types/content';

const SINGLETON_ID = 'default';

function nowIso(): string {
  return new Date().toISOString();
}

function stripMongoId<T extends Record<string, unknown>>(doc: T): Omit<T, '_id'> {
  const { _id: _ignored, ...rest } = doc;
  return rest;
}

async function readSingleton<T>(
  collection: string,
  fallback: T,
): Promise<T> {
  const db = await getDb();
  const doc = await db.collection(collection).findOne({ _id: SINGLETON_ID } as never);
  if (!doc) return structuredClone(fallback);
  return stripMongoId(doc as Record<string, unknown>) as T;
}

async function writeSingleton(
  collection: string,
  data: Record<string, unknown>,
  tag: string,
): Promise<void> {
  const db = await getDb();
  const { id: _idField, ...rest } = data;
  await db.collection(collection).updateOne(
    { _id: SINGLETON_ID } as never,
    { $set: { ...rest, id: data.id ?? SINGLETON_ID } },
    { upsert: true },
  );
  revalidateTag(tag, 'max');
  revalidateTag(CMS_CACHE_TAGS.all, { expire: 0 });
}

export async function mongoGetFullDatabase(): Promise<ContentDatabase> {
  const db = await getDb();

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const [siteSettings, homepage, navigation, ...lists] = await Promise.all([
        readSingleton(MONGO_COLLECTIONS.siteSettings, seedDatabase.siteSettings),
        readSingleton(MONGO_COLLECTIONS.homepage, seedDatabase.homepage),
        readSingleton(MONGO_COLLECTIONS.navigation, seedDatabase.navigation),
        ...LIST_COLLECTION_KEYS.map(async (key) => {
          const rows = await db
            .collection(mongoNameForList(key))
            .find({})
            .project({ _id: 0 })
            .toArray();
          return [key, rows] as const;
        }),
      ]);

      const database = {
        version: seedDatabase.version,
        siteSettings,
        homepage,
        navigation,
      } as ContentDatabase;

      for (const [key, rows] of lists) {
        (database as unknown as Record<string, unknown>)[key] = rows;
      }

      const meta = await db.collection(MONGO_COLLECTIONS.meta).findOne(
        { _id: 'version' } as never,
        { projection: { version: 1 } },
      );
      if (meta && typeof (meta as unknown as { version?: number }).version === 'number') {
        database.version = (meta as unknown as { version: number }).version;
      }

      return database;
    } catch (error) {
      lastError = error;
      console.error(`[CMS] mongoGetFullDatabase attempt ${attempt + 1} failed:`, error instanceof Error ? error.message : error);
      if (attempt === 0) {
        global.__bksrMongoClientPromise = undefined;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  throw lastError;
}

export async function mongoGetAll<K extends ContentCollectionKey>(
  collection: K,
): Promise<CollectionEntityMap[K][]> {
  const db = await getDb();
  const rows = await db.collection(mongoNameForList(collection)).find({}).toArray();
  return rows.map((row) =>
    stripMongoId(row as Record<string, unknown>),
  ) as unknown as CollectionEntityMap[K][];
}

export async function mongoListResearchProjects(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<import('@/lib/cms/paginated-list').CollectionListResult<
  import('@/types/content').ResearchProject
>> {
  const {
    mongoSortStages,
    researchHasLink,
    sortResearchProjects,
    paginateInMemory,
    buildResearchFacets,
    buildResearchYears,
  } = await import('@/lib/cms/paginated-list');
  const db = await getDb();
  const col = db.collection(mongoNameForList('researchProjects'));

  const match: Record<string, unknown> = {};
  if (query.researchStatus) match.researchStatus = query.researchStatus;
  if (query.status) match.status = query.status;
  if (query.yearFrom != null || query.yearTo != null) {
    match.year = {
      ...(query.yearFrom != null ? { $gte: query.yearFrom } : {}),
      ...(query.yearTo != null ? { $lte: query.yearTo } : {}),
    };
  }
  if (query.areaId) match.areaIds = query.areaId;
  if (query.featured === true) match.featuredOnResearchPage = true;
  if (query.featured === false) {
    match.$and = [
      ...(Array.isArray(match.$and) ? (match.$and as unknown[]) : []),
      {
        $or: [
          { featuredOnResearchPage: { $exists: false } },
          { featuredOnResearchPage: false },
        ],
      },
    ];
  }
  // hasLink resolved in JS with publication URLs (same rule as Open column)
  if (query.q) {
    const re = {
      $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
    match.$or = [
      { title: re },
      { summary: re },
      { venue: re },
      { description: re },
      { url: re },
      { leadAuthorNames: re },
    ];
  }

  const needsLinkResolve =
    query.hasLink === true || query.hasLink === false || Boolean(query.facets);

  type PubLinkFields = {
    url?: string | null;
    doi?: string | null;
    citation?: string | null;
  };

  const publicationsById: Map<string, PubLinkFields> | undefined = needsLinkResolve
    ? new Map(
        (
          await db
            .collection(mongoNameForList('publications'))
            .find({})
            .project({ _id: 0, id: 1, url: 1, doi: 1, citation: 1 })
            .toArray()
        ).map((pub) => {
          const row = pub as { id: string } & PubLinkFields;
          return [row.id, { url: row.url, doi: row.doi, citation: row.citation }] as [
            string,
            PubLinkFields,
          ];
        }),
      )
    : undefined;

  let items: import('@/types/content').ResearchProject[];
  let total: number;
  let page: number;

  if (query.hasLink === true || query.hasLink === false) {
    const matched = (await col
      .find(match)
      .project({ _id: 0 })
      .toArray()) as unknown as import('@/types/content').ResearchProject[];
    const linkFiltered = matched.filter((item) => {
      const has = researchHasLink(
        item,
        publicationsById as Parameters<typeof researchHasLink>[1],
      );
      return query.hasLink === true ? has : !has;
    });
    const sorted = sortResearchProjects(linkFiltered, query.sort);
    const paged = paginateInMemory(sorted, query.page, query.pageSize);
    items = paged.items;
    total = paged.total;
    page = paged.page;
  } else {
    total = await col.countDocuments(match);
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize) || 1);
    page = Math.min(query.page, totalPages);
    const skip = (page - 1) * query.pageSize;
    items = (await col
      .aggregate([
        { $match: match },
        ...mongoSortStages(query.sort),
        { $skip: skip },
        { $limit: query.pageSize },
        { $project: { _id: 0, _rank: 0 } },
      ])
      .toArray()) as unknown as import('@/types/content').ResearchProject[];
  }

  let facets: import('@/lib/cms/paginated-list').ResearchListFacets | undefined;
  let options: import('@/lib/cms/paginated-list').ResearchListOptions | undefined;
  if (query.facets) {
    const allProjects = (await col
      .find({})
      .project({ _id: 0 })
      .toArray()) as unknown as import('@/types/content').ResearchProject[];
    facets = buildResearchFacets(
      allProjects,
      publicationsById as Parameters<typeof buildResearchFacets>[1],
    );

    const areas = await db
      .collection(mongoNameForList('researchAreas'))
      .find({})
      .project({ _id: 0, id: 1, title: 1 })
      .sort({ title: 1 })
      .toArray();

    options = {
      years: buildResearchYears(allProjects),
      areas: areas as Array<{ id: string; title: string }>,
    };
  }

  const related = await loadResearchListRelated(items);

  return {
    items,
    total,
    page,
    pageSize: query.pageSize,
    facets,
    options,
    related,
  };
}

export async function mongoListPublications(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Publication
  >
> {
  const {
    mongoSortStages,
    publicationHasLink,
    sortPublications,
    paginateInMemory,
    buildPublicationFacets,
    buildPublicationYears,
  } = await import('@/lib/cms/paginated-list');
  const db = await getDb();
  const col = db.collection(mongoNameForList('publications'));

  const match: Record<string, unknown> = {};
  if (query.publicationType) match.type = query.publicationType;
  if (query.status) match.status = query.status;
  if (query.yearFrom != null || query.yearTo != null) {
    match.year = {
      ...(query.yearFrom != null ? { $gte: query.yearFrom } : {}),
      ...(query.yearTo != null ? { $lte: query.yearTo } : {}),
    };
  }
  if (query.areaId) match.areaIds = query.areaId;
  if (query.q) {
    const re = {
      $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
    match.$or = [
      { title: re },
      { citation: re },
      { abstract: re },
      { venue: re },
      { doi: re },
      { url: re },
      { publisher: re },
      { authors: re },
    ];
  }

  let items: import('@/types/content').Publication[];
  let total: number;
  let page: number;

  if (query.hasLink === true || query.hasLink === false) {
    const matched = (await col
      .find(match)
      .project({ _id: 0 })
      .toArray()) as unknown as import('@/types/content').Publication[];
    const linkFiltered = matched.filter((item) => {
      const has = publicationHasLink(item);
      return query.hasLink === true ? has : !has;
    });
    const sorted = sortPublications(linkFiltered, query.sort ?? 'type');
    const paged = paginateInMemory(sorted, query.page, query.pageSize);
    items = paged.items;
    total = paged.total;
    page = paged.page;
  } else {
    total = await col.countDocuments(match);
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize) || 1);
    page = Math.min(query.page, totalPages);
    const skip = (page - 1) * query.pageSize;
    const sortKey = query.sort === 'category' ? 'type' : (query.sort ?? 'type');
    items = (await col
      .aggregate([
        { $match: match },
        ...mongoSortStages(sortKey),
        { $skip: skip },
        { $limit: query.pageSize },
        { $project: { _id: 0, _rank: 0 } },
      ])
      .toArray()) as unknown as import('@/types/content').Publication[];
  }

  let facets:
    | import('@/lib/cms/paginated-list').PublicationListFacets
    | undefined;
  let options: import('@/lib/cms/paginated-list').ResearchListOptions | undefined;
  if (query.facets) {
    const all = (await col
      .find({})
      .project({ _id: 0 })
      .toArray()) as unknown as import('@/types/content').Publication[];
    facets = buildPublicationFacets(all);

    const areas = await db
      .collection(mongoNameForList('researchAreas'))
      .find({})
      .project({ _id: 0, id: 1, title: 1 })
      .sort({ title: 1 })
      .toArray();

    options = {
      years: buildPublicationYears(all),
      areas: areas as Array<{ id: string; title: string }>,
    };
  }

  const areaIds = [...new Set(items.flatMap((item) => item.areaIds ?? []))];
  const researchAreas = areaIds.length
    ? ((await db
        .collection(mongoNameForList('researchAreas'))
        .find({ id: { $in: areaIds } })
        .project({ _id: 0, id: 1, title: 1 })
        .toArray()) as Array<{ id: string; title: string }>)
    : [];

  return {
    items,
    total,
    page,
    pageSize: query.pageSize,
    facets,
    options,
    related: { researchAreas },
  };
}

export async function mongoListEvents(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Event
  >
> {
  const {
    mongoSortStages,
    eventHasRegistration,
    sortEvents,
    paginateInMemory,
    buildEventFacets,
    buildEventYears,
  } = await import('@/lib/cms/paginated-list');
  const db = await getDb();
  const col = db.collection(mongoNameForList('events'));

  const match: Record<string, unknown> = {};
  if (query.eventStatus) match.eventStatus = query.eventStatus;
  if (query.status) match.status = query.status;
  if (query.online === true) match.isOnline = true;
  if (query.online === false) match.isOnline = { $ne: true };
  if (query.yearFrom != null || query.yearTo != null) {
    match.startAt = {
      ...(query.yearFrom != null ? { $gte: `${query.yearFrom}-01-01` } : {}),
      ...(query.yearTo != null
        ? { $lte: `${query.yearTo}-12-31T23:59:59.999Z` }
        : {}),
    };
  }
  if (query.q) {
    const re = {
      $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
    match.$or = [
      { title: re },
      { summary: re },
      { description: re },
      { location: re },
      { speakers: re },
    ];
  }

  const sortKey =
    !query.sort || query.sort === 'category' || query.sort === 'type'
      ? 'start_desc'
      : query.sort;

  let items: import('@/types/content').Event[];
  let total: number;
  let page: number;

  if (query.hasRegistration === true || query.hasRegistration === false) {
    const matched = (await col
      .find(match)
      .project({ _id: 0 })
      .toArray()) as unknown as import('@/types/content').Event[];
    const filtered = matched.filter((item) => {
      const has = eventHasRegistration(item);
      return query.hasRegistration === true ? has : !has;
    });
    const sorted = sortEvents(filtered, sortKey);
    const paged = paginateInMemory(sorted, query.page, query.pageSize);
    items = paged.items;
    total = paged.total;
    page = paged.page;
  } else {
    total = await col.countDocuments(match);
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize) || 1);
    page = Math.min(query.page, totalPages);
    const skip = (page - 1) * query.pageSize;
    items = (await col
      .aggregate([
        { $match: match },
        ...mongoSortStages(sortKey),
        { $skip: skip },
        { $limit: query.pageSize },
        { $project: { _id: 0, _rank: 0 } },
      ])
      .toArray()) as unknown as import('@/types/content').Event[];
  }

  let facets: import('@/lib/cms/paginated-list').EventListFacets | undefined;
  let options: import('@/lib/cms/paginated-list').ResearchListOptions | undefined;
  if (query.facets) {
    const all = (await col
      .find({})
      .project({ _id: 0 })
      .toArray()) as unknown as import('@/types/content').Event[];
    facets = buildEventFacets(all);
    options = { years: buildEventYears(all), areas: [] };
  }

  return {
    items,
    total,
    page,
    pageSize: query.pageSize,
    facets,
    options,
  };
}

export async function mongoListNotices(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Notice
  >
> {
  const {
    mongoSortStages,
    sortNotices,
    filterNotices,
    paginateInMemory,
    buildNoticeFacets,
    buildNoticeYears,
  } = await import('@/lib/cms/paginated-list');
  const db = await getDb();
  const col = db.collection(mongoNameForList('notices'));

  const match: Record<string, unknown> = {};
  if (query.noticeType) match.noticeType = query.noticeType;
  if (query.status) match.status = query.status;
  if (query.q) {
    const re = {
      $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
    match.$or = [
      { title: re },
      { summary: re },
      { body: re },
      { language: re },
    ];
  }

  const sortKey =
    !query.sort || query.sort === 'category' || query.sort === 'type'
      ? 'updated_desc'
      : query.sort;

  const needsMemory =
    query.hasApplication === true ||
    query.hasApplication === false ||
    query.yearFrom != null ||
    query.yearTo != null ||
    sortKey === 'deadline_desc' ||
    sortKey === 'deadline_asc';

  let items: import('@/types/content').Notice[];
  let total: number;
  let page: number;

  if (needsMemory) {
    const matched = (await col
      .find(match)
      .project({ _id: 0 })
      .toArray()) as unknown as import('@/types/content').Notice[];
    const filtered = filterNotices(matched, {
      ...query,
      q: undefined,
      noticeType: undefined,
      status: undefined,
    });
    const sorted = sortNotices(filtered, sortKey);
    const paged = paginateInMemory(sorted, query.page, query.pageSize);
    items = paged.items;
    total = paged.total;
    page = paged.page;
  } else {
    total = await col.countDocuments(match);
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize) || 1);
    page = Math.min(query.page, totalPages);
    const skip = (page - 1) * query.pageSize;
    items = (await col
      .aggregate([
        { $match: match },
        ...mongoSortStages(sortKey),
        { $skip: skip },
        { $limit: query.pageSize },
        { $project: { _id: 0, _rank: 0 } },
      ])
      .toArray()) as unknown as import('@/types/content').Notice[];
  }

  let facets: import('@/lib/cms/paginated-list').NoticeListFacets | undefined;
  let options: import('@/lib/cms/paginated-list').ResearchListOptions | undefined;
  if (query.facets) {
    const all = (await col
      .find({})
      .project({ _id: 0 })
      .toArray()) as unknown as import('@/types/content').Notice[];
    facets = buildNoticeFacets(all);
    options = { years: buildNoticeYears(all), areas: [] };
  }

  return {
    items,
    total,
    page,
    pageSize: query.pageSize,
    facets,
    options,
  };
}

export async function mongoListActivities(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Activity
  >
> {
  const { mongoSortStages, buildActivityFacets } = await import(
    '@/lib/cms/paginated-list'
  );
  const db = await getDb();
  const col = db.collection(mongoNameForList('activities'));

  const match: Record<string, unknown> = {};
  if (query.activityType) match.type = query.activityType;
  if (query.status) match.status = query.status;
  if (query.q) {
    const re = {
      $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
    match.$or = [{ title: re }, { summary: re }, { description: re }];
  }

  const sortKey =
    !query.sort ||
    query.sort === 'category' ||
    query.sort === 'type' ||
    query.sort === 'start_desc' ||
    query.sort === 'start_asc' ||
    query.sort === 'deadline_desc' ||
    query.sort === 'deadline_asc'
      ? 'order_asc'
      : query.sort;

  const total = await col.countDocuments(match);
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize) || 1);
  const page = Math.min(query.page, totalPages);
  const skip = (page - 1) * query.pageSize;
  const items = (await col
    .aggregate([
      { $match: match },
      ...mongoSortStages(sortKey),
      { $skip: skip },
      { $limit: query.pageSize },
      { $project: { _id: 0, _rank: 0 } },
    ])
    .toArray()) as unknown as import('@/types/content').Activity[];

  const facets = query.facets
    ? buildActivityFacets(
        (await col.find({}).project({ _id: 0 }).toArray()) as unknown as import(
          '@/types/content'
        ).Activity[],
      )
    : undefined;

  return {
    items,
    total,
    page,
    pageSize: query.pageSize,
    facets,
  };
}

export async function mongoListResources(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Resource
  >
> {
  const { mongoSortStages, buildResourceFacets } = await import(
    '@/lib/cms/paginated-list'
  );
  const db = await getDb();
  const col = db.collection(mongoNameForList('resources'));

  const match: Record<string, unknown> = {};
  if (query.resourceType) match.resourceType = query.resourceType;
  if (query.status) match.status = query.status;
  if (query.software) match.software = query.software;
  if (query.q) {
    const re = {
      $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
    match.$or = [
      { title: re },
      { summary: re },
      { description: re },
      { topics: re },
      { software: re },
    ];
  }

  const sortKey =
    !query.sort ||
    query.sort === 'category' ||
    query.sort === 'type' ||
    query.sort === 'start_desc' ||
    query.sort === 'start_asc' ||
    query.sort === 'deadline_desc' ||
    query.sort === 'deadline_asc' ||
    query.sort === 'order_asc'
      ? 'title_asc'
      : query.sort;

  const total = await col.countDocuments(match);
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize) || 1);
  const page = Math.min(query.page, totalPages);
  const skip = (page - 1) * query.pageSize;
  const items = (await col
    .aggregate([
      { $match: match },
      ...mongoSortStages(sortKey),
      { $skip: skip },
      { $limit: query.pageSize },
      { $project: { _id: 0, _rank: 0 } },
    ])
    .toArray()) as unknown as import('@/types/content').Resource[];

  const facets = query.facets
    ? buildResourceFacets(
        (await col.find({}).project({ _id: 0 }).toArray()) as unknown as import(
          '@/types/content'
        ).Resource[],
      )
    : undefined;

  return {
    items,
    total,
    page,
    pageSize: query.pageSize,
    facets,
  };
}

function newsListSort(
  sort: import('@/lib/cms/paginated-list').CollectionListQuery['sort'],
): import('@/lib/cms/paginated-list').ResearchListSort {
  if (
    !sort ||
    sort === 'category' ||
    sort === 'type' ||
    sort === 'start_desc' ||
    sort === 'start_asc' ||
    sort === 'deadline_desc' ||
    sort === 'deadline_asc' ||
    sort === 'order_asc'
  ) {
    return 'published_desc';
  }
  return sort;
}

export async function mongoListNews(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').NewsArticle
  >
> {
  const {
    mongoSortStages,
    sortNews,
    filterNews,
    paginateInMemory,
    buildNewsFacets,
    buildNewsYears,
  } = await import('@/lib/cms/paginated-list');
  const db = await getDb();
  const col = db.collection(mongoNameForList('news'));

  const match: Record<string, unknown> = {};
  if (query.newsLanguage) match.language = query.newsLanguage;
  if (query.newsCategory) match.categoryLabels = query.newsCategory;
  if (query.status) match.status = query.status;
  if (query.q) {
    const re = {
      $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
    match.$or = [
      { title: re },
      { excerpt: re },
      { body: re },
      { author: re },
      { categoryLabels: re },
    ];
  }

  const sortKey = newsListSort(query.sort);
  const needsMemory = query.yearFrom != null || query.yearTo != null;

  let items: import('@/types/content').NewsArticle[];
  let total: number;
  let page: number;

  if (needsMemory) {
    const matched = (await col
      .find(match)
      .project({ _id: 0 })
      .toArray()) as unknown as import('@/types/content').NewsArticle[];
    const filtered = filterNews(matched, {
      ...query,
      q: undefined,
      newsLanguage: undefined,
      newsCategory: undefined,
      status: undefined,
    });
    const sorted = sortNews(filtered, sortKey);
    const paged = paginateInMemory(sorted, query.page, query.pageSize);
    items = paged.items;
    total = paged.total;
    page = paged.page;
  } else {
    total = await col.countDocuments(match);
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize) || 1);
    page = Math.min(query.page, totalPages);
    const skip = (page - 1) * query.pageSize;
    items = (await col
      .aggregate([
        { $match: match },
        ...mongoSortStages(sortKey),
        { $skip: skip },
        { $limit: query.pageSize },
        { $project: { _id: 0, _rank: 0 } },
      ])
      .toArray()) as unknown as import('@/types/content').NewsArticle[];
  }

  let facets: import('@/lib/cms/paginated-list').NewsListFacets | undefined;
  let options: import('@/lib/cms/paginated-list').ResearchListOptions | undefined;
  if (query.facets) {
    const all = (await col
      .find({})
      .project({ _id: 0 })
      .toArray()) as unknown as import('@/types/content').NewsArticle[];
    facets = buildNewsFacets(all);
    options = { years: buildNewsYears(all), areas: [] };
  }

  return {
    items,
    total,
    page,
    pageSize: query.pageSize,
    facets,
    options,
  };
}

function clippingListSort(
  sort: import('@/lib/cms/paginated-list').CollectionListQuery['sort'],
): import('@/lib/cms/paginated-list').ResearchListSort {
  if (
    !sort ||
    sort === 'category' ||
    sort === 'type' ||
    sort === 'start_desc' ||
    sort === 'start_asc' ||
    sort === 'deadline_desc' ||
    sort === 'deadline_asc' ||
    sort === 'order_asc' ||
    sort === 'published_desc' ||
    sort === 'published_asc'
  ) {
    return 'year_desc';
  }
  return sort;
}

export async function mongoListMediaClippings(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').MediaClipping
  >
> {
  const { mongoSortStages, buildMediaClippingFacets, buildMediaClippingYears } =
    await import('@/lib/cms/paginated-list');
  const db = await getDb();
  const col = db.collection(mongoNameForList('mediaClippings'));

  const match: Record<string, unknown> = {};
  if (query.clippingLanguage) match.language = query.clippingLanguage;
  if (query.outlet) match.venue = query.outlet;
  if (query.status) match.status = query.status;
  if (query.yearFrom != null || query.yearTo != null) {
    const year: Record<string, number> = {};
    if (query.yearFrom != null) year.$gte = query.yearFrom;
    if (query.yearTo != null) year.$lte = query.yearTo;
    match.year = year;
  }
  if (query.q) {
    const re = {
      $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
    match.$or = [
      { title: re },
      { citation: re },
      { abstract: re },
      { venue: re },
      { authors: re },
    ];
  }

  const sortKey = clippingListSort(query.sort);
  const total = await col.countDocuments(match);
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize) || 1);
  const page = Math.min(query.page, totalPages);
  const skip = (page - 1) * query.pageSize;
  const items = (await col
    .aggregate([
      { $match: match },
      ...mongoSortStages(sortKey),
      { $skip: skip },
      { $limit: query.pageSize },
      { $project: { _id: 0, _rank: 0 } },
    ])
    .toArray()) as unknown as import('@/types/content').MediaClipping[];

  let facets: import('@/lib/cms/paginated-list').MediaClippingListFacets | undefined;
  let options: import('@/lib/cms/paginated-list').ResearchListOptions | undefined;
  if (query.facets) {
    const all = (await col
      .find({})
      .project({ _id: 0 })
      .toArray()) as unknown as import('@/types/content').MediaClipping[];
    facets = buildMediaClippingFacets(all);
    options = { years: buildMediaClippingYears(all), areas: [] };
  }

  return {
    items,
    total,
    page,
    pageSize: query.pageSize,
    facets,
    options,
  };
}

function areaListSort(
  sort: import('@/lib/cms/paginated-list').CollectionListQuery['sort'],
): import('@/lib/cms/paginated-list').ResearchListSort {
  if (
    sort === 'updated_asc' ||
    sort === 'updated_desc' ||
    sort === 'title_asc' ||
    sort === 'order_asc'
  ) {
    return sort;
  }
  return 'order_asc';
}

export async function mongoListResearchAreas(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').ResearchArea
  >
> {
  const { mongoSortStages, buildResearchAreaFacets } = await import(
    '@/lib/cms/paginated-list'
  );
  const db = await getDb();
  const col = db.collection(mongoNameForList('researchAreas'));

  const match: Record<string, unknown> = {};
  if (query.status) match.status = query.status;
  if (query.q) {
    const re = {
      $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
    match.$or = [
      { title: re },
      { shortDescription: re },
      { description: re },
    ];
  }

  const sortKey = areaListSort(query.sort);
  const total = await col.countDocuments(match);
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize) || 1);
  const page = Math.min(query.page, totalPages);
  const skip = (page - 1) * query.pageSize;
  const items = (await col
    .aggregate([
      { $match: match },
      ...mongoSortStages(sortKey),
      { $skip: skip },
      { $limit: query.pageSize },
      { $project: { _id: 0, _rank: 0 } },
    ])
    .toArray()) as unknown as import('@/types/content').ResearchArea[];

  const facets = query.facets
    ? buildResearchAreaFacets(
        (await col.find({}).project({ _id: 0 }).toArray()) as unknown as import(
          '@/types/content'
        ).ResearchArea[],
      )
    : undefined;

  return {
    items,
    total,
    page,
    pageSize: query.pageSize,
    facets,
  };
}

async function loadResearchListRelated(
  items: import('@/types/content').ResearchProject[],
) {
  const db = await getDb();
  const pubIds = [
    ...new Set(items.flatMap((item) => item.publicationIds ?? [])),
  ];
  const areaIds = [...new Set(items.flatMap((item) => item.areaIds ?? []))];

  const [publications, researchAreas] = await Promise.all([
    pubIds.length
      ? db
          .collection(mongoNameForList('publications'))
          .find({ id: { $in: pubIds } })
          .project({ _id: 0, id: 1, url: 1, doi: 1, citation: 1 })
          .toArray()
      : Promise.resolve([]),
    areaIds.length
      ? db
          .collection(mongoNameForList('researchAreas'))
          .find({ id: { $in: areaIds } })
          .project({ _id: 0, id: 1, title: 1 })
          .toArray()
      : Promise.resolve([]),
  ]);

  return {
    publications: publications as Array<{
      id: string;
      url?: string | null;
      doi?: string | null;
      citation?: string | null;
    }>,
    researchAreas: researchAreas as Array<{ id: string; title: string }>,
  };
}

export async function mongoGetById<K extends ContentCollectionKey>(
  collection: K,
  id: string,
): Promise<CollectionEntityMap[K] | undefined> {
  const db = await getDb();
  const row = await db.collection(mongoNameForList(collection)).findOne({ id });
  if (!row) return undefined;
  return stripMongoId(row as Record<string, unknown>) as unknown as CollectionEntityMap[K];
}

export async function mongoGetBySlug<K extends ContentCollectionKey>(
  collection: K,
  slug: string,
): Promise<CollectionEntityMap[K] | undefined> {
  const db = await getDb();
  const row = await db.collection(mongoNameForList(collection)).findOne({ slug });
  if (!row) return undefined;
  return stripMongoId(row as Record<string, unknown>) as unknown as CollectionEntityMap[K];
}

export async function mongoCreate<K extends ContentCollectionKey>(
  collection: K,
  input: Omit<CollectionEntityMap[K], 'id' | 'createdAt' | 'updatedAt'> &
    Partial<Pick<CollectionEntityMap[K], 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<CollectionEntityMap[K]> {
  const timestamp = nowIso();
  const prepared = { ...input } as Record<string, unknown>;

  if (collection === 'people') {
    const personInput = prepared as Partial<import('@/types/content').Person>;
    if (!personInput.verificationCode) {
      const people = await mongoGetAll('people');
      let max = 0;
      for (const person of people) {
        const match = person.verificationCode?.match(/BKSR-(\d+)M/i);
        if (match) max = Math.max(max, Number(match[1]));
      }
      prepared.verificationCode = `BKSR-${String(max + 1).padStart(5, '0')}M`;
    }
    if (personInput.email && !personInput.claimStatus) {
      prepared.claimStatus = 'unclaimed';
    }
  }

  const item = {
    ...prepared,
    id: (prepared.id as string | undefined) ?? randomUUID(),
    createdAt: (prepared.createdAt as string | undefined) ?? timestamp,
    updatedAt: (prepared.updatedAt as string | undefined) ?? timestamp,
  } as CollectionEntityMap[K];

  const db = await getDb();
  await db.collection(mongoNameForList(collection)).insertOne({
    ...item,
    _id: (item as { id: string }).id,
  } as never);

  revalidateTag(CMS_CACHE_TAGS.collection(collection), 'max');
  revalidateTag(CMS_CACHE_TAGS.all, { expire: 0 });
  return item;
}

export async function mongoUpdate<K extends ContentCollectionKey>(
  collection: K,
  id: string,
  patch: Partial<CollectionEntityMap[K]>,
): Promise<CollectionEntityMap[K] | undefined> {
  const existing = await mongoGetById(collection, id);
  if (!existing) return undefined;

  const updated = {
    ...existing,
    ...patch,
    id,
    updatedAt: nowIso(),
  } as CollectionEntityMap[K];

  const db = await getDb();
  await db.collection(mongoNameForList(collection)).replaceOne(
    { id },
    { ...updated, _id: id } as never,
  );

  revalidateTag(CMS_CACHE_TAGS.collection(collection), 'max');
  revalidateTag(CMS_CACHE_TAGS.all, { expire: 0 });
  return updated;
}

export async function mongoRemove<K extends ContentCollectionKey>(
  collection: K,
  id: string,
): Promise<boolean> {
  const deleted = await mongoRemoveMany(collection, [id]);
  return deleted > 0;
}

export async function mongoRemoveMany<K extends ContentCollectionKey>(
  collection: K,
  ids: string[],
): Promise<number> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return 0;

  const db = await getDb();
  const result = await db
    .collection(mongoNameForList(collection))
    .deleteMany({ id: { $in: uniqueIds } });
  if (result.deletedCount === 0) return 0;

  if (collection === 'people') {
    await Promise.all([
      db
        .collection(MONGO_COLLECTIONS.personContentLinks)
        .deleteMany({ personId: { $in: uniqueIds } }),
      db
        .collection(MONGO_COLLECTIONS.roleAssignments)
        .deleteMany({ personId: { $in: uniqueIds } }),
      db
        .collection(MONGO_COLLECTIONS.achievementAssignments)
        .deleteMany({ personId: { $in: uniqueIds } }),
      db
        .collection(MONGO_COLLECTIONS.memberAchievements)
        .deleteMany({ personId: { $in: uniqueIds } }),
    ]);
  } else if (collection === 'events') {
    await db
      .collection(MONGO_COLLECTIONS.personContentLinks)
      .deleteMany({ entityType: 'event', entityId: { $in: uniqueIds } });
    const forms = await db
      .collection(MONGO_COLLECTIONS.registrationForms)
      .find({ entityType: 'event', entityId: { $in: uniqueIds } })
      .project({ id: 1 })
      .toArray();
    const formIds = forms.map((f) => (f as { id: string }).id);
    await db
      .collection(MONGO_COLLECTIONS.registrationForms)
      .deleteMany({ entityType: 'event', entityId: { $in: uniqueIds } });
    if (formIds.length) {
      await db
        .collection(MONGO_COLLECTIONS.registrationEntries)
        .deleteMany({ formId: { $in: formIds } });
    }
  } else if (collection === 'researchProjects') {
    await db
      .collection(MONGO_COLLECTIONS.personContentLinks)
      .deleteMany({ entityType: 'research', entityId: { $in: uniqueIds } });
  } else if (collection === 'publications') {
    await db
      .collection(MONGO_COLLECTIONS.personContentLinks)
      .deleteMany({
        entityType: 'publication',
        entityId: { $in: uniqueIds },
      });
  } else if (collection === 'activities') {
    await db
      .collection(MONGO_COLLECTIONS.personContentLinks)
      .deleteMany({ entityType: 'activity', entityId: { $in: uniqueIds } });
  }

  revalidateTag(CMS_CACHE_TAGS.collection(collection), 'max');
  revalidateTag(CMS_CACHE_TAGS.all, { expire: 0 });
  return result.deletedCount;
}

export async function mongoDuplicate<K extends ContentCollectionKey>(
  collection: K,
  id: string,
): Promise<CollectionEntityMap[K] | undefined> {
  const source = await mongoGetById(collection, id);
  if (!source) return undefined;

  const timestamp = nowIso();
  const copy = structuredClone(source) as CollectionEntityMap[K] & {
    slug?: string;
    title?: string;
    name?: string;
    status?: string;
  };
  copy.id = randomUUID();
  copy.createdAt = timestamp;
  copy.updatedAt = timestamp;
  if ('slug' in copy && typeof copy.slug === 'string') {
    copy.slug = `${copy.slug}-copy`;
  }
  if ('status' in copy) copy.status = 'draft';
  if ('title' in copy && typeof copy.title === 'string') {
    copy.title = `${copy.title} (Copy)`;
  }
  if ('name' in copy && typeof copy.name === 'string') {
    copy.name = `${copy.name} (Copy)`;
  }

  const db = await getDb();
  await db.collection(mongoNameForList(collection)).insertOne({
    ...copy,
    _id: copy.id,
  } as never);

  revalidateTag(CMS_CACHE_TAGS.collection(collection), 'max');
  revalidateTag(CMS_CACHE_TAGS.all, { expire: 0 });
  return copy as CollectionEntityMap[K];
}

export async function mongoUpdateSiteSettings(
  patch: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const current = await readSingleton(
    MONGO_COLLECTIONS.siteSettings,
    seedDatabase.siteSettings,
  );
  const next = {
    ...current,
    ...patch,
    updatedAt: nowIso(),
  };
  await writeSingleton(
    MONGO_COLLECTIONS.siteSettings,
    next as unknown as Record<string, unknown>,
    CMS_CACHE_TAGS.siteSettings,
  );
  return next;
}

export async function mongoUpdateHomepage(
  patch: Partial<HomepageConfig>,
): Promise<HomepageConfig> {
  const current = await readSingleton(
    MONGO_COLLECTIONS.homepage,
    seedDatabase.homepage,
  );
  const next = {
    ...current,
    ...patch,
    updatedAt: nowIso(),
  };
  await writeSingleton(
    MONGO_COLLECTIONS.homepage,
    next as unknown as Record<string, unknown>,
    CMS_CACHE_TAGS.homepage,
  );
  return next;
}

export async function mongoUpdateNavigation(
  patch: Partial<ContentDatabase['navigation']>,
): Promise<ContentDatabase['navigation']> {
  const current = await readSingleton(
    MONGO_COLLECTIONS.navigation,
    seedDatabase.navigation,
  );
  const next = {
    ...current,
    ...patch,
  };
  await writeSingleton(
    MONGO_COLLECTIONS.navigation,
    { id: 'default', ...next } as unknown as Record<string, unknown>,
    CMS_CACHE_TAGS.navigation,
  );
  return next;
}

export async function mongoReplaceNavigationList(
  key: keyof ContentDatabase['navigation'],
  items: NavigationItem[],
): Promise<ContentDatabase['navigation']> {
  return mongoUpdateNavigation({ [key]: items });
}

/** One-shot seed from compiled seedDatabase into Mongo (upsert). */
export async function mongoSeedFromCompiled(
  options: { wipe?: boolean } = {},
): Promise<{ collections: number; documents: number }> {
  const db = await getDb();
  await ensureIndexes(db);

  if (options.wipe) {
    await Promise.all([
      db.collection(MONGO_COLLECTIONS.siteSettings).deleteMany({}),
      db.collection(MONGO_COLLECTIONS.homepage).deleteMany({}),
      db.collection(MONGO_COLLECTIONS.navigation).deleteMany({}),
      ...LIST_COLLECTION_KEYS.map((key) =>
        db.collection(mongoNameForList(key)).deleteMany({}),
      ),
    ]);
  }

  const seed = structuredClone(seedDatabase);
  let documents = 0;

  await writeSingleton(
    MONGO_COLLECTIONS.siteSettings,
    seed.siteSettings as unknown as Record<string, unknown>,
    CMS_CACHE_TAGS.siteSettings,
  );
  documents += 1;

  await writeSingleton(
    MONGO_COLLECTIONS.homepage,
    seed.homepage as unknown as Record<string, unknown>,
    CMS_CACHE_TAGS.homepage,
  );
  documents += 1;

  await writeSingleton(
    MONGO_COLLECTIONS.navigation,
    { id: 'default', ...seed.navigation } as unknown as Record<string, unknown>,
    CMS_CACHE_TAGS.navigation,
  );
  documents += 1;

  for (const key of LIST_COLLECTION_KEYS) {
    const items = seed[key] as Array<{ id: string }>;
    if (!items.length) continue;
    const col = db.collection(mongoNameForList(key));
    const ops = items.map((item) => ({
      replaceOne: {
        filter: { id: item.id },
        replacement: { ...item, _id: item.id },
        upsert: true,
      },
    }));
    // Mongo bulkWrite typed as Document
    await col.bulkWrite(ops as never);
    documents += items.length;
  }

  await db.collection(MONGO_COLLECTIONS.meta).updateOne(
    { _id: 'version' } as never,
    {
      $set: {
        version: seed.version,
        seededAt: nowIso(),
      },
    },
    { upsert: true },
  );

  revalidateTag(CMS_CACHE_TAGS.all, { expire: 0 });

  return {
    collections: 3 + LIST_COLLECTION_KEYS.length,
    documents,
  };
}

export const mongoCmsRepository = {
  getFullDatabase: mongoGetFullDatabase,
  getAll: mongoGetAll,
  getById: mongoGetById,
  getBySlug: mongoGetBySlug,
  listResearchProjects: mongoListResearchProjects,
  listPublications: mongoListPublications,
  create: mongoCreate,
  update: mongoUpdate,
  remove: mongoRemove,
  duplicate: mongoDuplicate,
  updateSiteSettings: mongoUpdateSiteSettings,
  updateHomepage: mongoUpdateHomepage,
  updateNavigation: mongoUpdateNavigation,
  replaceNavigationList: mongoReplaceNavigationList,
  seedFromCompiled: mongoSeedFromCompiled,
};

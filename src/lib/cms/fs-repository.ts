import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { revalidateTag } from 'next/cache';
import { randomUUID } from 'crypto';
import { CMS_CACHE_TAGS, LIST_COLLECTION_KEYS } from '@/lib/db/collections';
import { getSeedDatabase } from '@/lib/cms/repository';
import type {
  CollectionEntityMap,
  ContentCollectionKey,
  ContentDatabase,
  HomepageConfig,
  NavigationItem,
  SiteSettings,
} from '@/types/content';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'cms-database.json');

function nowIso() {
  return new Date().toISOString();
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readDb(): Promise<ContentDatabase> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as ContentDatabase;
    if (parsed?.siteSettings && parsed?.homepage) {
      for (const key of LIST_COLLECTION_KEYS) {
        if (!Array.isArray(parsed[key])) {
          parsed[key] = [] as never;
        }
      }
      return parsed;
    }
  } catch {
    // Missing or unreadable local file. Public reads use the compiled seed.
  }
  // Never write or revalidate on read. This runs during page render and
  // inside unstable_cache; revalidateTag is only valid from mutations.
  return getSeedDatabase();
}

async function writeDb(database: ContentDatabase): Promise<void> {
  await ensureDir();
  const next = { ...database, version: database.version ?? 1 };
  await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2), 'utf8');
  revalidateTag(CMS_CACHE_TAGS.all, { expire: 0 });
}

export async function fsGetFullDatabase(): Promise<ContentDatabase> {
  return readDb();
}

export async function fsGetAll<K extends ContentCollectionKey>(
  collection: K,
): Promise<CollectionEntityMap[K][]> {
  const db = await readDb();
  return db[collection] as CollectionEntityMap[K][];
}

export async function fsListResearchProjects(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<import('@/lib/cms/paginated-list').CollectionListResult<
  import('@/types/content').ResearchProject
>> {
  const {
    buildResearchFacets,
    buildResearchYears,
    filterResearchProjects,
    sortResearchProjects,
    paginateInMemory,
  } = await import('@/lib/cms/paginated-list');

  const db = await readDb();
  const all = db.researchProjects;
  const publicationsById = new Map(
    db.publications.map((pub) => [
      pub.id,
      { url: pub.url, doi: pub.doi, citation: pub.citation },
    ]),
  );
  const filtered = sortResearchProjects(
    filterResearchProjects(all, query, publicationsById),
    query.sort,
  );
  const page = paginateInMemory(filtered, query.page, query.pageSize);

  const pubIds = new Set(
    page.items.flatMap((item) => item.publicationIds ?? []),
  );
  const areaIds = new Set(page.items.flatMap((item) => item.areaIds ?? []));

  return {
    ...page,
    facets: query.facets
      ? buildResearchFacets(all, publicationsById)
      : undefined,
    options: query.facets
      ? {
          years: buildResearchYears(all),
          areas: [...db.researchAreas]
            .map((area) => ({ id: area.id, title: area.title }))
            .sort((a, b) => a.title.localeCompare(b.title)),
        }
      : undefined,
    related: {
      publications: db.publications
        .filter((pub) => pubIds.has(pub.id))
        .map((pub) => ({
          id: pub.id,
          url: pub.url,
          doi: pub.doi,
          citation: pub.citation,
        })),
      researchAreas: db.researchAreas
        .filter((area) => areaIds.has(area.id))
        .map((area) => ({ id: area.id, title: area.title })),
    },
  };
}

export async function fsListPublications(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Publication
  >
> {
  const {
    buildPublicationFacets,
    buildPublicationYears,
    filterPublications,
    sortPublications,
    paginateInMemory,
  } = await import('@/lib/cms/paginated-list');

  const db = await readDb();
  const all = db.publications;
  const filtered = sortPublications(filterPublications(all, query), query.sort);
  const page = paginateInMemory(filtered, query.page, query.pageSize);
  const areaIds = new Set(page.items.flatMap((item) => item.areaIds ?? []));

  return {
    ...page,
    facets: query.facets ? buildPublicationFacets(all) : undefined,
    options: query.facets
      ? {
          years: buildPublicationYears(all),
          areas: [...db.researchAreas]
            .map((area) => ({ id: area.id, title: area.title }))
            .sort((a, b) => a.title.localeCompare(b.title)),
        }
      : undefined,
    related: {
      researchAreas: db.researchAreas
        .filter((area) => areaIds.has(area.id))
        .map((area) => ({ id: area.id, title: area.title })),
    },
  };
}

export async function fsListEvents(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Event
  >
> {
  const {
    buildEventFacets,
    buildEventYears,
    filterEvents,
    sortEvents,
    paginateInMemory,
  } = await import('@/lib/cms/paginated-list');

  const db = await readDb();
  const all = db.events;
  const sort = query.sort === 'category' || query.sort === 'type' || !query.sort
    ? 'start_desc'
    : query.sort;
  const filtered = sortEvents(filterEvents(all, query), sort);
  const page = paginateInMemory(filtered, query.page, query.pageSize);

  return {
    ...page,
    facets: query.facets ? buildEventFacets(all) : undefined,
    options: query.facets
      ? { years: buildEventYears(all), areas: [] }
      : undefined,
  };
}

export async function fsListNotices(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Notice
  >
> {
  const {
    buildNoticeFacets,
    buildNoticeYears,
    filterNotices,
    sortNotices,
    paginateInMemory,
  } = await import('@/lib/cms/paginated-list');

  const db = await readDb();
  const all = db.notices;
  const sort =
    !query.sort || query.sort === 'category' || query.sort === 'type'
      ? 'updated_desc'
      : query.sort;
  const filtered = sortNotices(filterNotices(all, query), sort);
  const page = paginateInMemory(filtered, query.page, query.pageSize);

  return {
    ...page,
    facets: query.facets ? buildNoticeFacets(all) : undefined,
    options: query.facets
      ? { years: buildNoticeYears(all), areas: [] }
      : undefined,
  };
}

export async function fsListActivities(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Activity
  >
> {
  const {
    buildActivityFacets,
    filterActivities,
    sortActivities,
    paginateInMemory,
  } = await import('@/lib/cms/paginated-list');

  const db = await readDb();
  const all = db.activities;
  const sort =
    !query.sort ||
    query.sort === 'category' ||
    query.sort === 'type' ||
    query.sort === 'start_desc' ||
    query.sort === 'start_asc' ||
    query.sort === 'deadline_desc' ||
    query.sort === 'deadline_asc'
      ? 'order_asc'
      : query.sort;
  const filtered = sortActivities(filterActivities(all, query), sort);
  const page = paginateInMemory(filtered, query.page, query.pageSize);

  return {
    ...page,
    facets: query.facets ? buildActivityFacets(all) : undefined,
  };
}

export async function fsListResources(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Resource
  >
> {
  const {
    buildResourceFacets,
    filterResources,
    sortResources,
    paginateInMemory,
  } = await import('@/lib/cms/paginated-list');

  const db = await readDb();
  const all = db.resources;
  const sort =
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
  const filtered = sortResources(filterResources(all, query), sort);
  const page = paginateInMemory(filtered, query.page, query.pageSize);

  return {
    ...page,
    facets: query.facets ? buildResourceFacets(all) : undefined,
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

export async function fsListNews(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').NewsArticle
  >
> {
  const {
    buildNewsFacets,
    buildNewsYears,
    filterNews,
    sortNews,
    paginateInMemory,
  } = await import('@/lib/cms/paginated-list');

  const db = await readDb();
  const all = db.news;
  const filtered = sortNews(filterNews(all, query), newsListSort(query.sort));
  const page = paginateInMemory(filtered, query.page, query.pageSize);

  return {
    ...page,
    facets: query.facets ? buildNewsFacets(all) : undefined,
    options: query.facets ? { years: buildNewsYears(all), areas: [] } : undefined,
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

export async function fsListMediaClippings(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').MediaClipping
  >
> {
  const {
    buildMediaClippingFacets,
    buildMediaClippingYears,
    filterMediaClippings,
    sortMediaClippings,
    paginateInMemory,
  } = await import('@/lib/cms/paginated-list');

  const db = await readDb();
  const all = db.mediaClippings ?? [];
  const filtered = sortMediaClippings(
    filterMediaClippings(all, query),
    clippingListSort(query.sort),
  );
  const page = paginateInMemory(filtered, query.page, query.pageSize);

  return {
    ...page,
    facets: query.facets ? buildMediaClippingFacets(all) : undefined,
    options: query.facets
      ? { years: buildMediaClippingYears(all), areas: [] }
      : undefined,
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

export async function fsListResearchAreas(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').ResearchArea
  >
> {
  const {
    buildResearchAreaFacets,
    filterResearchAreas,
    sortResearchAreas,
    paginateInMemory,
  } = await import('@/lib/cms/paginated-list');

  const db = await readDb();
  const all = db.researchAreas;
  const filtered = sortResearchAreas(
    filterResearchAreas(all, query),
    areaListSort(query.sort),
  );
  const page = paginateInMemory(filtered, query.page, query.pageSize);

  return {
    ...page,
    facets: query.facets ? buildResearchAreaFacets(all) : undefined,
  };
}

export async function fsGetById<K extends ContentCollectionKey>(
  collection: K,
  id: string,
): Promise<CollectionEntityMap[K] | undefined> {
  return (await fsGetAll(collection)).find((item) => item.id === id);
}

export async function fsGetBySlug<K extends ContentCollectionKey>(
  collection: K,
  slug: string,
): Promise<CollectionEntityMap[K] | undefined> {
  return (await fsGetAll(collection)).find(
    (item) => 'slug' in item && item.slug === slug,
  );
}

export async function fsCreate<K extends ContentCollectionKey>(
  collection: K,
  input: Omit<CollectionEntityMap[K], 'id' | 'createdAt' | 'updatedAt'> &
    Partial<Pick<CollectionEntityMap[K], 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<CollectionEntityMap[K]> {
  const db = await readDb();
  const timestamp = nowIso();
  const prepared = { ...input } as Record<string, unknown>;

  if (collection === 'people') {
    const personInput = prepared as Partial<import('@/types/content').Person>;
    if (!personInput.verificationCode) {
      let max = 0;
      for (const person of db.people) {
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

  (db[collection] as CollectionEntityMap[K][]).push(item);
  await writeDb(db);
  return item;
}

export async function fsUpdate<K extends ContentCollectionKey>(
  collection: K,
  id: string,
  patch: Partial<CollectionEntityMap[K]>,
): Promise<CollectionEntityMap[K] | undefined> {
  const db = await readDb();
  const list = db[collection] as CollectionEntityMap[K][];
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return undefined;
  const updated = {
    ...list[index],
    ...patch,
    id,
    updatedAt: nowIso(),
  } as CollectionEntityMap[K];
  list[index] = updated;
  await writeDb(db);
  return updated;
}

export async function fsRemove<K extends ContentCollectionKey>(
  collection: K,
  id: string,
): Promise<boolean> {
  const deleted = await fsRemoveMany(collection, [id]);
  return deleted > 0;
}

export async function fsRemoveMany<K extends ContentCollectionKey>(
  collection: K,
  ids: string[],
): Promise<number> {
  const uniqueIds = new Set(ids.filter(Boolean));
  if (uniqueIds.size === 0) return 0;

  const db = await readDb();
  const list = db[collection] as CollectionEntityMap[K][];
  const next = list.filter((item) => !uniqueIds.has(item.id));
  const deleted = list.length - next.length;
  if (deleted === 0) return 0;
  (db[collection] as CollectionEntityMap[K][]) = next;

  if (collection === 'people') {
    db.personContentLinks = db.personContentLinks.filter(
      (l) => !uniqueIds.has(l.personId),
    );
    db.roleAssignments = db.roleAssignments.filter(
      (r) => !uniqueIds.has(r.personId),
    );
    db.achievementAssignments = db.achievementAssignments.filter(
      (r) => !uniqueIds.has(r.personId),
    );
    db.memberAchievements = db.memberAchievements.filter(
      (r) => !uniqueIds.has(r.personId),
    );
  } else if (collection === 'events') {
    db.personContentLinks = db.personContentLinks.filter(
      (l) => !(l.entityType === 'event' && uniqueIds.has(l.entityId)),
    );
    const formIds = db.registrationForms
      .filter((f) => f.entityType === 'event' && uniqueIds.has(f.entityId))
      .map((f) => f.id);
    const formIdSet = new Set(formIds);
    db.registrationForms = db.registrationForms.filter(
      (f) => !(f.entityType === 'event' && uniqueIds.has(f.entityId)),
    );
    db.registrationEntries = db.registrationEntries.filter(
      (e) => !formIdSet.has(e.formId),
    );
  } else if (collection === 'researchProjects') {
    db.personContentLinks = db.personContentLinks.filter(
      (l) => !(l.entityType === 'research' && uniqueIds.has(l.entityId)),
    );
  } else if (collection === 'publications') {
    db.personContentLinks = db.personContentLinks.filter(
      (l) => !(l.entityType === 'publication' && uniqueIds.has(l.entityId)),
    );
  } else if (collection === 'activities') {
    db.personContentLinks = db.personContentLinks.filter(
      (l) => !(l.entityType === 'activity' && uniqueIds.has(l.entityId)),
    );
  }

  await writeDb(db);
  return deleted;
}

export async function fsDuplicate<K extends ContentCollectionKey>(
  collection: K,
  id: string,
): Promise<CollectionEntityMap[K] | undefined> {
  const source = await fsGetById(collection, id);
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
  const db = await readDb();
  (db[collection] as CollectionEntityMap[K][]).push(copy as CollectionEntityMap[K]);
  await writeDb(db);
  return copy as CollectionEntityMap[K];
}

export async function fsUpdateSiteSettings(
  patch: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const db = await readDb();
  db.siteSettings = {
    ...db.siteSettings,
    ...patch,
    updatedAt: nowIso(),
  };
  await writeDb(db);
  return db.siteSettings;
}

export async function fsUpdateHomepage(
  patch: Partial<HomepageConfig>,
): Promise<HomepageConfig> {
  const db = await readDb();
  db.homepage = {
    ...db.homepage,
    ...patch,
    updatedAt: nowIso(),
  };
  await writeDb(db);
  return db.homepage;
}

export async function fsUpdateNavigation(
  patch: Partial<ContentDatabase['navigation']>,
): Promise<ContentDatabase['navigation']> {
  const db = await readDb();
  db.navigation = {
    ...db.navigation,
    ...patch,
  };
  await writeDb(db);
  return db.navigation;
}

export async function fsReplaceNavigationList(
  key: keyof ContentDatabase['navigation'],
  items: NavigationItem[],
): Promise<ContentDatabase['navigation']> {
  return fsUpdateNavigation({ [key]: items });
}

export async function fsSeedFromCompiled(
  options: { wipe?: boolean } = {},
): Promise<{ collections: number; documents: number }> {
  const seed = getSeedDatabase();
  if (options.wipe) {
    await writeDb(seed);
  } else {
    try {
      await fs.access(DATA_FILE);
      // keep existing unless wipe
    } catch {
      await writeDb(seed);
    }
  }
  let documents = 3;
  for (const key of LIST_COLLECTION_KEYS) {
    documents += seed[key].length;
  }
  return {
    collections: 3 + LIST_COLLECTION_KEYS.length,
    documents,
  };
}

export function fsDataFilePath() {
  return DATA_FILE;
}

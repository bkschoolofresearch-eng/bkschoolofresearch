import { seedDatabase } from '@/content/seed';
import type {
  CollectionEntityMap,
  ContentCollectionKey,
  ContentDatabase,
  HomepageConfig,
  NavigationItem,
  SiteSettings,
} from '@/types/content';
import { v4 as uuidv4 } from 'uuid';

export const STORAGE_KEY = 'bksr-cms-v1';

export type { ContentDatabase };

const COLLECTION_KEYS: ContentCollectionKey[] = [
  'pages',
  'people',
  'researchAreas',
  'researchProjects',
  'publications',
  'mediaClippings',
  'activities',
  'news',
  'events',
  'notices',
  'resources',
  'galleryAlbums',
  'galleryImages',
  'media',
  'personContentLinks',
  'registrationForms',
  'registrationEntries',
  'roleAssignments',
  'joinApplications',
  'achievements',
  'achievementAssignments',
  'memberAchievements',
];

function deepClone<T>(value: T): T {
  return structuredClone(value);
}

/** SSR-safe: seed only, no localStorage */
export function getSeedDatabase(): ContentDatabase {
  return deepClone(seedDatabase);
}

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readOverrides(): Partial<ContentDatabase> | null {
  if (!canUseLocalStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ContentDatabase>;
  } catch {
    return null;
  }
}

function mergeDatabase(
  seed: ContentDatabase,
  overrides: Partial<ContentDatabase> | null,
): ContentDatabase {
  if (!overrides) return seed;
  const merged = deepClone(seed);

  if (overrides.version != null) merged.version = overrides.version;
  if (overrides.siteSettings) merged.siteSettings = overrides.siteSettings;
  if (overrides.homepage) merged.homepage = overrides.homepage;
  if (overrides.navigation) {
    merged.navigation = {
      ...merged.navigation,
      ...overrides.navigation,
    };
  }

  for (const key of COLLECTION_KEYS) {
    const overrideCollection = overrides[key];
    if (Array.isArray(overrideCollection)) {
      merged[key] = overrideCollection as never;
    }
  }

  return merged;
}

/** Client: seed + localStorage overrides. Server: seed only. */
export function getDatabase(): ContentDatabase {
  const seed = getSeedDatabase();
  const overrides = readOverrides();
  return mergeDatabase(seed, overrides);
}

export function saveDatabase(database: ContentDatabase): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

export function resetDatabase(): ContentDatabase {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return getSeedDatabase();
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getAll<K extends ContentCollectionKey>(
  collection: K,
  database: ContentDatabase = getDatabase(),
): CollectionEntityMap[K][] {
  return database[collection] as CollectionEntityMap[K][];
}

export function getById<K extends ContentCollectionKey>(
  collection: K,
  id: string,
  database: ContentDatabase = getDatabase(),
): CollectionEntityMap[K] | undefined {
  return getAll(collection, database).find((item) => item.id === id);
}

export function getBySlug<K extends ContentCollectionKey>(
  collection: K,
  slug: string,
  database: ContentDatabase = getDatabase(),
): CollectionEntityMap[K] | undefined {
  return getAll(collection, database).find((item) => {
    return 'slug' in item && item.slug === slug;
  });
}

export function create<K extends ContentCollectionKey>(
  collection: K,
  input: Omit<CollectionEntityMap[K], 'id' | 'createdAt' | 'updatedAt'> &
    Partial<Pick<CollectionEntityMap[K], 'id' | 'createdAt' | 'updatedAt'>>,
  database: ContentDatabase = getDatabase(),
): { database: ContentDatabase; item: CollectionEntityMap[K] } {
  const timestamp = nowIso();
  const prepared = { ...input } as Record<string, unknown>;

  if (collection === 'people') {
    const personInput = prepared as Partial<import('@/types/content').Person>;
    if (!personInput.verificationCode) {
      let max = 0;
      for (const person of database.people) {
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
    id: (prepared.id as string | undefined) ?? uuidv4(),
    createdAt: (prepared.createdAt as string | undefined) ?? timestamp,
    updatedAt: (prepared.updatedAt as string | undefined) ?? timestamp,
  } as CollectionEntityMap[K];

  const next = deepClone(database);
  (next[collection] as CollectionEntityMap[K][]).push(item);
  saveDatabase(next);
  return { database: next, item };
}

export function update<K extends ContentCollectionKey>(
  collection: K,
  id: string,
  patch: Partial<CollectionEntityMap[K]>,
  database: ContentDatabase = getDatabase(),
): { database: ContentDatabase; item: CollectionEntityMap[K] | undefined } {
  const next = deepClone(database);
  const list = next[collection] as CollectionEntityMap[K][];
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return { database: next, item: undefined };

  const updated = {
    ...list[index],
    ...patch,
    id,
    updatedAt: nowIso(),
  } as CollectionEntityMap[K];
  list[index] = updated;
  saveDatabase(next);
  return { database: next, item: updated };
}

export function remove<K extends ContentCollectionKey>(
  collection: K,
  id: string,
  database: ContentDatabase = getDatabase(),
): ContentDatabase {
  const next = deepClone(database);
  const list = next[collection] as CollectionEntityMap[K][];
  (next[collection] as CollectionEntityMap[K][]) = list.filter(
    (item) => item.id !== id,
  );

  if (collection === 'people') {
    next.personContentLinks = next.personContentLinks.filter(
      (link) => link.personId !== id,
    );
    next.roleAssignments = next.roleAssignments.filter(
      (row) => row.personId !== id,
    );
    next.achievementAssignments = next.achievementAssignments.filter(
      (row) => row.personId !== id,
    );
    next.memberAchievements = next.memberAchievements.filter(
      (row) => row.personId !== id,
    );
  } else if (collection === 'events') {
    next.personContentLinks = next.personContentLinks.filter(
      (link) => !(link.entityType === 'event' && link.entityId === id),
    );
    const formIds = next.registrationForms
      .filter((form) => form.entityType === 'event' && form.entityId === id)
      .map((form) => form.id);
    next.registrationForms = next.registrationForms.filter(
      (form) => !(form.entityType === 'event' && form.entityId === id),
    );
    next.registrationEntries = next.registrationEntries.filter(
      (entry) => !formIds.includes(entry.formId),
    );
  } else if (collection === 'researchProjects') {
    next.personContentLinks = next.personContentLinks.filter(
      (link) => !(link.entityType === 'research' && link.entityId === id),
    );
  } else if (collection === 'publications') {
    next.personContentLinks = next.personContentLinks.filter(
      (link) => !(link.entityType === 'publication' && link.entityId === id),
    );
  } else if (collection === 'activities') {
    next.personContentLinks = next.personContentLinks.filter(
      (link) => !(link.entityType === 'activity' && link.entityId === id),
    );
  }

  saveDatabase(next);
  return next;
}

/** Alias matching common CRUD naming */
export const deleteItem = remove;

export function duplicate<K extends ContentCollectionKey>(
  collection: K,
  id: string,
  database: ContentDatabase = getDatabase(),
): { database: ContentDatabase; item: CollectionEntityMap[K] | undefined } {
  const source = getById(collection, id, database);
  if (!source) return { database, item: undefined };

  const timestamp = nowIso();
  const copy = deepClone(source) as CollectionEntityMap[K] & {
    slug?: string;
    title?: string;
    name?: string;
    status?: string;
  };
  copy.id = uuidv4();
  copy.createdAt = timestamp;
  copy.updatedAt = timestamp;
  if ('slug' in copy && typeof copy.slug === 'string') {
    copy.slug = `${copy.slug}-copy`;
  }
  if ('status' in copy) {
    copy.status = 'draft';
  }
  if ('title' in copy && typeof copy.title === 'string') {
    copy.title = `${copy.title} (Copy)`;
  }
  if ('name' in copy && typeof copy.name === 'string') {
    copy.name = `${copy.name} (Copy)`;
  }

  const next = deepClone(database);
  (next[collection] as CollectionEntityMap[K][]).push(copy);
  saveDatabase(next);
  return { database: next, item: copy };
}

export function updateSiteSettings(
  patch: Partial<SiteSettings>,
  database: ContentDatabase = getDatabase(),
): ContentDatabase {
  const next = deepClone(database);
  next.siteSettings = {
    ...next.siteSettings,
    ...patch,
    updatedAt: nowIso(),
  };
  saveDatabase(next);
  return next;
}

export function updateHomepage(
  patch: Partial<HomepageConfig>,
  database: ContentDatabase = getDatabase(),
): ContentDatabase {
  const next = deepClone(database);
  next.homepage = {
    ...next.homepage,
    ...patch,
    updatedAt: nowIso(),
  };
  saveDatabase(next);
  return next;
}

export function updateNavigation(
  patch: Partial<ContentDatabase['navigation']>,
  database: ContentDatabase = getDatabase(),
): ContentDatabase {
  const next = deepClone(database);
  next.navigation = {
    ...next.navigation,
    ...patch,
  };
  saveDatabase(next);
  return next;
}

export function replaceNavigationList(
  key: keyof ContentDatabase['navigation'],
  items: NavigationItem[],
  database: ContentDatabase = getDatabase(),
): ContentDatabase {
  return updateNavigation({ [key]: items }, database);
}

export const contentRepository = {
  STORAGE_KEY,
  getSeedDatabase,
  getDatabase,
  saveDatabase,
  resetDatabase,
  getAll,
  getById,
  getBySlug,
  create,
  update,
  delete: remove,
  remove,
  duplicate,
  updateSiteSettings,
  updateHomepage,
  updateNavigation,
  replaceNavigationList,
  collectionKeys: COLLECTION_KEYS,
};

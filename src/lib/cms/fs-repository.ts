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
    if (parsed?.siteSettings && parsed?.homepage) return parsed;
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
  revalidateTag(CMS_CACHE_TAGS.all, 'max');
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
  const db = await readDb();
  const list = db[collection] as CollectionEntityMap[K][];
  const next = list.filter((item) => item.id !== id);
  if (next.length === list.length) return false;
  (db[collection] as CollectionEntityMap[K][]) = next;

  if (collection === 'people') {
    db.personContentLinks = db.personContentLinks.filter((l) => l.personId !== id);
    db.roleAssignments = db.roleAssignments.filter((r) => r.personId !== id);
    db.achievementAssignments = db.achievementAssignments.filter(
      (r) => r.personId !== id,
    );
    db.memberAchievements = db.memberAchievements.filter((r) => r.personId !== id);
  } else if (collection === 'events') {
    db.personContentLinks = db.personContentLinks.filter(
      (l) => !(l.entityType === 'event' && l.entityId === id),
    );
    const formIds = db.registrationForms
      .filter((f) => f.entityType === 'event' && f.entityId === id)
      .map((f) => f.id);
    db.registrationForms = db.registrationForms.filter(
      (f) => !(f.entityType === 'event' && f.entityId === id),
    );
    db.registrationEntries = db.registrationEntries.filter(
      (e) => !formIds.includes(e.formId),
    );
  } else if (collection === 'researchProjects') {
    db.personContentLinks = db.personContentLinks.filter(
      (l) => !(l.entityType === 'research' && l.entityId === id),
    );
  } else if (collection === 'publications') {
    db.personContentLinks = db.personContentLinks.filter(
      (l) => !(l.entityType === 'publication' && l.entityId === id),
    );
  } else if (collection === 'activities') {
    db.personContentLinks = db.personContentLinks.filter(
      (l) => !(l.entityType === 'activity' && l.entityId === id),
    );
  }

  await writeDb(db);
  return true;
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

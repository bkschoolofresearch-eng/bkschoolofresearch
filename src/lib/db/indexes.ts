import 'server-only';
import type { Db, IndexDescription } from 'mongodb';
import {
  LIST_COLLECTION_KEYS,
  MONGO_COLLECTIONS,
  mongoNameForList,
} from '@/lib/db/collections';
import { getDb } from '@/lib/db/mongo';
import type { ContentCollectionKey } from '@/types/content';

type IndexSpec = { collection: string; indexes: IndexDescription[] };

const INDEX_SPECS: IndexSpec[] = [
  {
    collection: MONGO_COLLECTIONS.people,
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { category: 1, status: 1 } },
      { key: { email: 1 }, sparse: true },
      { key: { accountId: 1 }, sparse: true },
      { key: { verificationCode: 1 }, sparse: true },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.pages,
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { status: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.researchAreas,
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { status: 1, order: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.researchProjects,
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { researchStatus: 1, status: 1 } },
      { key: { areaIds: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.publications,
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { type: 1, year: -1, status: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.mediaClippings,
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { status: 1, year: -1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.activities,
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { type: 1, status: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.news,
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { status: 1, publishedAt: -1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.events,
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { eventStatus: 1, startAt: -1, status: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.notices,
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { noticeType: 1, status: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.resources,
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { resourceType: 1, status: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.galleryAlbums,
    indexes: [{ key: { slug: 1 }, unique: true }],
  },
  {
    collection: MONGO_COLLECTIONS.galleryImages,
    indexes: [
      { key: { albumId: 1, order: 1 } },
      { key: { status: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.media,
    indexes: [
      { key: { kind: 1, status: 1 } },
      { key: { updatedAt: -1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.personContentLinks,
    indexes: [
      { key: { personId: 1, entityType: 1 } },
      { key: { entityType: 1, entityId: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.registrationForms,
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { entityType: 1, entityId: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.registrationEntries,
    indexes: [
      { key: { formId: 1, createdAt: -1 } },
      { key: { status: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.roleAssignments,
    indexes: [{ key: { personId: 1, year: -1 } }],
  },
  {
    collection: MONGO_COLLECTIONS.joinApplications,
    indexes: [{ key: { status: 1, createdAt: -1 } }],
  },
  {
    collection: MONGO_COLLECTIONS.achievements,
    indexes: [{ key: { slug: 1 }, unique: true }],
  },
  {
    collection: MONGO_COLLECTIONS.achievementAssignments,
    indexes: [
      { key: { personId: 1 } },
      { key: { achievementId: 1 } },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.memberAchievements,
    indexes: [{ key: { personId: 1 } }],
  },
  {
    collection: MONGO_COLLECTIONS.accounts,
    indexes: [
      { key: { email: 1 }, unique: true },
      { key: { personId: 1 }, sparse: true },
    ],
  },
];

export async function ensureIndexes(db?: Db): Promise<void> {
  const database = db ?? (await getDb());
  await Promise.all(
    INDEX_SPECS.map(async ({ collection, indexes }) => {
      const col = database.collection(collection);
      for (const index of indexes) {
        await col.createIndexes([index]);
      }
    }),
  );
}

export function listCollectionName(key: ContentCollectionKey): string {
  return mongoNameForList(key);
}

export { LIST_COLLECTION_KEYS, MONGO_COLLECTIONS };

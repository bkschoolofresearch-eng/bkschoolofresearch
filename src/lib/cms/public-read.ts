import type { ContentCollectionKey } from '@/types/content';

/**
 * Explicit allowlist: the only collections that may be read without CMS admin
 * auth, and only when the caller requests published content (`?published=1`).
 * Anything else fails closed.
 */
export const CMS_PUBLIC_PUBLISHED_COLLECTIONS = new Set<ContentCollectionKey>([
  'pages',
  'people',
  'researchAreas',
  'researchProjects',
  'publications',
  'activities',
  'news',
  'events',
  'notices',
  'resources',
  'galleryAlbums',
  'galleryImages',
  'media',
  'achievements',
]);

/**
 * Collections that must never be readable without CMS admin auth,
 * even with ?published=1 (inbox / relation / form-entry data).
 */
export const CMS_ADMIN_ONLY_COLLECTIONS = new Set<ContentCollectionKey>([
  'joinApplications',
  'registrationEntries',
  'registrationForms',
  'roleAssignments',
  'personContentLinks',
  'achievementAssignments',
  'memberAchievements',
]);

export function isPublishedCmsItem(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false;
  return (item as { status?: string }).status === 'published';
}

/** Public API may only list/fetch this collection when publishedOnly is true. */
export function canPublicReadCollection(
  collection: ContentCollectionKey,
  publishedOnly: boolean,
): boolean {
  if (CMS_ADMIN_ONLY_COLLECTIONS.has(collection)) return false;
  if (!publishedOnly) return false;
  return CMS_PUBLIC_PUBLISHED_COLLECTIONS.has(collection);
}

export function assertPublicCmsReadAllowed(
  collection: ContentCollectionKey,
  publishedOnly: boolean,
): { ok: true } | { ok: false; reason: string } {
  if (CMS_ADMIN_ONLY_COLLECTIONS.has(collection)) {
    return { ok: false, reason: 'Collection requires admin authorization' };
  }
  if (!publishedOnly) {
    return { ok: false, reason: 'Unauthorized' };
  }
  if (!CMS_PUBLIC_PUBLISHED_COLLECTIONS.has(collection)) {
    return { ok: false, reason: 'Collection is not publicly readable' };
  }
  return { ok: true };
}

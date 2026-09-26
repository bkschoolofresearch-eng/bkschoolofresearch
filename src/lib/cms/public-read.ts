import type { ContentCollectionKey } from '@/types/content';

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

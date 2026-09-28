import type { ContentCollectionKey } from '@/types/content';

/**
 * Lean Mongo collection map.
 * Singletons stay as one doc each; list entities map 1:1 to ContentDatabase keys.
 * Junction / inbox rows stay separate so relations stay queryable without
 * embedding giant arrays on parent docs.
 */
export const MONGO_COLLECTIONS = {
  meta: 'cms_meta',
  siteSettings: 'site_settings',
  homepage: 'homepage',
  navigation: 'navigation',
  pages: 'pages',
  people: 'people',
  researchAreas: 'research_areas',
  researchProjects: 'research_projects',
  publications: 'publications',
  mediaClippings: 'media_clippings',
  activities: 'activities',
  news: 'news',
  events: 'events',
  notices: 'notices',
  resources: 'resources',
  galleryAlbums: 'gallery_albums',
  galleryImages: 'gallery_images',
  media: 'media',
  personContentLinks: 'person_content_links',
  registrationForms: 'registration_forms',
  registrationEntries: 'registration_entries',
  roleAssignments: 'role_assignments',
  joinApplications: 'join_applications',
  achievements: 'achievements',
  achievementAssignments: 'achievement_assignments',
  memberAchievements: 'member_achievements',
  /** Auth Phase 2 — not part of ContentDatabase dump */
  accounts: 'accounts',
} as const;

export type MongoListCollection = ContentCollectionKey;

export const LIST_COLLECTION_KEYS: ContentCollectionKey[] = [
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

export function mongoNameForList(
  key: ContentCollectionKey,
): (typeof MONGO_COLLECTIONS)[ContentCollectionKey] {
  return MONGO_COLLECTIONS[key];
}

/** CMS cache tags — revalidateTag / updateTag on mutations */
export const CMS_CACHE_TAGS = {
  all: 'cms',
  siteSettings: 'cms:site_settings',
  homepage: 'cms:homepage',
  navigation: 'cms:navigation',
  collection: (key: ContentCollectionKey) => `cms:${key}`,
} as const;

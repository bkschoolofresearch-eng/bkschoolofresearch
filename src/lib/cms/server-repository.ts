import 'server-only';
import type {
  CollectionEntityMap,
  ContentCollectionKey,
  ContentDatabase,
  HomepageConfig,
  NavigationItem,
  SiteSettings,
} from '@/types/content';

export type CmsDriver = 'fs' | 'mongo';

export function getCmsDriver(): CmsDriver {
  if (
    process.env.CMS_DRIVER === 'mongo' &&
    Boolean(process.env.MONGODB_URI)
  ) {
    return 'mongo';
  }
  return 'fs';
}

export async function serverGetFullDatabase(): Promise<ContentDatabase> {
  if (getCmsDriver() === 'mongo') {
    const { mongoGetFullDatabase } = await import('@/lib/cms/mongo-repository');
    return mongoGetFullDatabase();
  }
  const { fsGetFullDatabase } = await import('@/lib/cms/fs-repository');
  return fsGetFullDatabase();
}

export async function serverGetAll<K extends ContentCollectionKey>(
  collection: K,
): Promise<CollectionEntityMap[K][]> {
  if (getCmsDriver() === 'mongo') {
    const { mongoGetAll } = await import('@/lib/cms/mongo-repository');
    return mongoGetAll(collection);
  }
  const { fsGetAll } = await import('@/lib/cms/fs-repository');
  return fsGetAll(collection);
}

export async function serverListResearchProjects(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').ResearchProject
  >
> {
  if (getCmsDriver() === 'mongo') {
    const { mongoListResearchProjects } = await import(
      '@/lib/cms/mongo-repository'
    );
    return mongoListResearchProjects(query);
  }
  const { fsListResearchProjects } = await import('@/lib/cms/fs-repository');
  return fsListResearchProjects(query);
}

export async function serverListPublications(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Publication
  >
> {
  if (getCmsDriver() === 'mongo') {
    const { mongoListPublications } = await import('@/lib/cms/mongo-repository');
    return mongoListPublications(query);
  }
  const { fsListPublications } = await import('@/lib/cms/fs-repository');
  return fsListPublications(query);
}

export async function serverListEvents(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Event
  >
> {
  if (getCmsDriver() === 'mongo') {
    const { mongoListEvents } = await import('@/lib/cms/mongo-repository');
    return mongoListEvents(query);
  }
  const { fsListEvents } = await import('@/lib/cms/fs-repository');
  return fsListEvents(query);
}

export async function serverListNotices(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Notice
  >
> {
  if (getCmsDriver() === 'mongo') {
    const { mongoListNotices } = await import('@/lib/cms/mongo-repository');
    return mongoListNotices(query);
  }
  const { fsListNotices } = await import('@/lib/cms/fs-repository');
  return fsListNotices(query);
}

export async function serverListActivities(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Activity
  >
> {
  if (getCmsDriver() === 'mongo') {
    const { mongoListActivities } = await import('@/lib/cms/mongo-repository');
    return mongoListActivities(query);
  }
  const { fsListActivities } = await import('@/lib/cms/fs-repository');
  return fsListActivities(query);
}

export async function serverListResources(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').Resource
  >
> {
  if (getCmsDriver() === 'mongo') {
    const { mongoListResources } = await import('@/lib/cms/mongo-repository');
    return mongoListResources(query);
  }
  const { fsListResources } = await import('@/lib/cms/fs-repository');
  return fsListResources(query);
}

export async function serverListNews(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').NewsArticle
  >
> {
  if (getCmsDriver() === 'mongo') {
    const { mongoListNews } = await import('@/lib/cms/mongo-repository');
    return mongoListNews(query);
  }
  const { fsListNews } = await import('@/lib/cms/fs-repository');
  return fsListNews(query);
}

export async function serverListMediaClippings(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').MediaClipping
  >
> {
  if (getCmsDriver() === 'mongo') {
    const { mongoListMediaClippings } = await import('@/lib/cms/mongo-repository');
    return mongoListMediaClippings(query);
  }
  const { fsListMediaClippings } = await import('@/lib/cms/fs-repository');
  return fsListMediaClippings(query);
}

export async function serverListResearchAreas(
  query: import('@/lib/cms/paginated-list').CollectionListQuery,
): Promise<
  import('@/lib/cms/paginated-list').CollectionListResult<
    import('@/types/content').ResearchArea
  >
> {
  if (getCmsDriver() === 'mongo') {
    const { mongoListResearchAreas } = await import('@/lib/cms/mongo-repository');
    return mongoListResearchAreas(query);
  }
  const { fsListResearchAreas } = await import('@/lib/cms/fs-repository');
  return fsListResearchAreas(query);
}

export async function serverGetById<K extends ContentCollectionKey>(
  collection: K,
  id: string,
): Promise<CollectionEntityMap[K] | undefined> {
  if (getCmsDriver() === 'mongo') {
    const { mongoGetById } = await import('@/lib/cms/mongo-repository');
    return mongoGetById(collection, id);
  }
  const { fsGetById } = await import('@/lib/cms/fs-repository');
  return fsGetById(collection, id);
}

export async function serverGetBySlug<K extends ContentCollectionKey>(
  collection: K,
  slug: string,
): Promise<CollectionEntityMap[K] | undefined> {
  if (getCmsDriver() === 'mongo') {
    const { mongoGetBySlug } = await import('@/lib/cms/mongo-repository');
    return mongoGetBySlug(collection, slug);
  }
  const { fsGetBySlug } = await import('@/lib/cms/fs-repository');
  return fsGetBySlug(collection, slug);
}

export async function serverCreate<K extends ContentCollectionKey>(
  collection: K,
  input: Omit<CollectionEntityMap[K], 'id' | 'createdAt' | 'updatedAt'> &
    Partial<Pick<CollectionEntityMap[K], 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<CollectionEntityMap[K]> {
  const { prepareRecordImages, findMediaByUrl } = await import(
    '@/lib/media/image-store'
  );
  const prepared = await prepareRecordImages(
    collection,
    input as Record<string, unknown>,
  );
  if (collection === 'media') {
    const url =
      typeof prepared.url === 'string' ? prepared.url.trim() : '';
    if (url) {
      const existing = await findMediaByUrl(url);
      if (existing) return existing as CollectionEntityMap[K];
    }
  }
  if (getCmsDriver() === 'mongo') {
    const { mongoCreate } = await import('@/lib/cms/mongo-repository');
    return mongoCreate(collection, prepared as typeof input);
  }
  const { fsCreate } = await import('@/lib/cms/fs-repository');
  return fsCreate(collection, prepared as typeof input);
}

export async function serverUpdate<K extends ContentCollectionKey>(
  collection: K,
  id: string,
  patch: Partial<CollectionEntityMap[K]>,
): Promise<CollectionEntityMap[K] | undefined> {
  const existing = await serverGetById(collection, id);
  const { prepareRecordImages, afterRecordImagesChanged } = await import(
    '@/lib/media/image-store'
  );
  const prepared = await prepareRecordImages(
    collection,
    patch as Record<string, unknown>,
  );
  const updated =
    getCmsDriver() === 'mongo'
      ? await (
          await import('@/lib/cms/mongo-repository')
        ).mongoUpdate(collection, id, prepared as typeof patch)
      : await (
          await import('@/lib/cms/fs-repository')
        ).fsUpdate(collection, id, prepared as typeof patch);
  if (existing && updated) {
    await afterRecordImagesChanged(collection, existing, updated);
  }
  return updated;
}

export async function serverRemove<K extends ContentCollectionKey>(
  collection: K,
  id: string,
): Promise<boolean> {
  const existing = await serverGetById(collection, id);
  const removed =
    getCmsDriver() === 'mongo'
      ? await (
          await import('@/lib/cms/mongo-repository')
        ).mongoRemove(collection, id)
      : await (
          await import('@/lib/cms/fs-repository')
        ).fsRemove(collection, id);
  if (removed && existing) {
    const { afterRecordRemoved } = await import('@/lib/media/image-store');
    await afterRecordRemoved(collection, existing);
  }
  return removed;
}

export async function serverRemoveMany<K extends ContentCollectionKey>(
  collection: K,
  ids: string[],
): Promise<number> {
  const existing: object[] = [];
  for (const item of await Promise.all(ids.map((id) => serverGetById(collection, id)))) {
    if (item) existing.push(item);
  }
  const removed =
    getCmsDriver() === 'mongo'
      ? await (
          await import('@/lib/cms/mongo-repository')
        ).mongoRemoveMany(collection, ids)
      : await (
          await import('@/lib/cms/fs-repository')
        ).fsRemoveMany(collection, ids);
  if (removed > 0) {
    const { afterRecordRemoved } = await import('@/lib/media/image-store');
    for (const item of existing) {
      await afterRecordRemoved(collection, item);
    }
  }
  return removed;
}

export async function serverDuplicate<K extends ContentCollectionKey>(
  collection: K,
  id: string,
): Promise<CollectionEntityMap[K] | undefined> {
  if (getCmsDriver() === 'mongo') {
    const { mongoDuplicate } = await import('@/lib/cms/mongo-repository');
    return mongoDuplicate(collection, id);
  }
  const { fsDuplicate } = await import('@/lib/cms/fs-repository');
  return fsDuplicate(collection, id);
}

export async function serverUpdateSiteSettings(
  patch: Partial<SiteSettings>,
): Promise<SiteSettings> {
  if (getCmsDriver() === 'mongo') {
    const { mongoUpdateSiteSettings } = await import('@/lib/cms/mongo-repository');
    return mongoUpdateSiteSettings(patch);
  }
  const { fsUpdateSiteSettings } = await import('@/lib/cms/fs-repository');
  return fsUpdateSiteSettings(patch);
}

export async function serverUpdateHomepage(
  patch: Partial<HomepageConfig>,
): Promise<HomepageConfig> {
  if (getCmsDriver() === 'mongo') {
    const { mongoUpdateHomepage } = await import('@/lib/cms/mongo-repository');
    return mongoUpdateHomepage(patch);
  }
  const { fsUpdateHomepage } = await import('@/lib/cms/fs-repository');
  return fsUpdateHomepage(patch);
}

export async function serverUpdateNavigation(
  patch: Partial<ContentDatabase['navigation']>,
): Promise<ContentDatabase['navigation']> {
  if (getCmsDriver() === 'mongo') {
    const { mongoUpdateNavigation } = await import('@/lib/cms/mongo-repository');
    return mongoUpdateNavigation(patch);
  }
  const { fsUpdateNavigation } = await import('@/lib/cms/fs-repository');
  return fsUpdateNavigation(patch);
}

export async function serverReplaceNavigationList(
  key: keyof ContentDatabase['navigation'],
  items: NavigationItem[],
): Promise<ContentDatabase['navigation']> {
  if (getCmsDriver() === 'mongo') {
    const { mongoReplaceNavigationList } = await import(
      '@/lib/cms/mongo-repository'
    );
    return mongoReplaceNavigationList(key, items);
  }
  const { fsReplaceNavigationList } = await import('@/lib/cms/fs-repository');
  return fsReplaceNavigationList(key, items);
}

export async function serverSeedFromCompiled(
  options: { wipe?: boolean } = {},
): Promise<{ collections: number; documents: number }> {
  if (getCmsDriver() === 'mongo') {
    const { mongoSeedFromCompiled } = await import('@/lib/cms/mongo-repository');
    return mongoSeedFromCompiled(options);
  }
  const { fsSeedFromCompiled } = await import('@/lib/cms/fs-repository');
  return fsSeedFromCompiled(options);
}

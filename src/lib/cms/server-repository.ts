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
  if (getCmsDriver() === 'mongo') {
    const { mongoCreate } = await import('@/lib/cms/mongo-repository');
    return mongoCreate(collection, input);
  }
  const { fsCreate } = await import('@/lib/cms/fs-repository');
  return fsCreate(collection, input);
}

export async function serverUpdate<K extends ContentCollectionKey>(
  collection: K,
  id: string,
  patch: Partial<CollectionEntityMap[K]>,
): Promise<CollectionEntityMap[K] | undefined> {
  if (getCmsDriver() === 'mongo') {
    const { mongoUpdate } = await import('@/lib/cms/mongo-repository');
    return mongoUpdate(collection, id, patch);
  }
  const { fsUpdate } = await import('@/lib/cms/fs-repository');
  return fsUpdate(collection, id, patch);
}

export async function serverRemove<K extends ContentCollectionKey>(
  collection: K,
  id: string,
): Promise<boolean> {
  if (getCmsDriver() === 'mongo') {
    const { mongoRemove } = await import('@/lib/cms/mongo-repository');
    return mongoRemove(collection, id);
  }
  const { fsRemove } = await import('@/lib/cms/fs-repository');
  return fsRemove(collection, id);
}

export async function serverRemoveMany<K extends ContentCollectionKey>(
  collection: K,
  ids: string[],
): Promise<number> {
  if (getCmsDriver() === 'mongo') {
    const { mongoRemoveMany } = await import('@/lib/cms/mongo-repository');
    return mongoRemoveMany(collection, ids);
  }
  const { fsRemoveMany } = await import('@/lib/cms/fs-repository');
  return fsRemoveMany(collection, ids);
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

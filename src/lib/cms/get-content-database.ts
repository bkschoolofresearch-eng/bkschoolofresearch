import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { CMS_CACHE_TAGS } from '@/lib/db/collections';
import { getCmsDriver } from '@/lib/cms/server-repository';
import { isProductionBuild } from '@/lib/cms/build-phase';
import type { ContentDatabase } from '@/types/content';

/**
 * Request-deduped + tag-cached content database for Server Components.
 * Uses local `.data/cms-database.json` (fs) or MongoDB depending on CMS_DRIVER.
 * During `next build`, returns the seed so Mongo is never opened on the builder.
 */
export const getContentDatabase = cache(async (): Promise<ContentDatabase> => {
  if (isProductionBuild()) {
    const { seedDatabase } = await import('@/content/seed');
    return seedDatabase;
  }

  const driver = getCmsDriver();

  return unstable_cache(
    async () => {
      const { serverGetFullDatabase } = await import(
        '@/lib/cms/server-repository'
      );
      return serverGetFullDatabase();
    },
    ['bksr-cms-database', driver],
    {
      tags: [CMS_CACHE_TAGS.all],
      revalidate: 30,
    },
  )();
});

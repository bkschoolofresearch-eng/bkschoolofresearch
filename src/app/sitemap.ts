import type { MetadataRoute } from 'next';
import { getContentDatabase } from '@/lib/cms/get-content-database';
import { sitemapPublicPath } from '@/lib/seo/public-path';
import { getSiteUrl } from '@/lib/seo/site-url';

const STATIC_PATHS = [
  '/',
  '/about',
  '/about/who-we-are',
  '/about/what-we-do',
  '/about/governance',
  '/about/policies',
  '/people',
  '/people/executive-director',
  '/people/distinguished-fellows',
  '/people/research-team',
  '/people/administrative-team',
  '/people/career',
  '/research',
  '/research/ongoing',
  '/research/previous',
  '/research/areas',
  '/research/grants',
  '/publications',
  '/publications/journals',
  '/publications/opinions',
  '/publications/policy-briefs',
  '/publications/working-papers',
  '/publications/annual-reports',
  '/publications/newsletters',
  '/activities',
  '/activities/capacity-building',
  '/activities/awareness-campaigns',
  '/activities/research-talks',
  '/news-events',
  '/news',
  '/events',
  '/notices',
  '/resources',
  '/media',
  '/gallery',
  '/contact',
  '/join',
  '/search',
  '/privacy',
] as const;

function isPublished(item: { status?: string; noIndex?: boolean }): boolean {
  return item.status === 'published' && item.noIndex !== true;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${origin}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));

  try {
    const db = await getContentDatabase();

    const pushSlug = (
      items: Array<{
        slug?: string;
        status?: string;
        updatedAt?: string;
        seo?: { noIndex?: boolean; canonicalPath?: string };
      }>,
      prefix: string,
    ) => {
      for (const item of items) {
        if (!isPublished({ status: item.status, noIndex: item.seo?.noIndex })) {
          continue;
        }
        const raw =
          item.seo?.canonicalPath ||
          (item.slug ? `${prefix}/${item.slug}` : null);
        if (!raw) continue;
        const path = sitemapPublicPath(raw, origin);
        if (!path) continue;
        entries.push({
          url: `${origin}${path === '/' ? '' : path}`,
          lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    };

    pushSlug(db.people, '/people');
    pushSlug(db.publications, '/publications');
    pushSlug(db.news, '/news');
    pushSlug(db.events, '/events');
    pushSlug(db.notices, '/notices');
    pushSlug(db.resources, '/resources');
    pushSlug(
      db.pages.filter(
        (page) =>
          page.slug !== 'who-we-are' &&
          page.slug !== 'what-we-do' &&
          page.slug !== 'governance' &&
          page.slug !== 'policies',
      ),
      '',
    );
    pushSlug(db.researchAreas, '/research/areas');
    for (const form of db.registrationForms ?? []) {
      if (form.status !== 'published' || form.entityType === 'join') continue;
      const path = sitemapPublicPath(`/forms/${form.slug}`, origin);
      if (!path) continue;
      entries.push({
        url: `${origin}${path}`,
        lastModified: form.updatedAt ? new Date(form.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
    // Research projects intentionally omit internal detail URLs — they open
    // external journal/DOI destinations from listing cards.
  } catch {
    // Sitemap still returns static hubs if CMS read fails.
  }

  return entries;
}

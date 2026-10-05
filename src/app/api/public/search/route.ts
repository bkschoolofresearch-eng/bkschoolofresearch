import { jsonError, jsonOk } from '@/lib/cms/api-guard';
import { searchContent, type SearchCategory } from '@/lib/cms/search';
import { getContentDatabase } from '@/lib/cms/get-content-database';
import type { ContentDatabase, ContentStatus } from '@/types/content';

const CATEGORIES = new Set<SearchCategory>([
  'all',
  'publications',
  'research',
  'people',
  'news',
  'events',
  'notices',
  'resources',
  'media',
]);

function published<T extends { status: ContentStatus }>(items: T[]): T[] {
  return items.filter((item) => item.status === 'published');
}

function publishedDatabase(db: ContentDatabase): ContentDatabase {
  return {
    ...db,
    publications: published(db.publications),
    researchProjects: published(db.researchProjects),
    researchAreas: published(db.researchAreas),
    people: published(db.people),
    news: published(db.news),
    events: published(db.events),
    notices: published(db.notices),
    resources: published(db.resources),
    mediaClippings: published(db.mediaClippings ?? []),
  };
}

function clip(text: string, max = 140) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, '').trim()}…`;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = (params.get('q') ?? '').trim();
  if (q.length > 80) return jsonError('Search is too long');
  if (!q) return jsonOk({ items: [] });

  const categoryRaw = params.get('category') ?? 'all';
  const category = CATEGORIES.has(categoryRaw as SearchCategory)
    ? (categoryRaw as SearchCategory)
    : 'all';

  const limitRaw = Number(params.get('limit') ?? 8);
  const limit = Number.isInteger(limitRaw)
    ? Math.min(20, Math.max(1, limitRaw))
    : 8;

  const db = publishedDatabase(await getContentDatabase());
  const needle = q.toLowerCase();
  const items = searchContent(q, category, { database: db })
    .sort((a, b) => {
      const rank = (title: string) => {
        const value = title.toLowerCase();
        if (value.startsWith(needle)) return 0;
        if (value.includes(needle)) return 1;
        return 2;
      };
      return rank(a.title) - rank(b.title);
    })
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      category: item.category,
      title: item.title,
      href: item.href,
      excerpt: clip(item.excerpt),
    }));

  return jsonOk({ items });
}

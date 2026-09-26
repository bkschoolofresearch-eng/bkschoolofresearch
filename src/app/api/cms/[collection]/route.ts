import { assertCmsAdmin, jsonError, jsonOk } from '@/lib/cms/api-guard';
import { parseCollectionKey } from '@/lib/cms/collection-param';
import {
  parseCollectionListQuery,
  supportsPublicationListQuery,
  supportsResearchListQuery,
} from '@/lib/cms/paginated-list';
import {
  CMS_ADMIN_ONLY_COLLECTIONS,
  isPublishedCmsItem,
} from '@/lib/cms/public-read';

type RouteContext = { params: Promise<{ collection: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { collection: raw } = await context.params;
  const collection = parseCollectionKey(raw);
  if (!collection) return jsonError(`Unknown collection: ${raw}`, 404);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const slug = url.searchParams.get('slug');
  const publishedOnly = url.searchParams.get('published') === '1';
  const wantsPage =
    url.searchParams.has('page') ||
    url.searchParams.has('limit') ||
    url.searchParams.has('pageSize') ||
    url.searchParams.has('q') ||
    url.searchParams.has('researchStatus') ||
    url.searchParams.has('type') ||
    url.searchParams.has('yearFrom') ||
    url.searchParams.has('yearTo') ||
    url.searchParams.has('areaId') ||
    url.searchParams.has('featured') ||
    url.searchParams.has('hasLink') ||
    url.searchParams.has('sort') ||
    url.searchParams.has('facets');

  const adminOnly = CMS_ADMIN_ONLY_COLLECTIONS.has(collection);
  if (adminOnly || !publishedOnly) {
    const denied = await assertCmsAdmin(request);
    if (denied) return denied;
  }

  try {
    const {
      serverGetById,
      serverGetBySlug,
      serverGetAll,
      serverListResearchProjects,
      serverListPublications,
    } = await import('@/lib/cms/server-repository');

    if (id) {
      const item = await serverGetById(collection, id);
      if (!item) return jsonError('Not found', 404);
      if (publishedOnly && !isPublishedCmsItem(item)) {
        return jsonError('Not found', 404);
      }
      return jsonOk({ item });
    }

    if (slug) {
      const item = await serverGetBySlug(collection, slug);
      if (!item) return jsonError('Not found', 404);
      if (publishedOnly && !isPublishedCmsItem(item)) {
        return jsonError('Not found', 404);
      }
      return jsonOk({ item });
    }

    if (wantsPage) {
      if (supportsResearchListQuery(collection)) {
        const query = parseCollectionListQuery(url.searchParams);
        if (publishedOnly) query.status = 'published';
        const result = await serverListResearchProjects(query);
        return jsonOk(result);
      }

      if (supportsPublicationListQuery(collection)) {
        const query = parseCollectionListQuery(url.searchParams);
        if (publishedOnly) query.status = 'published';
        if (!query.sort || query.sort === 'category') query.sort = 'type';
        const result = await serverListPublications(query);
        return jsonOk(result);
      }

      let items = await serverGetAll(collection);
      const statusFilter = publishedOnly
        ? 'published'
        : url.searchParams.get('status')?.trim() || undefined;
      if (statusFilter) {
        items = items.filter(
          (item) => (item as { status?: string }).status === statusFilter,
        );
      }
      const q = url.searchParams.get('q')?.trim().toLowerCase();
      if (q) {
        items = items.filter((item) =>
          JSON.stringify(item).toLowerCase().includes(q),
        );
      }
      const listQuery = parseCollectionListQuery(url.searchParams);
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / listQuery.pageSize) || 1);
      const page = Math.min(listQuery.page, totalPages);
      const start = (page - 1) * listQuery.pageSize;
      return jsonOk({
        items: items.slice(start, start + listQuery.pageSize),
        total,
        page,
        pageSize: listQuery.pageSize,
      });
    }

    let items = await serverGetAll(collection);
    if (publishedOnly) {
      items = items.filter((item) => isPublishedCmsItem(item));
    }
    return jsonOk({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Query failed';
    return jsonError(message, 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const denied = await assertCmsAdmin(request);
  if (denied) return denied;

  const { collection: raw } = await context.params;
  const collection = parseCollectionKey(raw);
  if (!collection) return jsonError(`Unknown collection: ${raw}`, 404);

  try {
    const body = await request.json();
    const { serverCreate } = await import('@/lib/cms/server-repository');
    const item = await serverCreate(collection, body);
    return jsonOk({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create failed';
    return jsonError(message, 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const denied = await assertCmsAdmin(request);
  if (denied) return denied;

  const { collection: raw } = await context.params;
  const collection = parseCollectionKey(raw);
  if (!collection) return jsonError(`Unknown collection: ${raw}`, 404);

  try {
    const body = (await request.json()) as {
      ids?: string[];
      matchAll?: boolean;
    };
    const { serverRemoveMany, serverListResearchProjects, serverListPublications, serverGetAll } =
      await import('@/lib/cms/server-repository');
    const {
      parseCollectionListQuery,
      supportsResearchListQuery,
      supportsPublicationListQuery,
    } =
      await import('@/lib/cms/paginated-list');

    let ids = Array.isArray(body.ids)
      ? body.ids.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : [];

    if (body.matchAll) {
      const url = new URL(request.url);
      if (supportsResearchListQuery(collection)) {
        const query = parseCollectionListQuery(url.searchParams);
        query.page = 1;
        query.pageSize = 10_000;
        query.facets = false;
        const result = await serverListResearchProjects(query);
        ids = result.items.map((item) => item.id);
      } else if (supportsPublicationListQuery(collection)) {
        const query = parseCollectionListQuery(url.searchParams);
        query.page = 1;
        query.pageSize = 10_000;
        query.facets = false;
        if (!query.sort || query.sort === 'category') query.sort = 'type';
        const result = await serverListPublications(query);
        ids = result.items.map((item) => item.id);
      } else {
        let items = await serverGetAll(collection);
        const status = url.searchParams.get('status')?.trim();
        const q = url.searchParams.get('q')?.trim().toLowerCase();
        if (status) {
          items = items.filter(
            (item) =>
              !('status' in item) ||
              (item as { status: string }).status === status,
          );
        }
        if (q) {
          items = items.filter((item) =>
            JSON.stringify(item).toLowerCase().includes(q),
          );
        }
        ids = items.map((item) => item.id);
      }
    }

    if (ids.length === 0) {
      return jsonError('No items to delete', 400);
    }
    if (ids.length > 10_000) {
      return jsonError('Too many items in one delete request', 400);
    }

    const deleted = await serverRemoveMany(collection, ids);
    return jsonOk({ deleted, ids });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return jsonError(message, 500);
  }
}

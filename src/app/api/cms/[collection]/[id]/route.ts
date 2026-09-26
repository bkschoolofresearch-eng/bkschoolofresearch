import { assertCmsAdmin, jsonError, jsonOk } from '@/lib/cms/api-guard';
import { parseCollectionKey } from '@/lib/cms/collection-param';
import { assertPublicCmsReadAllowed, isPublishedCmsItem } from '@/lib/cms/public-read';

type RouteContext = { params: Promise<{ collection: string; id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { collection: raw, id } = await context.params;
  const collection = parseCollectionKey(raw);
  if (!collection) return jsonError(`Unknown collection: ${raw}`, 404);

  const url = new URL(request.url);
  const publishedOnly = url.searchParams.get('published') === '1';

  const publicOk = assertPublicCmsReadAllowed(collection, publishedOnly);
  if (!publicOk.ok) {
    const denied = await assertCmsAdmin(request);
    if (denied) return denied;
  }

  try {
    const { serverGetById } = await import('@/lib/cms/server-repository');
    const item = await serverGetById(collection, id);
    if (!item) return jsonError('Not found', 404);
    if (publishedOnly && !isPublishedCmsItem(item)) {
      return jsonError('Not found', 404);
    }
    return jsonOk({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Query failed';
    return jsonError(message, 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await assertCmsAdmin(request);
  if (denied) return denied;

  const { collection: raw, id } = await context.params;
  const collection = parseCollectionKey(raw);
  if (!collection) return jsonError(`Unknown collection: ${raw}`, 404);

  try {
    const patch = await request.json();
    const { serverUpdate } = await import('@/lib/cms/server-repository');
    const item = await serverUpdate(collection, id, patch);
    if (!item) return jsonError('Not found', 404);
    return jsonOk({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return jsonError(message, 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const denied = await assertCmsAdmin(request);
  if (denied) return denied;

  const { collection: raw, id } = await context.params;
  const collection = parseCollectionKey(raw);
  if (!collection) return jsonError(`Unknown collection: ${raw}`, 404);

  try {
    const { serverRemove } = await import('@/lib/cms/server-repository');
    const ok = await serverRemove(collection, id);
    if (!ok) return jsonError('Not found', 404);
    return jsonOk({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return jsonError(message, 500);
  }
}

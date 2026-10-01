import { jsonError, jsonOk } from '@/lib/cms/api-guard';
import { getPersonResearchPage } from '@/lib/content/queries';

const PERSON_ID = /^[a-zA-Z0-9_-]{1,80}$/;

export async function GET(
  request: Request,
  context: { params: Promise<{ personId: string }> },
) {
  const { personId } = await context.params;
  if (!PERSON_ID.test(personId)) {
    return jsonError('Unknown person', 404);
  }

  const offsetRaw = new URL(request.url).searchParams.get('offset');
  const offset = offsetRaw ? Number(offsetRaw) : 0;
  if (!Number.isInteger(offset) || offset < 0 || offset > 500) {
    return jsonError('Invalid offset');
  }

  const page = await getPersonResearchPage(personId, offset);
  return jsonOk({
    items: page.items.map((item) => ({
      linkId: item.linkId,
      role: item.role,
      title: item.title,
      href: item.href,
      summary: item.summary ?? null,
    })),
    total: page.total,
    offset: page.offset,
    limit: page.limit,
  });
}

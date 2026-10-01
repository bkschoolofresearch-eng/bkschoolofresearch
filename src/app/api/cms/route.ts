import { assertCmsAdmin, jsonError, jsonOk } from '@/lib/cms/api-guard';
import { getCmsDriver } from '@/lib/cms/server-repository';

/** GET full CMS snapshot for admin (includes drafts) */
export async function GET(request: Request) {
  const denied = await assertCmsAdmin(request);
  if (denied) return denied;

  try {
    const { serverGetFullDatabase } = await import('@/lib/cms/server-repository');
    const database = await serverGetFullDatabase();
    return jsonOk({ database, source: getCmsDriver() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load CMS';
    console.error('[CMS API] GET /api/cms failed:', message, error instanceof Error ? error.stack : '');
    return jsonError(message, 500);
  }
}

import { assertCmsAdmin, jsonError, jsonOk } from '@/lib/cms/api-guard';
import { getCmsDriver } from '@/lib/cms/server-repository';

export async function GET(request: Request) {
  const denied = await assertCmsAdmin(request);
  if (denied) return denied;

  try {
    const { serverGetFullDatabase } = await import('@/lib/cms/server-repository');
    const database = await serverGetFullDatabase();
    return jsonOk({
      navigation: database.navigation,
      source: getCmsDriver(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return jsonError(message, 500);
  }
}

export async function PATCH(request: Request) {
  const denied = await assertCmsAdmin(request);
  if (denied) return denied;

  try {
    const patch = await request.json();
    const { serverUpdateNavigation } = await import(
      '@/lib/cms/server-repository'
    );
    const navigation = await serverUpdateNavigation(patch);
    return jsonOk({ navigation });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return jsonError(message, 500);
  }
}

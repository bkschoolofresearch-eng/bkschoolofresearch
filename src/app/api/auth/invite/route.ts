import { assertCmsAdmin, jsonError, jsonOk } from '@/lib/cms/api-guard';
import { adminInvitePerson, sendPersonInvite } from '@/lib/auth/server-ops';
import type { PersonCategory } from '@/types/content';

export async function POST(request: Request) {
  const denied = await assertCmsAdmin(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as {
    personId?: string;
    name?: string;
    email?: string;
    role?: string;
    category?: PersonCategory;
    sectionSlug?: string | null;
    sendInvite?: boolean;
  };

  if (body.personId && !body.name) {
    const result = await sendPersonInvite(body.personId);
    if (!result.ok) return jsonError(result.error, 400);
    return jsonOk(result);
  }

  const result = await adminInvitePerson({
    name: body.name ?? '',
    email: body.email ?? '',
    role: body.role ?? '',
    category: body.category ?? 'research-team',
    sectionSlug: body.sectionSlug ?? null,
    sendInvite: body.sendInvite !== false,
  });

  if (!result.ok) return jsonError(result.error, 400);
  return jsonOk(result);
}

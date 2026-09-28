import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  apiSecretMatches,
  cmsAdminSecurityReady,
  isCmsOpenWithoutLogin,
  sessionCookieMatches,
} from '@/lib/cms/admin-auth';

export const CMS_ADMIN_COOKIE = 'bksr_cms_admin';

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Admin mutations / private reads:
 * - Production fails closed without CMS_ADMIN_EMAIL + PASSWORD (+ secret material)
 * - Requires env login → signed session cookie
 * - Or header `x-cms-admin-secret` (CMS_ADMIN_SECRET or CMS_ADMIN_PASSWORD)
 * - Local file CMS: open in development when no admin credentials are set
 */
export async function assertCmsAdmin(
  request: Request,
): Promise<NextResponse | null> {
  if (isCmsOpenWithoutLogin()) {
    return null;
  }

  if (!cmsAdminSecurityReady()) {
    return jsonError(
      'CMS admin security is not configured for this environment',
      503,
    );
  }

  const header = request.headers.get('x-cms-admin-secret') ?? '';
  if (header && apiSecretMatches(header)) return null;

  try {
    const jar = await cookies();
    const cookie = jar.get(CMS_ADMIN_COOKIE)?.value ?? '';
    if (cookie && sessionCookieMatches(cookie)) return null;
  } catch {
    /* cookies() unavailable outside request context */
  }

  return jsonError('Unauthorized', 401);
}

export function isApiCmsEnabled(): boolean {
  return true;
}

export function requireCmsDriver(): NextResponse | null {
  return null;
}

/** @deprecated use requireCmsDriver */
export function requireMongoDriver(): NextResponse | null {
  return requireCmsDriver();
}

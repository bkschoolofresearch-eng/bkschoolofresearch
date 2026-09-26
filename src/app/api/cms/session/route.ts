import { cookies } from 'next/headers';
import {
  CMS_ADMIN_COOKIE,
  jsonError,
  jsonOk,
} from '@/lib/cms/api-guard';
import {
  credentialsMatch,
  getCmsSessionToken,
  hasCmsAdminLogin,
  isCmsOpenWithoutLogin,
  sessionCookieMatches,
} from '@/lib/cms/admin-auth';
import {
  CMS_OTP_COOKIE,
  CMS_OTP_TTL_MS,
  issueCmsAdminOtp,
} from '@/lib/cms/admin-otp';
import { getCmsDriver } from '@/lib/cms/server-repository';

const SESSION_MAX_AGE = 60 * 60 * 12;

export async function POST(request: Request) {
  const driver = getCmsDriver();

  if (isCmsOpenWithoutLogin()) {
    return jsonOk({ ok: true, open: true, step: 'done' as const });
  }

  if (!hasCmsAdminLogin()) {
    return jsonError(
      'CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD are not configured',
      503,
    );
  }

  const token = getCmsSessionToken();
  if (!token) {
    return jsonError('CMS admin session token is not configured', 503);
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (
    !body.email ||
    !body.password ||
    !credentialsMatch(body.email, body.password)
  ) {
    return jsonError('Invalid email or password', 401);
  }

  const issued = await issueCmsAdminOtp();
  if (!issued.ok) {
    return jsonError(issued.error, 503);
  }

  const jar = await cookies();
  jar.delete(CMS_ADMIN_COOKIE);
  jar.set(CMS_OTP_COOKIE, issued.cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(CMS_OTP_TTL_MS / 1000),
  });

  return jsonOk({
    ok: true,
    step: 'otp' as const,
    driver,
    maskedEmail: issued.maskedEmail,
    mailSent: issued.mailSent,
    ...(issued.devOtp ? { devOtp: issued.devOtp } : {}),
    ...(issued.mailError ? { mailError: issued.mailError } : {}),
  });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(CMS_ADMIN_COOKIE);
  jar.delete(CMS_OTP_COOKIE);
  return jsonOk({ ok: true });
}

export async function GET() {
  const driver = getCmsDriver();

  if (isCmsOpenWithoutLogin()) {
    return jsonOk({
      authenticated: true,
      apiEnabled: true,
      driver,
      open: true,
    });
  }

  const jar = await cookies();
  const value = jar.get(CMS_ADMIN_COOKIE)?.value ?? '';
  const authenticated = sessionCookieMatches(value);
  const otpPending = Boolean(jar.get(CMS_OTP_COOKIE)?.value) && !authenticated;

  return jsonOk({
    authenticated,
    apiEnabled: true,
    driver,
    loginRequired: hasCmsAdminLogin(),
    otpPending,
  });
}

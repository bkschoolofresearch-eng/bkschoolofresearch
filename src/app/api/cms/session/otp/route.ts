import { cookies } from 'next/headers';
import {
  CMS_ADMIN_COOKIE,
  jsonError,
  jsonOk,
} from '@/lib/cms/api-guard';
import {
  getCmsSessionToken,
  hasCmsAdminLogin,
  isCmsOpenWithoutLogin,
} from '@/lib/cms/admin-auth';
import {
  cmsAdminSessionMaxAgeSec,
  issueCmsAdminSessionCookie,
} from '@/lib/cms/admin-session';
import {
  CMS_OTP_COOKIE,
  CMS_OTP_TTL_MS,
  resendCmsAdminOtp,
  verifyCmsAdminOtp,
} from '@/lib/cms/admin-otp';
import { getCmsDriver } from '@/lib/cms/server-repository';
import { allowDevOtpExposure } from '@/lib/security/runtime';

export async function POST(request: Request) {
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
    otp?: string;
    resend?: boolean;
    remember?: boolean;
  };

  const jar = await cookies();
  const challenge = jar.get(CMS_OTP_COOKIE)?.value ?? '';
  if (!challenge) {
    return jsonError('Verification expired. Sign in again.', 401);
  }

  if (body.resend) {
    const issued = await resendCmsAdminOtp(challenge);
    if (!issued.ok) {
      return jsonError(issued.error, 401);
    }
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
      maskedEmail: issued.maskedEmail,
      mailSent: issued.mailSent,
      ...(allowDevOtpExposure() && issued.devOtp
        ? { devOtp: issued.devOtp }
        : {}),
      ...(allowDevOtpExposure() && issued.mailError
        ? { mailError: issued.mailError }
        : {}),
    });
  }

  if (!body.otp?.trim()) {
    return jsonError('Enter the verification code', 400);
  }

  const result = verifyCmsAdminOtp(challenge, body.otp);
  if (!result.ok) {
    if (result.cookieValue) {
      jar.set(CMS_OTP_COOKIE, result.cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: Math.floor(CMS_OTP_TTL_MS / 1000),
      });
    }
    return jsonError(result.error, 401);
  }

  const remember = body.remember === true;
  const sessionCookie = issueCmsAdminSessionCookie(remember);
  if (!sessionCookie) {
    return jsonError('CMS admin session token is not configured', 503);
  }

  jar.delete(CMS_OTP_COOKIE);
  jar.set(CMS_ADMIN_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: cmsAdminSessionMaxAgeSec(remember),
  });

  return jsonOk({
    ok: true,
    step: 'done' as const,
    driver: getCmsDriver(),
  });
}

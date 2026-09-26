import { createHash, timingSafeEqual } from 'crypto';
import { getCmsDriver } from '@/lib/cms/server-repository';
import { verifyCmsAdminSessionCookie } from '@/lib/cms/admin-session';
import { isProductionRuntime } from '@/lib/security/runtime';

/** Cookie / API token signing material after a successful admin login. */
export function getCmsSessionToken(): string | null {
  const secret = process.env.CMS_ADMIN_SECRET?.trim();
  if (secret) return secret;
  const password = process.env.CMS_ADMIN_PASSWORD?.trim();
  return password || null;
}

export function getCmsAdminEmail(): string | null {
  const email = process.env.CMS_ADMIN_EMAIL?.trim().toLowerCase();
  return email || null;
}

export function getCmsAdminPassword(): string | null {
  const password = process.env.CMS_ADMIN_PASSWORD?.trim();
  return password || null;
}

/** True when email + password env credentials are configured. */
export function hasCmsAdminLogin(): boolean {
  return Boolean(getCmsAdminEmail() && getCmsAdminPassword());
}

/**
 * Local file CMS stays open only in non-production when no admin credentials
 * are set. Production always fails closed.
 */
export function isCmsOpenWithoutLogin(): boolean {
  if (isProductionRuntime()) return false;
  return getCmsDriver() === 'fs' && !hasCmsAdminLogin() && !getCmsSessionToken();
}

/** Production (and mongo) must have admin login configured. */
export function cmsAdminSecurityReady(): boolean {
  if (isCmsOpenWithoutLogin()) return true;
  return hasCmsAdminLogin() && Boolean(getCmsSessionToken());
}

function hashEqual(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export function credentialsMatch(email: string, password: string): boolean {
  const expectedEmail = getCmsAdminEmail();
  const expectedPassword = getCmsAdminPassword();
  if (!expectedEmail || !expectedPassword) return false;
  const providedEmail = email.trim().toLowerCase();
  return (
    hashEqual(providedEmail, expectedEmail) &&
    hashEqual(password, expectedPassword)
  );
}

/** Header `x-cms-admin-secret` accepts long-lived secret or admin password (scripts). */
export function apiSecretMatches(provided: string): boolean {
  if (!provided) return false;
  const token = getCmsSessionToken();
  const password = getCmsAdminPassword();
  if (token && hashEqual(provided, token)) return true;
  if (password && hashEqual(provided, password)) return true;
  return false;
}

/** Browser session cookie: HMAC-signed, time-bounded (not the raw secret). */
export function sessionCookieMatches(cookieValue: string): boolean {
  return verifyCmsAdminSessionCookie(cookieValue);
}

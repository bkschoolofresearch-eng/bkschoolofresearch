import { createHash, timingSafeEqual } from 'crypto';
import { getCmsDriver } from '@/lib/cms/server-repository';

/** Cookie / API token value after a successful admin login. */
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
 * Local file CMS stays open only when no admin login credentials are set.
 * Mongo always requires configured login (or legacy session token).
 */
export function isCmsOpenWithoutLogin(): boolean {
  return getCmsDriver() === 'fs' && !hasCmsAdminLogin() && !getCmsSessionToken();
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

/** Header `x-cms-admin-secret` accepts session token or admin password. */
export function apiSecretMatches(provided: string): boolean {
  if (!provided) return false;
  const token = getCmsSessionToken();
  const password = getCmsAdminPassword();
  if (token && hashEqual(provided, token)) return true;
  if (password && hashEqual(provided, password)) return true;
  return false;
}

export function sessionCookieMatches(cookieValue: string): boolean {
  const token = getCmsSessionToken();
  if (!token || !cookieValue) return false;
  return hashEqual(cookieValue, token);
}

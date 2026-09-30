import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const SESSION_TTL_MS = 60 * 60 * 12 * 1000;
const REMEMBER_TTL_MS = 60 * 60 * 24 * 30 * 1000;

function sessionTtlMs(remember: boolean) {
  return remember ? REMEMBER_TTL_MS : SESSION_TTL_MS;
}

type SessionPayload = {
  p: 'cms-admin';
  exp: number;
  n: string;
};

function resolveSigningKey(): string | null {
  const secret = process.env.CMS_ADMIN_SECRET?.trim();
  if (secret) return secret;
  const password = process.env.CMS_ADMIN_PASSWORD?.trim();
  return password || null;
}

function sign(body: string, key: string): string {
  return createHmac('sha256', key).update(body).digest('hex');
}

/**
 * Issue a time-bounded HMAC session cookie value.
 * Does not embed the admin password or raw long-lived secret in the cookie.
 */
export function issueCmsAdminSessionCookie(remember = false): string | null {
  const key = resolveSigningKey();
  if (!key) return null;
  const payload: SessionPayload = {
    p: 'cms-admin',
    exp: Date.now() + sessionTtlMs(remember),
    n: randomBytes(16).toString('hex'),
  };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url',
  );
  return `${body}.${sign(body, key)}`;
}

export function verifyCmsAdminSessionCookie(cookieValue: string): boolean {
  const key = resolveSigningKey();
  if (!key || !cookieValue) return false;
  const [body, sig] = cookieValue.split('.');
  if (!body || !sig) return false;
  const expected = sign(body, key);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf8'),
    ) as SessionPayload;
    if (parsed.p !== 'cms-admin') return false;
    if (typeof parsed.exp !== 'number' || parsed.exp < Date.now()) return false;
    if (typeof parsed.n !== 'string' || parsed.n.length < 8) return false;
    return true;
  } catch {
    return false;
  }
}

export function cmsAdminSessionMaxAgeSec(remember = false) {
  return Math.floor(sessionTtlMs(remember) / 1000);
}

export const CMS_ADMIN_SESSION_MAX_AGE_SEC = cmsAdminSessionMaxAgeSec(false);

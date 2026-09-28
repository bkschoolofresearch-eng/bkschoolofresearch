import type { ContentCollectionKey } from '@/types/content';

/**
 * Fields that must never appear on an unauthenticated CMS read.
 * Admin responses skip this helper and keep the stored document.
 */
const SECRET_KEYS = new Set([
  'verificationCode',
  'password',
  'passwordHash',
  'otp',
  'otpCode',
  'devOtp',
  'sessionToken',
  'session',
  'token',
  'codeHash',
  'secret',
]);

/**
 * Person.email / phone / accountId are the claim allowlist and account link,
 * not the public organisation contact (that lives on site settings).
 */
const PERSON_PRIVATE_KEYS = new Set(['email', 'phone', 'accountId']);

function redactRecord(
  collection: ContentCollectionKey,
  value: unknown,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactRecord(collection, item));
  }
  if (!value || typeof value !== 'object') return value;

  const source = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(source)) {
    if (SECRET_KEYS.has(key)) continue;
    if (collection === 'people' && PERSON_PRIVATE_KEYS.has(key)) continue;
    next[key] = redactRecord(collection, child);
  }
  return next;
}

/** Strip private fields from a public CMS JSON body. Does not mutate the input. */
export function redactPublicCmsPayload(
  collection: ContentCollectionKey,
  payload: unknown,
): unknown {
  return redactRecord(collection, payload);
}

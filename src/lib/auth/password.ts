import bcrypt from 'bcryptjs';
import { createHash, timingSafeEqual } from 'crypto';

const BCRYPT_ROUNDS = 12;
const LEGACY_MEMBER_SALT = 'bksr-demo-v1';

function legacySha256(password: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    return ba.length === bb.length && timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export function isBcryptHash(stored: string): boolean {
  return /^\$2[aby]\$/.test(stored);
}

/** Adaptive password hash for new accounts / rehashes. */
export async function hashPasswordSecure(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a stored hash. Supports bcrypt (preferred) and legacy fixed-salt SHA-256.
 * When legacy verifies, callers should rehash and persist (controlled migration).
 */
export async function verifyPasswordSecure(
  password: string,
  storedHash: string,
): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (!storedHash) return { ok: false, needsRehash: false };

  if (isBcryptHash(storedHash)) {
    const ok = await bcrypt.compare(password, storedHash);
    return { ok, needsRehash: false };
  }

  const legacy = legacySha256(password, LEGACY_MEMBER_SALT);
  if (safeEqualHex(legacy, storedHash)) {
    return { ok: true, needsRehash: true };
  }

  return { ok: false, needsRehash: false };
}

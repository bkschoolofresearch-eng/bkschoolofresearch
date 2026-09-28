import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import {
  generateOtpCode,
  hashSecret,
  secretsEqual,
} from '@/lib/auth/server-store';
import { sendOtpEmail } from '@/lib/email/send';
import {
  getCmsAdminEmail,
  getCmsSessionToken,
} from '@/lib/cms/admin-auth';
import { allowDevOtpExposure } from '@/lib/security/runtime';

export const CMS_OTP_COOKIE = 'bksr_cms_otp';
export const CMS_OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

type ChallengePayload = {
  /** hashed admin email */
  e: string;
  /** hashed otp */
  o: string;
  /** expiry ms */
  exp: number;
  /** attempts so far */
  a: number;
  /** nonce */
  n: string;
};

function signingKey(): string | null {
  return getCmsSessionToken();
}

function sign(body: string, key: string): string {
  return createHmac('sha256', key).update(body).digest('hex');
}

function encodeChallenge(payload: ChallengePayload, key: string): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url',
  );
  return `${body}.${sign(body, key)}`;
}

function decodeChallenge(
  raw: string,
  key: string,
): ChallengePayload | null {
  const [body, sig] = raw.split('.');
  if (!body || !sig) return null;
  const expected = sign(body, key);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf8'),
    ) as ChallengePayload;
    if (
      typeof parsed.e !== 'string' ||
      typeof parsed.o !== 'string' ||
      typeof parsed.exp !== 'number' ||
      typeof parsed.a !== 'number' ||
      typeof parsed.n !== 'string'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return 'admin';
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${'•'.repeat(Math.max(user.length - visible.length, 2))}@${domain}`;
}

export async function issueCmsAdminOtp(): Promise<
  | {
      ok: true;
      cookieValue: string;
      maskedEmail: string;
      mailSent: boolean;
      devOtp?: string;
      mailError?: string;
    }
  | { ok: false; error: string }
> {
  const email = getCmsAdminEmail();
  const key = signingKey();
  if (!email || !key) {
    return { ok: false, error: 'CMS admin credentials are not configured' };
  }

  const otp = generateOtpCode();
  const payload: ChallengePayload = {
    e: hashSecret(email, 'bksr-cms-email-v1'),
    o: hashSecret(otp, 'bksr-cms-otp-v1'),
    exp: Date.now() + CMS_OTP_TTL_MS,
    a: 0,
    n: randomBytes(8).toString('hex'),
  };

  const mail = await sendOtpEmail({
    to: email,
    name: 'CMS Administrator',
    otp,
  });

  return {
    ok: true,
    cookieValue: encodeChallenge(payload, key),
    maskedEmail: maskEmail(email),
    mailSent: mail.sent,
    ...(!mail.sent && allowDevOtpExposure()
      ? {
          devOtp: otp,
          ...(mail.error ? { mailError: mail.error } : {}),
        }
      : {}),
  };
}

export function verifyCmsAdminOtp(
  cookieValue: string,
  otp: string,
):
  | { ok: true }
  | { ok: false; error: string; cookieValue?: string } {
  const key = signingKey();
  const email = getCmsAdminEmail();
  if (!key || !email) {
    return { ok: false, error: 'CMS admin credentials are not configured' };
  }

  const payload = decodeChallenge(cookieValue, key);
  if (!payload) {
    return { ok: false, error: 'Verification expired. Sign in again.' };
  }
  if (payload.exp < Date.now()) {
    return { ok: false, error: 'That code expired. Request a new one.' };
  }
  if (payload.a >= MAX_OTP_ATTEMPTS) {
    return { ok: false, error: 'Too many attempts. Sign in again.' };
  }

  const emailOk = secretsEqual(
    payload.e,
    hashSecret(email, 'bksr-cms-email-v1'),
  );
  if (!emailOk) {
    return { ok: false, error: 'Verification expired. Sign in again.' };
  }

  const otpOk = secretsEqual(
    payload.o,
    hashSecret(otp.trim(), 'bksr-cms-otp-v1'),
  );
  if (!otpOk) {
    const next: ChallengePayload = { ...payload, a: payload.a + 1 };
    return {
      ok: false,
      error: 'Incorrect verification code.',
      cookieValue: encodeChallenge(next, key),
    };
  }

  return { ok: true };
}

/** Re-issue OTP using an existing valid challenge cookie (no password again). */
export async function resendCmsAdminOtp(cookieValue: string): Promise<
  | {
      ok: true;
      cookieValue: string;
      maskedEmail: string;
      mailSent: boolean;
      devOtp?: string;
      mailError?: string;
    }
  | { ok: false; error: string }
> {
  const key = signingKey();
  const email = getCmsAdminEmail();
  if (!key || !email) {
    return { ok: false, error: 'CMS admin credentials are not configured' };
  }

  const payload = decodeChallenge(cookieValue, key);
  if (!payload) {
    return { ok: false, error: 'Verification expired. Sign in again.' };
  }
  if (payload.exp < Date.now()) {
    return { ok: false, error: 'That code expired. Sign in again.' };
  }

  const emailOk = secretsEqual(
    payload.e,
    hashSecret(email, 'bksr-cms-email-v1'),
  );
  if (!emailOk) {
    return { ok: false, error: 'Verification expired. Sign in again.' };
  }

  return issueCmsAdminOtp();
}

/**
 * Canonical production origin for metadata, sitemaps, and email links.
 * Prefer NEXT_PUBLIC_SITE_URL; never invent a host.
 */
export const CANONICAL_SITE_URL = 'https://www.bkschoolofresearch.org';

function isLocalHost(value: string): boolean {
  try {
    const host = new URL(value).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(?::|\/|$)/i.test(value);
  }
}

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const production = process.env.VERCEL_ENV === 'production';

  if (fromEnv && !(production && isLocalHost(fromEnv))) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      return fromEnv.replace(/\/$/, '');
    }
  }

  if (production) {
    return CANONICAL_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }

  return 'http://localhost:3000';
}

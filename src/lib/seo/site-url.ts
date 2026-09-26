/**
 * Canonical production origin for metadata, sitemaps, and email links.
 * Prefer NEXT_PUBLIC_SITE_URL; never invent a host.
 */
export const CANONICAL_SITE_URL = 'https://www.bkschoolofresearch.org';

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      return fromEnv.replace(/\/$/, '');
    }
  }

  if (process.env.VERCEL_ENV === 'production') {
    return CANONICAL_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }

  return 'http://localhost:3000';
}

/** Paths that must not be indexed or listed in the sitemap. */
const PRIVATE_PREFIXES = [
  '/admin',
  '/api',
  '/login',
  '/register',
  '/account',
  '/verify',
  '/forgot-password',
] as const;

export function isPrivatePublicPath(path: string): boolean {
  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  return PRIVATE_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

/**
 * Keep a sitemap target only when it is a same-site public path.
 * External canonicals (journal/DOI) and auth/admin/API paths are dropped.
 */
export function sitemapPublicPath(
  pathOrUrl: string,
  origin: string,
): string | null {
  let path = pathOrUrl.trim();
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      const site = new URL(origin);
      if (url.origin !== site.origin) return null;
      path = url.pathname || '/';
    } catch {
      return null;
    }
  }

  if (!path.startsWith('/')) path = `/${path}`;
  if (path !== '/' && path.endsWith('/')) path = path.slice(0, -1);
  if (isPrivatePublicPath(path)) return null;
  if (path.includes('://') || path.startsWith('//')) return null;
  return path;
}

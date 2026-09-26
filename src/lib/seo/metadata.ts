import type { Metadata } from 'next';
import { siteSettings } from '@/content/seed/site-settings';
import { getSiteUrl } from '@/lib/seo/site-url';
import type { SEOData } from '@/types/content';

const SITE_NAME = siteSettings.organizationName;
const DEFAULT_SEO = siteSettings.defaultSeo;

export interface BuildMetadataOptions {
  path?: string;
  siteName?: string;
  defaults?: SEOData;
  absoluteUrlBase?: string;
  noIndex?: boolean;
}

function joinTitle(pageTitle: string, siteName: string): string {
  if (!pageTitle) return siteName;
  if (pageTitle.includes(siteName)) return pageTitle;
  return `${pageTitle} | ${siteName}`;
}

function toAbsoluteUrl(pathOrUrl: string, base: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`, base).toString();
}

/**
 * Build Next.js Metadata from content SEOData + site defaults.
 */
export function buildMetadata(
  seo?: Partial<SEOData> | null,
  options: BuildMetadataOptions = {},
): Metadata {
  const defaults = options.defaults ?? DEFAULT_SEO;
  const siteName = options.siteName ?? SITE_NAME;
  const absoluteUrlBase = options.absoluteUrlBase ?? getSiteUrl();

  const title = joinTitle(seo?.title || defaults.title, siteName);
  const description = seo?.description || defaults.description;
  const keywords = seo?.keywords ?? defaults.keywords;
  const ogImage = seo?.ogImage || defaults.ogImage;
  const canonicalPath =
    seo?.canonicalPath || options.path || defaults.canonicalPath;
  const noIndex =
    options.noIndex ?? seo?.noIndex ?? defaults.noIndex ?? false;

  const canonical =
    canonicalPath != null && canonicalPath !== ''
      ? toAbsoluteUrl(canonicalPath, absoluteUrlBase)
      : undefined;

  const metadata: Metadata = {
    metadataBase: new URL(absoluteUrlBase),
    title,
    description,
    keywords,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      siteName,
      type: 'website',
      url: canonical,
      ...(ogImage
        ? { images: [{ url: toAbsoluteUrl(ogImage, absoluteUrlBase) }] }
        : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage
        ? { images: [toAbsoluteUrl(ogImage, absoluteUrlBase)] }
        : {}),
    },
  };

  if (canonical) {
    metadata.alternates = { canonical };
  }

  return metadata;
}

export function buildPageMetadata(
  title: string,
  description: string,
  path?: string,
  options?: Pick<BuildMetadataOptions, 'noIndex'>,
): Metadata {
  return buildMetadata(
    { title, description, canonicalPath: path, noIndex: options?.noIndex },
    { noIndex: options?.noIndex },
  );
}

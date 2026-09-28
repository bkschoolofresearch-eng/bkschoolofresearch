import { siteSettings } from '@/content/seed/site-settings';
import { getSiteUrl } from '@/lib/seo/site-url';

/** Search engines read this for the site name, logo, and description. */
export function SiteJsonLd() {
  const origin = getSiteUrl();
  const sameAs = [
    siteSettings.social.facebook,
    siteSettings.social.linkedin,
    siteSettings.social.youtube,
  ].filter((url) => Boolean(url?.trim()));

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: siteSettings.organizationName,
        alternateName: siteSettings.organizationShortName,
        url: origin,
        description: siteSettings.defaultSeo.description,
        logo: {
          '@type': 'ImageObject',
          url: `${origin}/icon-192.png`,
          width: 192,
          height: 192,
        },
        image: `${origin}/brand/bksr-logo.png`,
        email: siteSettings.emails.general,
        telephone: siteSettings.phone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: siteSettings.address.full,
          addressLocality: siteSettings.address.city,
          postalCode: siteSettings.address.postalCode,
          addressCountry: 'BD',
        },
        sameAs,
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        name: siteSettings.organizationName,
        alternateName: siteSettings.organizationShortName,
        url: origin,
        description: siteSettings.defaultSeo.description,
        inLanguage: 'en',
        publisher: { '@id': `${origin}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

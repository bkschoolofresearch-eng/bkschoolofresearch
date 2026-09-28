import { AboutSubpageView } from '@/components/public/AboutSubpageView';
import { getAboutPage } from '@/content/about-pages';
import { buildPageMetadata } from '@/lib/seo/metadata';

const page = getAboutPage('governance');

export const metadata = buildPageMetadata(
  page.title,
  page.excerpt,
  `/about/${page.slug}`,
);

export default function GovernancePage() {
  return <AboutSubpageView page={page} slug={page.slug} />;
}

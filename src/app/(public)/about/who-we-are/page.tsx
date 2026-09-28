import { AboutSubpageView } from '@/components/public/AboutSubpageView';
import { getAboutPage } from '@/content/about-pages';
import { buildPageMetadata } from '@/lib/seo/metadata';

const page = getAboutPage('who-we-are');

export const metadata = buildPageMetadata(
  page.title,
  page.excerpt,
  `/about/${page.slug}`,
);

export default function WhoWeArePage() {
  return <AboutSubpageView page={page} slug={page.slug} />;
}

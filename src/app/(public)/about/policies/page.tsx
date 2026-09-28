import { AboutSubpageView } from '@/components/public/AboutSubpageView';
import { getAboutPage } from '@/content/about-pages';
import { buildPageMetadata } from '@/lib/seo/metadata';

const page = getAboutPage('policies');

export const metadata = buildPageMetadata(
  page.title,
  page.excerpt,
  `/about/${page.slug}`,
);

export default function PoliciesPage() {
  return <AboutSubpageView page={page} slug={page.slug} />;
}

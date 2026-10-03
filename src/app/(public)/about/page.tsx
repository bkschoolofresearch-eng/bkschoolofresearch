import { PageHero } from '@/components/layout/PageHero';
import { AboutHub } from '@/components/public/AboutHub';
import { pageHeroMedia } from '@/lib/content/page-heroes';
import { brandPhotos } from '@/lib/content/prototype-media';
import {
  getHomepageConfig,
  getPersonById,
} from '@/lib/content/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata(
  'About',
  'Advancing knowledge, shaping policy, and transforming societies — institutional overview of BK School of Research.',
  '/about',
);

const LINK_DEFS = [
  {
    href: '/about/who-we-are',
    label: 'Who We Are',
    excerpt:
      'Evidence-based knowledge, shaping policy, and lasting social impact across 26 countries.',
    imageSrc: brandPhotos.fieldResearchCommunity,
  },
  {
    href: '/about/what-we-do',
    label: 'What We Do',
    excerpt:
      'Research and publications, capacity building, policy engagement, and community impact.',
    imageSrc: brandPhotos.classroomSeminar,
  },
  {
    href: '/about/governance',
    label: 'Governance',
    excerpt:
      'Board oversight, executive leadership, standing committees, and public accountability.',
    imageSrc: brandPhotos.questConferenceGroup,
  },
  {
    href: '/about/policies',
    label: 'Our Policies',
    excerpt: 'Institutional policies will be published here.',
    imageSrc: brandPhotos.conferencePresentation,
  },
] as const;

export default async function AboutPage() {
  const homepage = await getHomepageConfig();
  const director = await getPersonById(homepage.directorPersonId);

  const links = LINK_DEFS.map((item) => ({
    href: item.href,
    label: item.label,
    excerpt: item.excerpt,
    imageSrc: item.imageSrc,
  }));

  return (
    <>
      <PageHero
        eyebrow="Institution"
        title="About BKSR"
        description="Turning evidence into policy, and policy into change."
        imageSrc={pageHeroMedia.about}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      <AboutHub
        director={director ?? null}
        links={links}
        storyImage={brandPhotos.fieldResearchRural}
      />
    </>
  );
}

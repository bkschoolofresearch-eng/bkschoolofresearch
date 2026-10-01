import type { HomepageConfig } from '@/types/content';

export const homepage: HomepageConfig = {
  id: 'homepage',
  heroEyebrow: 'BK School of Research',
  heroTitle: 'Shaping Evidence-Based Policy for a Changing Global Landscape',
  heroSubtitle: 'A Heaven for Inquisitive Minds.',
  heroImageUrl: '/media/prototype/bksr-hero-seminar.jpg',
  heroCtas: [
    { label: 'Explore Research', href: '/research', variant: 'primary' },
    { label: 'View Publications', href: '/publications', variant: 'secondary' },
  ],
  directorPersonId: 'person-bezon-kumar',
  directorMessageExcerpt: `When we established BK School of Research in 2015, we set out with a simple belief: that young researchers, given the right mentorship and opportunity, could generate knowledge capable of shaping policy and changing lives. That belief continues to guide us today.

Over the years, we have grown into a globally engaged institution bringing together research fellows, scholars, and enumerators from 26 countries, working across fields. We have completed 35 research projects, published in leading academic journals, and seen our findings inform the work of institutions such as WHO and UNICEF. However, the achievement I remain proudest of is different: the more than 15,000 young individuals who have grown through our training and mentorship programs, many of whom are now building careers and pursuing further studies around the world.

None of this would be possible without the trust of our partners, donors, and collaborators and the rigor we hold ourselves to in return. We remain committed to research that is not only sound, but also useful: research that governments can act on, institutions can build policy around, and communities can feel the benefit of.

As we look ahead, our focus stays the same nurturing young researchers, asking the questions that matter, and bridging the gap between evidence and impact. I invite you to explore our work and join us on this journey.`,
  featuredResearchProjectIds: [
    'project-remittances-rural-development-2026',
    'project-climate-women-pwd-2026',
    'project-social-network-loneliness-academic-performance',
    'project-information-literacy-undergraduates-2026',
    'project-climate-perception-university-students',
  ],
  featuredPublicationIds: [
    'pub-kumar-remittances-rural-development-2026',
    'pub-kumar-climate-women-pwd-2026',
    'pub-banik-information-literacy-undergraduates-2026',
  ],
  featuredNewsIds: [
    'news-climate-change-bangladesh',
    'news-remittance-effective-mechanism',
  ],
  featuredEventIds: [
    'event-covid-child-protection',
    'event-gender-development',
    'event-covid-youth-mental-health',
  ],
  sections: [
    { id: 'home-hero', type: 'hero', enabled: true, order: 1 },
    { id: 'home-stats', type: 'stats', title: 'BKSR in Numbers', enabled: true, order: 2 },
    {
      id: 'home-featured-research',
      type: 'featured-research',
      title: 'Our Research',
      enabled: true,
      order: 3,
    },
    {
      id: 'home-featured-publications',
      type: 'featured-publications',
      title: 'Featured publications',
      enabled: false,
      order: 4,
    },
    {
      id: 'home-director',
      type: 'director-message',
      title: 'Message from the Executive Director',
      enabled: true,
      order: 5,
    },
    {
      id: 'home-areas',
      type: 'research-areas',
      title: 'Our Focus',
      enabled: true,
      order: 6,
    },
    {
      id: 'home-activities',
      type: 'activities',
      title: 'Our Programs',
      enabled: true,
      order: 7,
    },
    { id: 'home-news', type: 'news', title: 'Opinions', enabled: true, order: 8 },
    { id: 'home-events', type: 'events', title: 'Notice and Events', enabled: true, order: 9 },
    {
      id: 'home-cta',
      type: 'cta',
      title: 'Start a Conversation',
      enabled: true,
      order: 10,
      config: { href: '/contact' },
    },
  ],
  stats: [
    {
      id: 'stat-founded',
      label: 'Founded',
      value: '2015',
      verified: true,
      note: 'Established in 2015 (About overview).',
      order: 1,
    },
    {
      id: 'stat-countries',
      label: 'Countries represented',
      value: '26',
      verified: true,
      note: 'Research fellows, scholars, and enumerators across 26 countries (About overview).',
      order: 2,
    },
    {
      id: 'stat-publications',
      label: 'Research projects',
      value: '35',
      verified: true,
      note: '35 completed research projects published in leading journals (About overview).',
      order: 3,
    },
    {
      id: 'stat-beneficiaries',
      label: 'Young people empowered',
      value: '15000+',
      verified: true,
      note: 'Training, mentorship, and innovation programs (About overview).',
      order: 4,
    },
    {
      id: 'stat-award',
      label: 'Recognition',
      value: 'Joy Bangla Youth Award 2022',
      verified: true,
      note: 'Joy Bangla Youth Award (2022) and Rising Youth Award (2023).',
      order: 5,
    },
  ],
  updatedAt: '2026-09-17T00:00:00.000Z',
};

import type { NavigationItem } from '@/types/content';

export const mainNavigation: NavigationItem[] = [
  {
    id: 'nav-about',
    label: 'About',
    href: '/about',
    order: 1,
    children: [
      {
        id: 'nav-about-who',
        label: 'Who we are',
        href: '/about/who-we-are',
        description: 'Evidence, policy, and institutional story',
        order: 1,
      },
      {
        id: 'nav-about-what',
        label: 'What we do',
        href: '/about/what-we-do',
        description: 'Research, education, and awareness work',
        order: 2,
      },
      {
        id: 'nav-about-governance',
        label: 'Governance',
        href: '/about/governance',
        order: 3,
      },
      {
        id: 'nav-about-policies',
        label: 'Our Policies',
        href: '/about/policies',
        order: 4,
      },
    ],
  },
  {
    id: 'nav-people',
    label: 'People',
    href: '/people',
    order: 2,
    children: [
      {
        id: 'nav-people-ed',
        label: 'Executive Director',
        href: '/people/executive-director',
        order: 1,
      },
      {
        id: 'nav-people-fellows',
        label: 'Distinguished Research Fellow',
        href: '/people/distinguished-research-fellow',
        order: 2,
      },
      {
        id: 'nav-people-senior',
        label: 'Senior Research Associate',
        href: '/people/senior-research-associate',
        order: 3,
      },
      {
        id: 'nav-people-associate',
        label: 'Research Associate',
        href: '/people/research-associate',
        order: 4,
      },
      {
        id: 'nav-people-assistant',
        label: 'Research Assistant',
        href: '/people/research-assistant',
        order: 5,
      },
      {
        id: 'nav-people-career',
        label: 'Vacancy at BKSR',
        href: '/people/career',
        order: 7,
      },
      {
        id: 'nav-people-join',
        label: 'Apply to join',
        href: '/join',
        description: 'Apply to the research community or organisational team',
        order: 8,
      },
    ],
  },
  {
    id: 'nav-research',
    label: 'Research',
    href: '/research',
    order: 3,
    children: [
      {
        id: 'nav-research-ongoing',
        label: 'Ongoing',
        href: '/research/ongoing',
        order: 1,
      },
      {
        id: 'nav-research-completed',
        label: 'Completed',
        href: '/research/previous',
        order: 2,
      },
    ],
  },
  {
    id: 'nav-publications',
    label: 'Publications',
    href: '/publications',
    order: 4,
    children: [
      {
        id: 'nav-pub-policy-briefs',
        label: 'Policy Briefs',
        href: '/publications/policy-briefs',
        order: 1,
      },
      {
        id: 'nav-pub-working-papers',
        label: 'Working Papers',
        href: '/publications/working-papers',
        order: 2,
      },
      {
        id: 'nav-pub-reports',
        label: 'Annual Reports',
        href: '/publications/annual-reports',
        order: 3,
      },
      {
        id: 'nav-pub-journals',
        label: 'Journals',
        href: '/publications/journals',
        order: 4,
      },
      {
        id: 'nav-pub-opinions',
        label: 'Opinions',
        href: '/publications/opinions',
        order: 5,
      },
    ],
  },
  {
    id: 'nav-activities',
    label: 'Activities',
    href: '/activities',
    order: 5,
    children: [
      {
        id: 'nav-act-capacity',
        label: 'Capacity Building',
        href: '/activities/capacity-building',
        order: 1,
      },
      {
        id: 'nav-act-policy',
        label: 'Policy & Academic Engagement',
        href: '/activities/research-talks',
        order: 2,
      },
      {
        id: 'nav-act-community',
        label: 'Community & Social Impact',
        href: '/activities/awareness-campaigns',
        order: 3,
      },
    ],
  },
  {
    id: 'nav-news-events',
    label: 'News and Events',
    href: '/news-events',
    order: 6,
    children: [
      {
        id: 'nav-notices',
        label: 'Notices',
        href: '/notices',
        order: 1,
      },
      {
        id: 'nav-events',
        label: 'Events',
        href: '/events',
        order: 2,
      },
    ],
  },
  {
    id: 'nav-contact',
    label: 'Contact',
    href: '/contact',
    order: 7,
  },
];

export const footerNavigation: NavigationItem[] = [
  {
    id: 'footer-about',
    label: 'About BKSR',
    href: '/about/who-we-are',
    order: 1,
  },
  {
    id: 'footer-research',
    label: 'Research',
    href: '/research',
    order: 2,
  },
  {
    id: 'footer-publications',
    label: 'Publications',
    href: '/publications',
    order: 3,
  },
  {
    id: 'footer-people',
    label: 'People',
    href: '/people',
    order: 4,
  },
  {
    id: 'footer-opinions',
    label: 'Opinions',
    href: '/publications/opinions',
    order: 5,
  },
  {
    id: 'footer-events',
    label: 'News and Events',
    href: '/news-events',
    order: 6,
  },
  {
    id: 'footer-knowledge',
    label: 'Knowledge Hub',
    href: '/resources',
    order: 7,
  },
  {
    id: 'footer-contact',
    label: 'Contact',
    href: '/contact',
    order: 8,
  },
];

/** Secondary knowledge-hub links (not primary nav) */
export const knowledgeHubNavigation: NavigationItem[] = [
  {
    id: 'kh-hub',
    label: 'Knowledge Hub',
    href: '/resources',
    order: 1,
    children: [
      {
        id: 'kh-stata-cs',
        label: 'Stata for Cross-Sectional Analysis',
        href: '/resources/stata-cross-sectional',
        order: 1,
      },
      {
        id: 'kh-spss-cs',
        label: 'SPSS for Cross-Sectional Analysis',
        href: '/resources/spss-cross-sectional',
        order: 2,
      },
      {
        id: 'kh-excel',
        label: 'MS Excel for Statistical Analysis',
        href: '/resources/excel-statistical-analysis',
        order: 3,
      },
      {
        id: 'kh-stata-stats',
        label: 'Stata for Statistical Analysis',
        href: '/resources/stata-statistical-analysis',
        order: 4,
      },
      {
        id: 'kh-stata-ts',
        label: 'Stata for Time Series Analysis',
        href: '/resources/stata-time-series',
        order: 5,
      },
      {
        id: 'kh-eviews',
        label: 'EViews for Time Series Analysis',
        href: '/resources/eviews-time-series',
        order: 6,
      },
      {
        id: 'kh-spss-stats',
        label: 'SPSS for Statistical Analysis',
        href: '/resources/spss-statistical-analysis',
        order: 7,
      },
      {
        id: 'kh-saptasudha',
        label: 'Saptasudha (Archive)',
        href: '/resources/saptasudha',
        order: 8,
      },
    ],
  },
];

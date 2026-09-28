/**
 * Shared labels / path helpers for public routes.
 */

import type {
  ActivityType,
  PersonCategory,
  PublicationType,
  ResearchStatus,
} from '@/types/content';

export const PERSON_CATEGORY_META: Record<
  PersonCategory,
  { label: string; href: string; description: string }
> = {
  'executive-director': {
    label: 'Executive Director',
    href: '/people/executive-director',
    description: 'Institutional leadership of BK School of Research.',
  },
  'distinguished-fellow': {
    label: 'Distinguished Fellows',
    href: '/people/distinguished-fellows',
    description: 'Profiles will appear here when published.',
  },
  'research-team': {
    label: 'Research Team',
    href: '/people/research-team',
    description: 'Research associates and assistants will be listed when available.',
  },
  'administrative-team': {
    label: 'Administrative Team',
    href: '/people/administrative-team',
    description: 'Administrative profiles will be listed when available.',
  },
  alumni: {
    label: 'Alumni',
    href: '/people',
    description: 'Alumni profiles will be listed when available.',
  },
  other: {
    label: 'People',
    href: '/people',
    description: 'Additional associates of BKSR.',
  },
};

export const ACTIVITY_ROUTE_META: {
  routeSlug: string;
  type: ActivityType;
  label: string;
}[] = [
  {
    routeSlug: 'capacity-building',
    type: 'capacity-building',
    label: 'Capacity Building',
  },
  {
    routeSlug: 'research-talks',
    type: 'research-talk',
    label: 'Policy & Academic Engagement',
  },
  {
    routeSlug: 'awareness-campaigns',
    type: 'awareness-campaign',
    label: 'Community & Social Impact',
  },
  {
    routeSlug: 'innovation-showcasing',
    type: 'innovation-showcasing',
    label: 'Innovation Showcasing',
  },
];

export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
  journal: 'Journal',
  'book-chapter': 'Book chapter',
  conference: 'Conference',
  opinion: 'Opinion',
  report: 'Report',
  newsletter: 'Newsletter',
  'annual-report': 'Annual report',
  'policy-brief': 'Policy brief',
  'working-paper': 'Working paper',
};

export const RESEARCH_STATUS_LABELS: Record<ResearchStatus, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  planned: 'Planned',
  archived: 'Archived',
};

export const IMPACT_PATHWAY = [
  {
    title: 'Evidence',
    text: 'Rigorous inquiry across education, policy, society, and related fields.',
  },
  {
    title: 'Insight',
    text: 'Findings distilled into clear analysis for scholars and practitioners.',
  },
  {
    title: 'Collaboration',
    text: 'Working with students, researchers, and university teachers.',
  },
  {
    title: 'Policy',
    text: 'Connecting research to reform, awareness, and development agendas.',
  },
  {
    title: 'Impact',
    text: 'Contributing toward a greener, more peaceful, and equitable world.',
  },
] as const;

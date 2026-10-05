import type { Activity } from '@/types/content';

const ts = {
  status: 'published' as const,
  createdAt: '2020-06-01T00:00:00.000Z',
  updatedAt: '2026-09-20T00:00:00.000Z',
  publishedAt: '2020-06-01T00:00:00.000Z',
};

export const activities: Activity[] = [
  {
    ...ts,
    id: 'activity-capacity-building',
    slug: 'capacity-building',
    title: 'Capacity Building',
    type: 'capacity-building',
    summary:
      'Training workshops, fellowships and grants, and structured mentorship that strengthen research skills across career stages.',
    imageUrl: null,
    description: `BK School of Research offers training workshops on research methodology and data analysis to strengthen technical and analytical skills, alongside fellowships and grants that support early-career researchers in pursuing independent and collaborative research.

To bridge experience across career stages, we pair senior faculty with junior researchers through structured mentorship, fostering the transfer of expertise and the growth of a new generation of scholars.`,
    relatedEventIds: ['event-spss-beginners'],
    order: 1,
    seo: {
      title: 'Capacity Building | BKSR',
      description:
        'Research methodology training, fellowships, grants, and mentorship at BK School of Research.',
      canonicalPath: '/activities/capacity-building',
    },
  },
  {
    ...ts,
    id: 'activity-research-talk',
    slug: 'policy-academic-engagement',
    title: 'Policy & Academic Engagement',
    type: 'research-talk',
    summary:
      'Policy dialogues, evidence-to-policy briefings, seminars and research talks, and partnerships that connect scholarship to decisions.',
    imageUrl: '/media/authentic/event-covid-youth-mental-health.jpg',
    description: `BK School of Research facilitates policy dialogues and roundtables that bring together government and industry stakeholders to exchange ideas and address shared challenges. Through evidence-to-policy briefings, we translate research findings into actionable recommendations that inform real-world decisions.

We sustain an active academic community through regular seminars, conferences, colloquia, research talk and guest lectures, in addition to building collaborative partnerships with international universities and research institutes to broaden the reach and rigor of our work.`,
    relatedEventIds: ['event-globalization-youths'],
    order: 2,
    seo: {
      title: 'Policy & Academic Engagement | BKSR',
      description:
        'Policy dialogues, evidence briefings, seminars, and academic partnerships at BK School of Research.',
      canonicalPath: '/activities/research-talks',
    },
  },
  {
    ...ts,
    id: 'activity-awareness-campaign',
    slug: 'community-social-impact',
    title: 'Community & Social Impact',
    type: 'awareness-campaign',
    summary:
      'Field-based studies, public health surveys, outreach, and civil-society collaboration that extend research into communities.',
    imageUrl: '/media/authentic/event-gender-development.jpg',
    description: `BK School of Research conducts field-based studies and public health surveys grounded in local communities. Through outreach initiatives, we translate research into public awareness.

We also collaborate with civil society organizations to extend the impact of our research to local communities.`,
    relatedEventIds: [
      'event-gender-development',
      'event-covid-youth-mental-health',
      'event-covid-child-protection',
    ],
    order: 3,
    seo: {
      title: 'Community & Social Impact | BKSR',
      description:
        'Field studies, outreach, and community-facing impact programmes at BK School of Research.',
      canonicalPath: '/activities/awareness-campaigns',
    },
  },
  {
    ...ts,
    status: 'archived',
    id: 'activity-innovation-showcasing',
    slug: 'innovation-showcasing',
    title: 'Innovation Showcasing',
    type: 'innovation-showcasing',
    summary:
      'Archive stream for literary and creative initiatives associated with BKSR.',
    imageUrl: '/media/authentic/event-covid-child-protection.jpg',
    description: `Beyond the core programme portfolio, BKSR has hosted creative and literary initiatives.

Legacy examples include the Mother’s Day writing contest “মাকে নিয়ে লিখি” (2020), announcement of winning writers, Bengali literary posts, and the little magazine initiative Saptasudha.`,
    relatedEventIds: [],
    order: 99,
    seo: {
      title: 'Innovation Showcasing | BKSR',
      description:
        'Creative and literary showcasing initiatives associated with BK School of Research.',
      canonicalPath: '/activities/innovation-showcasing',
    },
  },
];

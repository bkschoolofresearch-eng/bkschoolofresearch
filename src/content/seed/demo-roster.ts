import type { Person } from '@/types/content';
import { peopleDemoRoster } from './people-demo';

const now = '2026-09-28T00:00:00.000Z';

/**
 * Temporary public demo roster — two people in each category besides the
 * Executive Director. Remove these records when real profiles replace them.
 * Ids are prefixed `demo-person-` so they can be deleted together.
 */
const DEMO_PICKS: { slug: string; order: number }[] = [
  { slug: 'carlos-ramirez', order: 10 },
  { slug: 'james-okonkwo', order: 20 },
  { slug: 'daniel-wong', order: 11 },
  { slug: 'sofia-chen', order: 21 },
  { slug: 'aisha-patel', order: 12 },
  { slug: 'elena-vasquez', order: 22 },
  { slug: 'riya-das', order: 13 },
  { slug: 'noah-bennett', order: 23 },
];

export const demoPeople: Person[] = DEMO_PICKS.map(({ slug, order }) => {
  const member = peopleDemoRoster.find((person) => person.slug === slug);
  if (!member) {
    throw new Error(`Missing demo person: ${slug}`);
  }
  return {
    id: `demo-person-${member.slug}`,
    slug: member.slug,
    status: 'published',
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    name: member.name,
    role: member.role,
    category: member.category,
    claimStatus: 'unclaimed',
    affiliation: member.affiliation,
    shortBio: member.description,
    photoUrl: member.imageSrc,
    bio: member.bio,
    researchInterests: member.researchInterests,
    order,
    seo: {
      title: `${member.name} | BK School of Research`,
      description: member.description,
      canonicalPath: `/people/${member.slug}`,
    },
  };
});

/** Temporary homepage quotes. Same demo names as the roster; replace later. */
export const demoResearcherQuotes = [
  {
    name: 'Sofia Chen',
    role: 'Research Associate',
    imageSrc: '/media/prototype/team-demo-sofia-chen.png',
    quote:
      'Mentorship here turned a field question into a study I could stand behind.',
  },
  {
    name: 'Daniel Wong',
    role: 'Research Director',
    imageSrc: '/media/prototype/team-demo-daniel-wong.png',
    quote:
      'The team treats evidence as something the public should be able to use.',
  },
  {
    name: 'Aisha Patel',
    role: 'Programme Coordinator',
    imageSrc: '/media/prototype/team-demo-aisha-patel.png',
    quote:
      'Training and fieldwork stay connected, so the work leaves the seminar room.',
  },
  {
    name: 'Carlos Ramirez',
    role: 'Distinguished Fellow',
    imageSrc: '/media/prototype/team-demo-carlos-ramirez.png',
    quote:
      'There is room to ask a careful question, and colleagues who help answer it.',
  },
] as const;

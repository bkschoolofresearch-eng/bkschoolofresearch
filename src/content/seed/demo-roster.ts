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

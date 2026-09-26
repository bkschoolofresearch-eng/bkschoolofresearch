import { PeopleDirectory } from '@/components/home/PeopleDirectory';
import {
  PEOPLE_DEMO_SECTION_COPY,
  PEOPLE_DEMO_SECTION_ORDER,
  peopleDemoRoster,
} from '@/content/seed/people-demo';
import { prototypeMedia } from '@/lib/content/prototype-media';
import { getPeople } from '@/lib/content/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata(
  'People',
  'Leadership and associates of BK School of Research.',
  '/people',
);

const SECTION_IDS: Record<string, string> = {
  'executive-director': 'executive-director',
  'distinguished-fellow': 'distinguished-fellows',
  'research-team': 'research-team',
  'administrative-team': 'administrative-team',
  alumni: 'alumni',
};

export default async function PeoplePage() {
  const people = await getPeople();
  const director =
    people.find((person) => person.category === 'executive-director') ??
    people[0];
  const directorPhoto =
    director?.photoUrl && !director.photoUrl.includes('/prototype/')
      ? director.photoUrl
      : (director?.photoUrl ?? prototypeMedia.directorPortrait.url);

  const directorDescription =
    director?.shortBio?.trim() ||
    director?.bio?.split(/\n\s*\n/)[0]?.replace(/\s+/g, ' ').trim() ||
    `${director?.name ?? 'Leadership'} serves BK School of Research.`;

  const publishedOthers = people
    .filter((person) => person.id !== director?.id)
    .map((person) => ({
      id: person.id,
      href: `/people/${person.slug}`,
      name: person.name,
      role: person.role,
      category: person.category,
      imageSrc:
        person.photoUrl && !person.photoUrl.includes('/prototype/')
          ? person.photoUrl
          : (person.photoUrl ?? prototypeMedia.directorPortrait.url),
      description:
        person.shortBio?.trim() ||
        person.bio?.split(/\n\s*\n/)[0]?.replace(/\s+/g, ' ').trim() ||
        `${person.name} serves as ${person.role} at BK School of Research.`,
    }));

  const demoMembers = peopleDemoRoster
    .filter(
      (demo) =>
        !publishedOthers.some(
          (person) => person.name.toLowerCase() === demo.name.toLowerCase(),
        ),
    )
    .map((demo) => ({
      id: demo.id,
      href: `/people/${demo.slug}`,
      name: demo.name,
      role: demo.role,
      category: demo.category,
      imageSrc: demo.imageSrc,
      description: demo.description,
    }));

  const roster = [...publishedOthers, ...demoMembers];

  const jumpLinks = [
    ...(director
      ? [
          {
            href: `#${SECTION_IDS['executive-director']}`,
            label: 'Executive Director',
          },
        ]
      : []),
    ...PEOPLE_DEMO_SECTION_ORDER.filter((category) =>
      roster.some((member) => member.category === category),
    ).map((category) => ({
      href: `#${SECTION_IDS[category]}`,
      label: PEOPLE_DEMO_SECTION_COPY[category].label,
    })),
  ];

  return (
    <PeopleDirectory
      director={
        director
          ? {
              href: `/people/${director.slug}`,
              name: director.name,
              role: director.role,
              imageSrc: directorPhoto,
              description: directorDescription,
            }
          : null
      }
      roster={roster}
      jumpLinks={jumpLinks}
      sectionIds={SECTION_IDS}
    />
  );
}

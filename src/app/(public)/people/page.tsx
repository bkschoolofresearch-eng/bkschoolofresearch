import { PeopleDirectory } from '@/components/home/PeopleDirectory';
import { PEOPLE_DEMO_SECTION_COPY } from '@/content/seed/people-demo';
import { prototypeMedia } from '@/lib/content/prototype-media';
import {
  allSections,
  assignmentForPerson,
  sectionAnchorId,
} from '@/lib/content/team-sections';
import { getPeople, getSiteSettings } from '@/lib/content/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';
import type { Person } from '@/types/content';

export const metadata = buildPageMetadata(
  'People',
  'Leadership and associates of BK School of Research.',
  '/people',
);

function blurb(person: Person) {
  return (
    person.shortBio?.trim() ||
    person.bio?.split(/\n\s*\n/)[0]?.replace(/\s+/g, ' ').trim() ||
    `${person.name} serves as ${person.role} at BK School of Research.`
  );
}

function photo(person: Person) {
  return person.photoUrl && !person.photoUrl.includes('/prototype/')
    ? person.photoUrl
    : (person.photoUrl ?? prototypeMedia.directorPortrait.url);
}

export default async function PeoplePage() {
  const [people, settings] = await Promise.all([
    getPeople(),
    getSiteSettings(),
  ]);
  const sections = allSections(settings.teamSections);
  const director =
    people.find((person) => person.category === 'executive-director' && !person.sectionSlug) ??
    people.find((person) => person.category === 'executive-director') ??
    null;

  const roster = people
    .filter((person) => person.id !== director?.id)
    .map((person) => ({
      id: person.id,
      href: `/people/${person.slug}`,
      name: person.name,
      role: person.role,
      category: person.category,
      sectionKey: assignmentForPerson(person, settings.teamSections).key,
      imageSrc: photo(person),
      description: blurb(person),
    }));

  const groups = sections
    .filter((section) => section.category !== 'executive-director')
    .map((section) => {
      const builtinCopy =
        section.sectionSlug || section.category === 'other'
          ? null
          : PEOPLE_DEMO_SECTION_COPY[
              section.category as keyof typeof PEOPLE_DEMO_SECTION_COPY
            ];
      return {
        id: sectionAnchorId(section),
        title: builtinCopy?.label ?? section.label,
        description: builtinCopy?.description ?? section.description,
        members: roster.filter((member) => member.sectionKey === section.key),
      };
    })
    .filter((group) => group.members.length > 0);

  const jumpLinks = [
    ...(director
      ? [{ href: '#executive-director', label: 'Executive Director' }]
      : []),
    ...groups.map((group) => ({
      href: `#${group.id}`,
      label: group.title,
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
              imageSrc: photo(director),
              description: blurb(director),
            }
          : null
      }
      groups={groups}
      jumpLinks={jumpLinks}
      directorSectionId="executive-director"
    />
  );
}

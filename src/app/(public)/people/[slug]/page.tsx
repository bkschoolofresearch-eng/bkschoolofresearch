import { notFound } from 'next/navigation';
import { PersonProfileClaimBridge } from '@/components/editorial/PersonProfileClaimBridge';
import { ExecutiveDirectorSolo } from '@/components/home/ExecutiveDirectorSolo';
import { PeopleCategoryHub } from '@/components/home/PeopleCategoryHub';
import { uploadedPersonPhoto } from '@/lib/content/person-photo';
import { RESERVED_PEOPLE_CATEGORY_SLUGS } from '@/lib/content/people-slugs';
import {
  getHomepageConfig,
  getPeople,
  getSiteSettings,
  getPersonBySlug,
  getInvolvementsForPerson,
  getPersonResearchPage,
  getRoleHistoryForPerson,
  getAchievementsProfileForPerson,
} from '@/lib/content/queries';
import {
  customSectionAssignments,
  assignmentForPerson,
} from '@/lib/content/team-sections';
import { PERSON_CATEGORY_META } from '@/lib/public/labels';
import { buildPageMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const people = (await getPeople({ includeDrafts: true })).filter(
    (person) => !RESERVED_PEOPLE_CATEGORY_SLUGS[person.slug],
  );
  return [
    ...Object.keys(RESERVED_PEOPLE_CATEGORY_SLUGS).map((slug) => ({ slug })),
    ...people.map((person) => ({ slug: person.slug })),
  ];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  const customSection = customSectionAssignments(settings.teamSections).find(
    (section) => section.sectionSlug === slug,
  );
  if (customSection) {
    return buildPageMetadata(
      customSection.label,
      customSection.description,
      `/people/${slug}`,
    );
  }
  const category = RESERVED_PEOPLE_CATEGORY_SLUGS[slug];
  if (category) {
    const meta = PERSON_CATEGORY_META[category];
    return buildPageMetadata(meta.label, meta.description, `/people/${slug}`);
  }

  const person = await getPersonBySlug(slug, { includeDrafts: true });
  if (person) {
    return buildPageMetadata(
      person.name,
      person.shortBio ?? person.bio.slice(0, 160),
      `/people/${person.slug}`,
    );
  }

  return {};
}

export default async function PeopleSlugPage({ params }: Props) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  const customSection = customSectionAssignments(settings.teamSections).find(
    (section) => section.sectionSlug === slug,
  );
  if (customSection) {
    const members = (await getPeople()).filter(
      (person) =>
        assignmentForPerson(person, settings.teamSections).sectionSlug ===
        customSection.sectionSlug,
    );
    return (
      <PeopleCategoryHub
        title={customSection.label}
        description={customSection.description || 'Members of this team section.'}
        members={members.map((member) => ({
          id: member.id,
          href: `/people/${member.slug}`,
          name: member.name,
          role: member.role,
          imageSrc: uploadedPersonPhoto(member.photoUrl),
          description:
            member.shortBio?.trim() ||
            member.bio?.split(/\n\s*\n/)[0]?.replace(/\s+/g, ' ').trim() ||
            `${member.name} serves as ${member.role} at BK School of Research.`,
        }))}
      />
    );
  }

  const category = RESERVED_PEOPLE_CATEGORY_SLUGS[slug];
  if (category) {
    const members = (await getPeople({ category })).filter(
      (person) => !person.sectionSlug,
    );
    const meta = PERSON_CATEGORY_META[category];

    const hubPeople = members.map((member) => ({
      id: member.id,
      href: `/people/${member.slug}`,
      name: member.name,
      role: member.role,
      imageSrc: uploadedPersonPhoto(member.photoUrl),
      description:
        member.shortBio?.trim() ||
        member.bio?.split(/\n\s*\n/)[0]?.replace(/\s+/g, ' ').trim() ||
        `${member.name} serves as ${member.role} at BK School of Research.`,
    }));

    // Single ED: portrait + director message (not a one-card flip grid).
    if (category === 'executive-director' && hubPeople.length === 1) {
      const solo = hubPeople[0];
      const homepage = await getHomepageConfig();
      const message =
        homepage.directorMessageExcerpt?.trim() ||
        solo.description;

      return (
        <ExecutiveDirectorSolo
          title={meta.label}
          description={meta.description}
          name={solo.name}
          role={solo.role}
          message={message}
          photoSrc={solo.imageSrc}
          profileHref={solo.href}
        />
      );
    }

    return (
      <PeopleCategoryHub
        title={meta.label}
        description={meta.description}
        members={hubPeople}
      />
    );
  }

  const person = await getPersonBySlug(slug);
  if (!person) notFound();

  const related = (await getPeople())
    .filter((item) => item.id !== person.id)
    .slice(0, 3)
    .map((item) => ({
      href: `/people/${item.slug}`,
      name: item.name,
      role: item.role,
      imageSrc: uploadedPersonPhoto(item.photoUrl),
    }));

  const section = assignmentForPerson(person, settings.teamSections);
  const researchPage = await getPersonResearchPage(person.id, 0);
  const involvements = (await getInvolvementsForPerson(person.id)).filter(
    (item) => item.entityType !== 'research',
  );
  const roleHistory = await getRoleHistoryForPerson(person.id);
  const achievements = await getAchievementsProfileForPerson(person.id);
  return (
    <PersonProfileClaimBridge
      personId={person.id}
      initialPerson={{
        name: person.name,
        role: person.role,
        categoryLabel: section.label,
        affiliation: person.affiliation,
        photoUrl: person.photoUrl,
        bio: person.bio,
        shortBio: person.shortBio,
        skills: person.researchInterests,
        involvements,
        roleHistory,
        verifiedAchievements: achievements.verified,
        memberAchievements: achievements.member,
        appointmentYear: person.appointmentYear,
        backHref: section.href,
        backLabel: `Back to ${section.label}`,
      }}
      researchPage={{
        personId: person.id,
        items: researchPage.items.map((item) => ({
          linkId: item.linkId,
          role: item.role,
          title: item.title,
          href: item.href,
          summary: item.summary ?? null,
        })),
        total: researchPage.total,
      }}
      related={related}
    />
  );
}

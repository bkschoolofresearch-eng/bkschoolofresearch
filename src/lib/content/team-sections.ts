import { PERSON_CATEGORY_META } from '@/lib/public/labels';
import { RESERVED_PEOPLE_CATEGORY_SLUGS } from '@/lib/content/people-slugs';
import { slugify } from '@/lib/utils';
import type { Person, PersonCategory, TeamSection } from '@/types/content';

/** The four researcher sections. Stored on site settings in MongoDB. */
export const RESEARCHER_SECTIONS: TeamSection[] = [
  {
    id: 'section-distinguished-research-fellow',
    slug: 'distinguished-research-fellow',
    label: 'Distinguished Research Fellow',
    description: 'Scholars recognised for distinguished research.',
    order: 1,
  },
  {
    id: 'section-senior-research-associate',
    slug: 'senior-research-associate',
    label: 'Senior Research Associate',
    description: 'Experienced researchers who lead studies and mentor associates.',
    order: 2,
  },
  {
    id: 'section-research-associate',
    slug: 'research-associate',
    label: 'Research Associate',
    description: 'Researchers carrying out studies with the team.',
    order: 3,
  },
  {
    id: 'section-research-assistant',
    slug: 'research-assistant',
    label: 'Research Assistant',
    description: 'Researchers supporting fieldwork, analysis, and publication.',
    order: 4,
  },
];

/** Where an older Distinguished Fellow / Research Team profile belongs among the four sections. */
export function legacyResearcherSlug(
  person: Pick<Person, 'category' | 'sectionSlug'> & { role?: string },
): string | null {
  if (person.sectionSlug) return null;
  if (
    person.category !== 'distinguished-fellow' &&
    person.category !== 'research-team'
  ) {
    return null;
  }
  const role = (person.role ?? '').toLowerCase();
  if (person.category === 'distinguished-fellow' || role.includes('distinguished')) {
    return 'distinguished-research-fellow';
  }
  if (role.includes('assistant')) return 'research-assistant';
  if (role.includes('senior')) return 'senior-research-associate';
  return 'research-associate';
}

export type SectionAssignment = {
  key: string;
  label: string;
  description: string;
  category: PersonCategory;
  sectionSlug: string | null;
  href: string;
};

const BUILTIN_ORDER: PersonCategory[] = [
  'executive-director',
  'distinguished-fellow',
  'research-team',
  'administrative-team',
  'alumni',
  'other',
];

export function builtinSections(): SectionAssignment[] {
  return BUILTIN_ORDER.map((category) => ({
    key: `builtin:${category}`,
    label: PERSON_CATEGORY_META[category].label,
    description: PERSON_CATEGORY_META[category].description,
    category,
    sectionSlug: null,
    href: PERSON_CATEGORY_META[category].href,
  }));
}

export function customSectionAssignments(
  sections: TeamSection[] | undefined,
): SectionAssignment[] {
  return [...(sections ?? [])]
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    .map((section) => ({
      key: `custom:${section.slug}`,
      label: section.label,
      description: section.description,
      category: 'other' as const,
      sectionSlug: section.slug,
      href: `/people/${section.slug}`,
    }));
}

/** Executive Director, then the sections stored in MongoDB. */
export function allSections(sections?: TeamSection[]): SectionAssignment[] {
  const director = builtinSections().filter(
    (section) => section.category === 'executive-director',
  );
  return [...director, ...customSectionAssignments(sections)];
}

export function assignmentForPerson(
  person: Pick<Person, 'category' | 'sectionSlug'> & { role?: string },
  sections?: TeamSection[],
): SectionAssignment {
  const slug = person.sectionSlug || legacyResearcherSlug(person);
  if (slug) {
    const custom = customSectionAssignments(sections).find(
      (section) => section.sectionSlug === slug,
    );
    if (custom) return custom;
  }
  return (
    builtinSections().find((section) => section.category === person.category) ??
    builtinSections().find((section) => section.category === 'other')!
  );
}

export function sectionByKey(
  key: string,
  sections?: TeamSection[],
): SectionAssignment {
  return (
    allSections(sections).find((section) => section.key === key) ??
    allSections(sections).find(
      (section) => section.sectionSlug === 'research-associate',
    ) ??
    allSections(sections)[0]!
  );
}

export function sectionAnchorId(section: SectionAssignment): string {
  if (section.sectionSlug) return section.sectionSlug;
  if (section.category === 'distinguished-fellow') return 'distinguished-fellows';
  return section.category;
}

export function reservedSectionSlugs(sections?: TeamSection[]): Set<string> {
  return new Set([
    ...Object.keys(RESERVED_PEOPLE_CATEGORY_SLUGS),
    ...(sections ?? []).map((section) => section.slug),
  ]);
}

export function nextTeamSectionSlug(
  label: string,
  sections: TeamSection[],
  extraTaken: string[] = [],
): string {
  const base = slugify(label) || 'section';
  const taken = reservedSectionSlugs(sections);
  for (const slug of extraTaken) taken.add(slug);
  let slug = base;
  let n = 2;
  while (taken.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

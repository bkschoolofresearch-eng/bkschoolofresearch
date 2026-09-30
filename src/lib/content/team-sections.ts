import { PERSON_CATEGORY_META } from '@/lib/public/labels';
import { RESERVED_PEOPLE_CATEGORY_SLUGS } from '@/lib/content/people-slugs';
import { slugify } from '@/lib/utils';
import type { Person, PersonCategory, TeamSection } from '@/types/content';

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

/** Built-in sections, with custom sections before Alumni. */
export function allSections(sections?: TeamSection[]): SectionAssignment[] {
  const builtins = builtinSections();
  const head = builtins.filter(
    (section) => section.category !== 'alumni' && section.category !== 'other',
  );
  const tail = builtins.filter(
    (section) => section.category === 'alumni' || section.category === 'other',
  );
  return [...head, ...customSectionAssignments(sections), ...tail];
}

export function assignmentForPerson(
  person: Pick<Person, 'category' | 'sectionSlug'>,
  sections?: TeamSection[],
): SectionAssignment {
  if (person.sectionSlug) {
    const custom = customSectionAssignments(sections).find(
      (section) => section.sectionSlug === person.sectionSlug,
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
    builtinSections().find((section) => section.category === 'research-team')!
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

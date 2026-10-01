import { v4 as uuidv4 } from 'uuid';
import { contentRepository } from '@/lib/cms/repository';
import {
  asExternalHttpUrl,
  extractDoiUrlFromText,
  publicationExternalUrl,
} from '@/lib/content/research-links';
import type {
  ContentDatabase,
  Person,
  PersonContentLink,
  PersonLinkEntityType,
} from '@/types/content';

export const PERSON_LINK_ROLE_OPTIONS: Record<
  PersonLinkEntityType,
  { value: string; label: string }[]
> = {
  event: [
    { value: 'speaker', label: 'Speaker' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'organizer', label: 'Organizer' },
    { value: 'contributor', label: 'Contributor' },
  ],
  research: [
    { value: 'lead', label: 'Lead' },
    { value: 'author', label: 'Author' },
    { value: 'contributor', label: 'Contributor' },
  ],
  publication: [
    { value: 'author', label: 'Author' },
    { value: 'editor', label: 'Editor' },
    { value: 'contributor', label: 'Contributor' },
  ],
  activity: [
    { value: 'organizer', label: 'Organizer' },
    { value: 'speaker', label: 'Speaker' },
    { value: 'contributor', label: 'Contributor' },
  ],
};

export const PERSON_LINK_TYPE_LABEL: Record<PersonLinkEntityType, string> = {
  event: 'Event',
  research: 'Research',
  publication: 'Publication',
  activity: 'Activity',
};

export type ResolvedPersonInvolvement = {
  linkId: string;
  entityType: PersonLinkEntityType;
  entityId: string;
  role: string;
  title: string;
  href: string | null;
  summary?: string;
};

export type ResolvedLinkedPerson = {
  linkId: string;
  personId: string;
  name: string;
  roleOnEntity: string;
  profileRole: string;
  href: string;
  photoUrl?: string | null;
};

function nowIso() {
  return new Date().toISOString();
}

export function humanizeLinkRole(role: string): string {
  if (!role) return 'Contributor';
  return role.charAt(0).toUpperCase() + role.slice(1).replace(/-/g, ' ');
}

function entityCollection(
  type: PersonLinkEntityType,
): 'events' | 'researchProjects' | 'publications' | 'activities' {
  if (type === 'event') return 'events';
  if (type === 'research') return 'researchProjects';
  if (type === 'publication') return 'publications';
  return 'activities';
}

function entityPublicPath(
  type: PersonLinkEntityType,
  slug: string,
  extra?: { activityType?: string; url?: string | null },
): string | null {
  if (type === 'event') return `/events/${slug}`;
  if (type === 'research') {
    const url = extra?.url?.trim();
    return url || null;
  }
  if (type === 'publication') return `/publications/${slug}`;
  const activityRoutes: Record<string, string> = {
    'capacity-building': '/activities/capacity-building',
    'awareness-campaign': '/activities/awareness-campaigns',
    'research-talk': '/activities/research-talks',
    'innovation-showcasing': '/activities/innovation-showcasing',
  };
  return extra?.activityType
    ? (activityRoutes[extra.activityType] ?? `/activities`)
    : '/activities';
}

export function resolveEntityMeta(
  db: ContentDatabase,
  type: PersonLinkEntityType,
  entityId: string,
): { title: string; href: string | null; summary?: string; slug?: string } | null {
  const list = db[entityCollection(type)] as {
    id: string;
    slug: string;
    title: string;
    summary?: string;
    type?: string;
    url?: string | null;
    publicationIds?: string[];
  }[];
  const entity = list.find((item) => item.id === entityId);
  if (!entity) return null;

  let researchUrl = asExternalHttpUrl(entity.url);
  if (type === 'research' && !researchUrl) {
    for (const pubId of entity.publicationIds ?? []) {
      const pub = db.publications.find((item) => item.id === pubId);
      if (!pub) continue;
      const href = publicationExternalUrl(pub);
      if (href) {
        researchUrl = href;
        break;
      }
    }
    if (!researchUrl) {
      researchUrl =
        extractDoiUrlFromText(
          (entity as { description?: string }).description,
        ) ?? extractDoiUrlFromText(entity.summary);
    }
  }

  return {
    title: entity.title,
    href: entity.slug
      ? entityPublicPath(type, entity.slug, {
          activityType: entity.type,
          url: researchUrl,
        })
      : null,
    summary: entity.summary,
    slug: entity.slug,
  };
}

export const PERSON_RESEARCH_PAGE_SIZE = 5;

export type PersonResearchPage = {
  items: ResolvedPersonInvolvement[];
  total: number;
  offset: number;
  limit: number;
};

/** Published research linked to this person in the CMS, one page at a time. */
export function pagePersonResearch(
  db: ContentDatabase,
  personId: string,
  offset = 0,
): PersonResearchPage {
  const safeLimit = PERSON_RESEARCH_PAGE_SIZE;
  const start = Number.isFinite(offset) && offset > 0 ? Math.floor(offset) : 0;
  const person = db.people.find((row) => row.id === personId);
  if (!person || person.status !== 'published') {
    return { items: [], total: 0, offset: 0, limit: safeLimit };
  }

  const published = new Set(
    db.researchProjects
      .filter((project) => project.status === 'published')
      .map((project) => project.id),
  );
  const resolved = db.personContentLinks
    .filter(
      (link) =>
        link.personId === personId &&
        link.entityType === 'research' &&
        published.has(link.entityId),
    )
    .sort(
      (a, b) =>
        (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id),
    )
    .flatMap((link) => {
      const meta = resolveEntityMeta(db, 'research', link.entityId);
      if (!meta || meta.title === 'Untitled') return [];
      const item: ResolvedPersonInvolvement = {
        linkId: link.id,
        entityType: 'research',
        entityId: link.entityId,
        role: link.role,
        title: meta.title,
        href: meta.href,
        summary: meta.summary,
      };
      return [item];
    });

  return {
    items: resolved.slice(start, start + safeLimit),
    total: resolved.length,
    offset: start,
    limit: safeLimit,
  };
}

export function getResolvedInvolvementsForPerson(
  db: ContentDatabase,
  personId: string,
): ResolvedPersonInvolvement[] {
  return db.personContentLinks
    .filter((link) => link.personId === personId)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .map((link) => {
      const meta = resolveEntityMeta(db, link.entityType, link.entityId);
      return {
        linkId: link.id,
        entityType: link.entityType,
        entityId: link.entityId,
        role: link.role,
        title: meta?.title ?? 'Untitled',
        href: meta?.href ?? null,
        summary: meta?.summary,
      };
    })
    .filter((item) => item.title !== 'Untitled' || item.href);
}

export function getResolvedPeopleForEntity(
  db: ContentDatabase,
  entityType: PersonLinkEntityType,
  entityId: string,
): ResolvedLinkedPerson[] {
  return db.personContentLinks
    .filter(
      (link) => link.entityType === entityType && link.entityId === entityId,
    )
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .flatMap((link) => {
      const person = db.people.find((p) => p.id === link.personId) as
        | Person
        | undefined;
      if (!person) return [];
      const resolved: ResolvedLinkedPerson = {
        linkId: link.id,
        personId: person.id,
        name: person.name,
        roleOnEntity: link.role,
        profileRole: person.role,
        href: `/people/${person.slug}`,
        photoUrl: person.photoUrl ?? null,
      };
      return [resolved];
    });
}

export function getEntitiesForPicker(
  db: ContentDatabase,
  type: PersonLinkEntityType,
): { id: string; title: string }[] {
  const list = db[entityCollection(type)] as { id: string; title: string }[];
  return list.map((item) => ({ id: item.id, title: item.title }));
}

export function replaceEntityPersonLinks(
  entityType: PersonLinkEntityType,
  entityId: string,
  rows: { personId: string; role: string }[],
): void {
  const db = contentRepository.getDatabase();
  const stamp = nowIso();
  const kept = db.personContentLinks.filter(
    (link) => !(link.entityType === entityType && link.entityId === entityId),
  );
  const created: PersonContentLink[] = rows
    .filter((row) => row.personId)
    .map((row, index) => ({
      id: uuidv4(),
      personId: row.personId,
      entityType,
      entityId,
      role: row.role.trim() || 'contributor',
      order: index,
      createdAt: stamp,
      updatedAt: stamp,
    }));
  const next = {
    ...db,
    personContentLinks: [...kept, ...created],
  };
  contentRepository.saveDatabase(next);
}

export function addPersonContentLink(input: {
  personId: string;
  entityType: PersonLinkEntityType;
  entityId: string;
  role: string;
}): PersonContentLink | { error: string } {
  const db = contentRepository.getDatabase();
  const duplicate = db.personContentLinks.find(
    (link) =>
      link.personId === input.personId &&
      link.entityType === input.entityType &&
      link.entityId === input.entityId,
  );
  if (duplicate) {
    return { error: 'That person is already linked to this item.' };
  }
  const stamp = nowIso();
  const item: PersonContentLink = {
    id: uuidv4(),
    personId: input.personId,
    entityType: input.entityType,
    entityId: input.entityId,
    role: input.role.trim() || 'contributor',
    order: db.personContentLinks.length,
    createdAt: stamp,
    updatedAt: stamp,
  };
  contentRepository.saveDatabase({
    ...db,
    personContentLinks: [...db.personContentLinks, item],
  });
  return item;
}

export function removePersonContentLink(id: string): void {
  const db = contentRepository.getDatabase();
  contentRepository.saveDatabase({
    ...db,
    personContentLinks: db.personContentLinks.filter((link) => link.id !== id),
  });
}

export function removeLinksForEntity(
  entityType: PersonLinkEntityType,
  entityId: string,
): void {
  const db = contentRepository.getDatabase();
  contentRepository.saveDatabase({
    ...db,
    personContentLinks: db.personContentLinks.filter(
      (link) => !(link.entityType === entityType && link.entityId === entityId),
    ),
  });
}

export function removeLinksForPerson(personId: string): void {
  const db = contentRepository.getDatabase();
  contentRepository.saveDatabase({
    ...db,
    personContentLinks: db.personContentLinks.filter(
      (link) => link.personId !== personId,
    ),
  });
}

export function groupInvolvements(
  items: ResolvedPersonInvolvement[],
): { type: PersonLinkEntityType; label: string; items: ResolvedPersonInvolvement[] }[] {
  const order: PersonLinkEntityType[] = [
    'research',
    'publication',
    'event',
    'activity',
  ];
  return order
    .map((type) => ({
      type,
      label: PERSON_LINK_TYPE_LABEL[type],
      items: items.filter((item) => item.entityType === type),
    }))
    .filter((group) => group.items.length > 0);
}

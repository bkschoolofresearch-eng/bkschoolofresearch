import 'server-only';
import { getContentDatabase } from '@/lib/cms/get-content-database';
import {
  getMemberAchievementsForPerson,
  getRoleAssignmentsForPerson,
  getVerifiedAchievementsForPerson,
} from '@/lib/content/people-ops';
import {
  getResolvedInvolvementsForPerson,
  getResolvedPeopleForEntity,
  pagePersonResearch,
} from '@/lib/content/person-links';
import { customSectionAssignments } from '@/lib/content/team-sections';
import type {
  Activity,
  ContentStatus,
  Event,
  GalleryAlbum,
  GalleryImage,
  HomepageConfig,
  MediaAsset,
  MediaClipping,
  NavigationItem,
  NewsArticle,
  Notice,
  Page,
  Person,
  PersonCategory,
  PersonContentLink,
  PersonLinkEntityType,
  Publication,
  PublicationType,
  ResearchArea,
  ResearchProject,
  ResearchStatus,
  Resource,
  SiteSettings,
  TeamSection,
} from '@/types/content';

type PublishedFilter = {
  includeDrafts?: boolean;
};

function isPublished(status: ContentStatus): boolean {
  return status === 'published';
}

function filterPublished<T extends { status: ContentStatus }>(
  items: T[],
  options?: PublishedFilter,
): T[] {
  if (options?.includeDrafts) return items;
  return items.filter((item) => isPublished(item.status));
}

function byOrder<T extends { order?: number }>(a: T, b: T): number {
  return (a.order ?? 999) - (b.order ?? 999);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return (await getContentDatabase()).siteSettings;
}

export async function getNavigation(): Promise<{
  main: NavigationItem[];
  footer: NavigationItem[];
  knowledgeHub: NavigationItem[];
}> {
  const db = await getContentDatabase();
  return {
    ...db.navigation,
    main: ensurePeopleNav(db.navigation.main, db.siteSettings.teamSections ?? []),
  };
}

/** Keep Apply to join, and show admin-created team sections, under People. */
function ensurePeopleNav(
  main: NavigationItem[],
  sections: TeamSection[],
): NavigationItem[] {
  return main.map((item) => {
    if (item.href !== '/people' || !item.children?.length) return item;
    let children = item.children;
    if (!children.some((child) => child.href === '/join')) {
      children = [
        ...children,
        {
          id: 'nav-people-join',
          label: 'Apply to join',
          href: '/join',
          description: 'Apply to the research community or organisational team',
          order: Math.max(...children.map((child) => child.order), 0) + 1,
        },
      ];
    }

    const custom = customSectionAssignments(sections).filter(
      (section) => !children.some((child) => child.href === section.href),
    );
    const withoutRetired = children
      .filter(
        (child) =>
          child.href !== '/people/distinguished-fellows' &&
          child.href !== '/people/research-team' &&
          child.href !== '/people/administrative-team',
      )
      .map((child) =>
        child.href === '/people/career'
          ? { ...child, label: 'Vacancy at BKSR' }
          : child,
      );
    if (!custom.length) return { ...item, children: withoutRetired };

    const insertAt = withoutRetired.findIndex(
      (child) => child.href === '/people/career' || child.href === '/join',
    );
    const links: NavigationItem[] = custom.map((section, index) => ({
      id: `nav-people-section-${section.sectionSlug}`,
      label: section.label,
      href: section.href,
      order: index,
    }));
    const next =
      insertAt === -1
        ? [...withoutRetired, ...links]
        : [
            ...withoutRetired.slice(0, insertAt),
            ...links,
            ...withoutRetired.slice(insertAt),
          ];
    return { ...item, children: next };
  });
}

export async function getHomepageConfig(): Promise<HomepageConfig> {
  return (await getContentDatabase()).homepage;
}

export async function getPages(options?: PublishedFilter): Promise<Page[]> {
  return filterPublished((await getContentDatabase()).pages, options).sort(byOrder);
}

export async function getPageBySlug(
  slug: string,
  options?: PublishedFilter,
): Promise<Page | undefined> {
  return (await getPages(options)).find((page) => page.slug === slug);
}

export async function getPeople(
  options?: PublishedFilter & { category?: PersonCategory },
): Promise<Person[]> {
  let people = filterPublished((await getContentDatabase()).people, options);
  if (options?.category) {
    people = people.filter((person) => person.category === options.category);
  }
  return people.sort(byOrder);
}

export async function getPersonBySlug(
  slug: string,
  options?: PublishedFilter,
): Promise<Person | undefined> {
  return (await getPeople(options)).find((person) => person.slug === slug);
}

export async function getPersonById(
  id: string,
  options?: PublishedFilter,
): Promise<Person | undefined> {
  return (await getPeople(options)).find((person) => person.id === id);
}

export async function getResearchAreas(
  options?: PublishedFilter,
): Promise<ResearchArea[]> {
  return filterPublished(
    (await getContentDatabase()).researchAreas,
    options,
  ).sort(byOrder);
}

export async function getResearchAreaBySlug(
  slug: string,
  options?: PublishedFilter,
): Promise<ResearchArea | undefined> {
  return (await getResearchAreas(options)).find((area) => area.slug === slug);
}

export async function getResearchProjects(
  options?: PublishedFilter & { researchStatus?: ResearchStatus },
): Promise<ResearchProject[]> {
  let projects = filterPublished(
    (await getContentDatabase()).researchProjects,
    options,
  );
  if (options?.researchStatus) {
    projects = projects.filter(
      (project) => project.researchStatus === options.researchStatus,
    );
  }
  return projects;
}

export async function getResearchProjectBySlug(
  slug: string,
  options?: PublishedFilter,
): Promise<ResearchProject | undefined> {
  return (await getResearchProjects(options)).find(
    (project) => project.slug === slug,
  );
}

export async function getResearchProjectById(
  id: string,
  options?: PublishedFilter,
): Promise<ResearchProject | undefined> {
  return (await getResearchProjects(options)).find(
    (project) => project.id === id,
  );
}

export async function getPublications(
  options?: PublishedFilter & { type?: PublicationType; year?: number },
): Promise<Publication[]> {
  let publications = filterPublished(
    (await getContentDatabase()).publications,
    options,
  );
  if (options?.type) {
    publications = publications.filter((pub) => pub.type === options.type);
  }
  if (options?.year != null) {
    publications = publications.filter((pub) => pub.year === options.year);
  }
  return publications.sort(
    (a, b) => b.year - a.year || a.title.localeCompare(b.title),
  );
}

export async function getPublicationBySlug(
  slug: string,
  options?: PublishedFilter,
): Promise<Publication | undefined> {
  return (await getPublications(options)).find((pub) => pub.slug === slug);
}

export async function getPublicationById(
  id: string,
  options?: PublishedFilter,
): Promise<Publication | undefined> {
  return (await getPublications(options)).find((pub) => pub.id === id);
}

export async function getMediaClippings(
  options?: PublishedFilter,
): Promise<MediaClipping[]> {
  return filterPublished(
    (await getContentDatabase()).mediaClippings ?? [],
    options,
  ).sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

export async function getActivities(
  options?: PublishedFilter,
): Promise<Activity[]> {
  return filterPublished(
    (await getContentDatabase()).activities,
    options,
  ).sort(byOrder);
}

export async function getActivityBySlug(
  slug: string,
  options?: PublishedFilter,
): Promise<Activity | undefined> {
  return (await getActivities(options)).find(
    (activity) => activity.slug === slug,
  );
}

export async function getNews(
  options?: PublishedFilter,
): Promise<NewsArticle[]> {
  return filterPublished((await getContentDatabase()).news, options).sort(
    (a, b) => {
      const aDate = a.publishedAt ?? a.createdAt;
      const bDate = b.publishedAt ?? b.createdAt;
      return bDate.localeCompare(aDate);
    },
  );
}

export async function getNewsBySlug(
  slug: string,
  options?: PublishedFilter,
): Promise<NewsArticle | undefined> {
  return (await getNews(options)).find((article) => article.slug === slug);
}

export async function getEvents(
  options?: PublishedFilter & { eventStatus?: Event['eventStatus'] },
): Promise<Event[]> {
  let events = filterPublished((await getContentDatabase()).events, options);
  if (options?.eventStatus) {
    events = events.filter((event) => event.eventStatus === options.eventStatus);
  }
  return events.sort((a, b) => b.startAt.localeCompare(a.startAt));
}

export async function getEventBySlug(
  slug: string,
  options?: PublishedFilter,
): Promise<Event | undefined> {
  return (await getEvents(options)).find((event) => event.slug === slug);
}

export async function getNotices(options?: PublishedFilter): Promise<Notice[]> {
  return filterPublished((await getContentDatabase()).notices, options).sort(
    (a, b) => {
      const aDate = a.publishedAt ?? a.createdAt;
      const bDate = b.publishedAt ?? b.createdAt;
      return bDate.localeCompare(aDate);
    },
  );
}

export async function getNoticeBySlug(
  slug: string,
  options?: PublishedFilter,
): Promise<Notice | undefined> {
  return (await getNotices(options)).find((notice) => notice.slug === slug);
}

export async function getResources(
  options?: PublishedFilter,
): Promise<Resource[]> {
  return filterPublished((await getContentDatabase()).resources, options);
}

export async function getResourceBySlug(
  slug: string,
  options?: PublishedFilter,
): Promise<Resource | undefined> {
  return (await getResources(options)).find(
    (resource) => resource.slug === slug,
  );
}

export async function getGalleryAlbums(
  options?: PublishedFilter,
): Promise<GalleryAlbum[]> {
  return filterPublished((await getContentDatabase()).galleryAlbums, options);
}

export async function getGalleryImages(
  options?: PublishedFilter,
): Promise<GalleryImage[]> {
  return filterPublished(
    (await getContentDatabase()).galleryImages,
    options,
  ).sort(byOrder);
}

export async function getMedia(
  options?: PublishedFilter,
): Promise<MediaAsset[]> {
  return filterPublished((await getContentDatabase()).media, options);
}

export async function getMediaById(
  id: string,
  options?: PublishedFilter,
): Promise<MediaAsset | undefined> {
  return (await getMedia(options)).find((asset) => asset.id === id);
}

export async function getPersonContentLinks(): Promise<PersonContentLink[]> {
  return (await getContentDatabase()).personContentLinks ?? [];
}

export async function getLinkedPeopleForEntity(
  entityType: PersonLinkEntityType,
  entityId: string,
) {
  return getResolvedPeopleForEntity(
    await getContentDatabase(),
    entityType,
    entityId,
  );
}

export async function getInvolvementsForPerson(personId: string) {
  return getResolvedInvolvementsForPerson(
    await getContentDatabase(),
    personId,
  );
}

export async function getPersonResearchPage(personId: string, offset = 0) {
  return pagePersonResearch(await getContentDatabase(), personId, offset);
}

export async function getRoleHistoryForPerson(personId: string) {
  return getRoleAssignmentsForPerson(
    await getContentDatabase(),
    personId,
  ).map((row) => ({
    id: row.id,
    year: row.year,
    role: row.role,
  }));
}

export async function getAchievementsProfileForPerson(personId: string) {
  const db = await getContentDatabase();
  return {
    verified: getVerifiedAchievementsForPerson(db, personId).map((row) => ({
      id: row.assignment.id,
      title: row.achievement!.title,
      description: row.achievement!.description,
      certificateCode: row.assignment.certificateCode ?? null,
      assignedAt: row.assignment.assignedAt,
    })),
    member: getMemberAchievementsForPerson(db, personId).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      year: row.year,
    })),
  };
}

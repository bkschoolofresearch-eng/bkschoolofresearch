import type { Publication, ResearchProject } from '@/types/content';

/** Normalize a DOI or DOI URL to https://doi.org/... */
export function doiToUrl(doi: string | null | undefined): string | null {
  if (!doi?.trim()) return null;
  const cleaned = doi
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  if (!cleaned) return null;
  return `https://doi.org/${cleaned}`;
}

/** Pull a DOI URL out of free text (citation, description, etc.). */
export function extractDoiUrlFromText(
  text: string | null | undefined,
): string | null {
  if (!text?.trim()) return null;
  const absolute = text.match(
    /https?:\/\/(?:dx\.)?doi\.org\/(10\.\d{4,}\/[^\s<>"']+)/i,
  );
  if (absolute?.[1]) {
    return doiToUrl(absolute[1].replace(/[.,;:)]+$/, ''));
  }
  const bare = text.match(/\b(10\.\d{4,}\/[^\s<>"']+)/);
  if (bare?.[1]) {
    return doiToUrl(bare[1].replace(/[.,;:)]+$/, ''));
  }
  return null;
}

/** Only allow absolute http(s) destinations — never internal app routes. */
export function asExternalHttpUrl(
  value: string | null | undefined,
): string | null {
  const href = value?.trim();
  if (!href) return null;
  if (!/^https?:\/\//i.test(href)) return null;
  return href;
}

export function publicationExternalUrl(
  publication: Pick<Publication, 'url' | 'doi' | 'citation'>,
): string | null {
  const direct = asExternalHttpUrl(publication.url);
  if (direct) return direct;
  const fromDoi = doiToUrl(publication.doi);
  if (fromDoi) return fromDoi;
  return extractDoiUrlFromText(publication.citation);
}

/**
 * Prefer an explicit project URL, then the first linked publication’s
 * journal/DOI/external link, then a DOI embedded in the project citation.
 * Never falls back to an internal `/research/[slug]` detail route.
 */
export function researchProjectExternalUrl(
  project: Pick<
    ResearchProject,
    'url' | 'publicationIds' | 'description' | 'summary'
  >,
  publicationsById?: Map<string, Publication>,
): string | null {
  const attached = asExternalHttpUrl(project.url);
  if (attached) return attached;

  if (publicationsById) {
    for (const id of project.publicationIds ?? []) {
      const pub = publicationsById.get(id);
      if (!pub) continue;
      const href = publicationExternalUrl(pub);
      if (href) return href;
    }
  }

  return (
    extractDoiUrlFromText(project.description) ??
    extractDoiUrlFromText(project.summary)
  );
}

export function withResearchExternalUrls(
  projects: ResearchProject[],
  publications: Publication[],
): ResearchProject[] {
  const byId = new Map(publications.map((pub) => [pub.id, pub]));
  return projects.map((project) => {
    const url = researchProjectExternalUrl(project, byId);
    return { ...project, url: url ?? null };
  });
}

/**
 * Venue / source line under authors on /research listing cards.
 * Prefer the explicit `venue` field (Journal / conference in CMS).
 * Legacy fallback: parse leftover after the title from description/summary
 * (older seed stored full citations there with venue empty).
 */
export function researchProjectVenueLine(
  project: Pick<
    ResearchProject,
    'title' | 'summary' | 'description' | 'venue'
  >,
): string | null {
  const explicit = project.venue?.trim();
  if (explicit) return explicit;

  const cite = (project.description || project.summary || '').trim();
  if (!cite) return null;

  const title = project.title.trim().replace(/\.+$/, '');
  const citeCore = cite.replace(/\.+$/, '');
  if (!title || citeCore === title) return null;

  const idx = cite.indexOf(title);
  if (idx < 0) return null;

  const rest = cite
    .slice(idx + title.length)
    .replace(/^[.\s]+/, '')
    .trim();
  return rest || null;
}

/** Pull a venue string to prefill the CMS Journal field when venue is empty. */
export function deriveResearchVenueForEditor(
  project: Pick<
    ResearchProject,
    'title' | 'summary' | 'description' | 'venue'
  >,
): string {
  if (project.venue?.trim()) return project.venue.trim();
  return researchProjectVenueLine({ ...project, venue: null }) ?? '';
}

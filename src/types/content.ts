/** Content model for BK School of Research CMS / seed data */

export type ContentStatus = 'draft' | 'published' | 'archived';

export type PublicationType =
  | 'journal'
  | 'book-chapter'
  | 'conference'
  | 'opinion'
  | 'report'
  | 'newsletter'
  | 'annual-report'
  | 'policy-brief'
  | 'working-paper';

export type ResearchStatus = 'ongoing' | 'completed' | 'planned' | 'archived';

export type PersonCategory =
  | 'executive-director'
  | 'distinguished-fellow'
  | 'research-team'
  | 'administrative-team'
  | 'alumni'
  | 'other';

export type ActivityType =
  | 'capacity-building'
  | 'awareness-campaign'
  | 'research-talk'
  | 'innovation-showcasing';

export type EventStatus = 'upcoming' | 'past' | 'cancelled';

export type NoticeType =
  | 'vacancy'
  | 'announcement'
  | 'deadline'
  | 'general';

export type ResourceType =
  | 'tutorial'
  | 'video-series'
  | 'archive'
  | 'tool-guide'
  | 'document'
  | 'other';

export type MediaKind = 'image' | 'video' | 'document' | 'audio' | 'other';

export type HomepageSectionType =
  | 'hero'
  | 'stats'
  | 'featured-research'
  | 'featured-publications'
  | 'director-message'
  | 'research-areas'
  | 'activities'
  | 'news'
  | 'events'
  | 'cta'
  | 'custom';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalPath?: string;
  noIndex?: boolean;
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface ContentBase extends Timestamps {
  id: string;
  slug: string;
  status: ContentStatus;
  seo?: SEOData;
}

export interface SiteSettings {
  id: string;
  organizationName: string;
  organizationShortName: string;
  tagline: string;
  positioningStatement: string;
  motto?: string;
  mission: string;
  vision: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
    full: string;
  };
  phone: string;
  emails: {
    general: string;
    executiveDirector: string;
    researchDirector: string;
  };
  social: {
    facebook?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  foundedYear: number;
  copyright: string;
  defaultSeo: SEOData;
  updatedAt: string;
}

export interface Page extends ContentBase {
  title: string;
  excerpt?: string;
  body: string;
  bodyHtml?: string;
  template?: string;
  parentId?: string | null;
  order?: number;
  originalLegacyUrl?: string;
}

export interface PersonSocialLink {
  label: string;
  url: string;
}

export type PersonClaimStatus = 'unclaimed' | 'claimed';

export interface Person extends ContentBase {
  name: string;
  role: string;
  category: PersonCategory;
  affiliation?: string;
  bio: string;
  shortBio?: string;
  /** Signup allowlist — required for account claim */
  email?: string;
  phone?: string;
  photoId?: string | null;
  photoUrl?: string | null;
  researchInterests?: string[];
  socialLinks?: PersonSocialLink[];
  /** Set when a member Account claims this profile */
  accountId?: string | null;
  /** Derived convenience for admin badges; prefer deriving from accountId */
  claimStatus?: PersonClaimStatus;
  /** Public membership verification code, e.g. BKSR-00001M */
  verificationCode?: string | null;
  /** Current appointment season snapshot, e.g. 2025-2026 */
  appointmentYear?: string | null;
  order?: number;
  legacyRoleNote?: string;
  originalLegacyUrl?: string;
}

/** Year-based official role / appointment (BKSR-adapted committee history) */
export interface RoleAssignment {
  id: string;
  personId: string;
  role: string;
  /** Season label, e.g. 2025-2026 */
  year: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export type JoinApplicationStatus = 'pending' | 'approved' | 'rejected';

/** What the applicant wants to join as */
export type JoinInterestTrack =
  | 'research-team'
  | 'administrative-team'
  | 'distinguished-fellow'
  | 'other';

export interface JoinApplication {
  id: string;
  name: string;
  email: string;
  phone?: string;
  affiliation?: string;
  /** Current job / study title */
  currentRole?: string;
  /** Preferred committee section after approval */
  interestTrack?: JoinInterestTrack;
  researchInterests?: string;
  portfolioUrl?: string;
  city?: string;
  /** Motivation / full application note */
  message: string;
  /** Full dynamic answers from the CMS join form */
  answers?: Record<string, string | number | boolean>;
  status: JoinApplicationStatus;
  personId?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
}

export interface Achievement extends ContentBase {
  title: string;
  description?: string;
}

export interface AchievementAssignment {
  id: string;
  achievementId: string;
  personId: string;
  certificateCode?: string | null;
  notes?: string;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** Member-added (unverified) profile achievements */
export interface MemberAchievement {
  id: string;
  personId: string;
  title: string;
  description?: string;
  year?: string;
  createdAt: string;
  updatedAt: string;
}

export type PersonLinkEntityType =
  | 'event'
  | 'research'
  | 'publication'
  | 'activity';

/** Junction: Person ↔ Event / Research / Publication / Activity */
export interface PersonContentLink {
  id: string;
  personId: string;
  entityType: PersonLinkEntityType;
  entityId: string;
  /** e.g. speaker, moderator, author, lead, organizer, contributor */
  role: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchArea extends ContentBase {
  title: string;
  description: string;
  shortDescription?: string;
  order?: number;
  relatedProjectIds?: string[];
  relatedPublicationIds?: string[];
}

export interface ResearchProject extends ContentBase {
  title: string;
  summary: string;
  description?: string;
  /** Journal, book, conference, or source line under the title on /research */
  venue?: string | null;
  researchStatus: ResearchStatus;
  areaIds: string[];
  leadAuthorNames: string[];
  year?: number;
  startYear?: number;
  endYear?: number | null;
  publicationIds?: string[];
  themeCount?: number;
  /** Optional feature visual (may be prototype media) */
  featuredImageUrl?: string | null;
  /**
   * When true, appears in the featured card row on `/research`
   * (up to four; any category — ongoing, completed, etc.).
   */
  featuredOnResearchPage?: boolean;
  /** External journal / DOI / attached source — listing clicks open this, not an internal detail page */
  url?: string | null;
  originalLegacyUrl?: string;
}

/** Newspaper, television, and digital coverage of BKSR. Not a publication. */
export interface MediaClipping extends ContentBase {
  title: string;
  authors: string[];
  year: number;
  citation: string;
  /** Outlet name */
  venue?: string | null;
  /** External article, broadcast, or video URL */
  url?: string | null;
  abstract?: string | null;
  coverImageUrl?: string | null;
  language?: string | null;
}

export interface Publication extends ContentBase {
  title: string;
  type: PublicationType;
  authors: string[];
  year: number;
  citation: string;
  venue?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  doi?: string | null;
  url?: string | null;
  abstract?: string;
  /** Optional cover / report visual (may be prototype media) */
  coverImageUrl?: string | null;
  areaIds?: string[];
  projectId?: string | null;
  language?: string;
  originalLegacyUrl?: string;
}

export interface Activity extends ContentBase {
  title: string;
  type: ActivityType;
  summary: string;
  description: string;
  relatedEventIds?: string[];
  /** Optional section / card visual (may be prototype media) */
  imageUrl?: string | null;
  order?: number;
}

export interface NewsArticle extends ContentBase {
  title: string;
  excerpt: string;
  body: string;
  bodyHtml?: string;
  author?: string;
  categoryLabels?: string[];
  featuredImageId?: string | null;
  featuredImageUrl?: string | null;
  originalLegacyUrl?: string;
  language?: string;
}

export interface Event extends ContentBase {
  title: string;
  summary: string;
  description: string;
  eventStatus: EventStatus;
  startAt: string;
  endAt?: string | null;
  location?: string;
  isOnline?: boolean;
  registrationUrl?: string | null;
  /**
   * In-site registration form id (shared or dedicated).
   * Takes priority over a dedicated form whose entityId matches this event.
   */
  registrationFormId?: string | null;
  /** YouTube / archive recording when available */
  recordingUrl?: string | null;
  featuredImageUrl?: string | null;
  speakers?: string[];
  originalLegacyUrl?: string;
}

export type RegistrationFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'dropdown'
  | 'radio'
  | 'checkbox';

/**
 * `join` = sitewide /join application form.
 * `event` = event registration (dedicated or shared).
 * `vacancy` = Career / vacancy application (dedicated or shared).
 */
export type RegistrationFormEntityType =
  | 'event'
  | 'activity'
  | 'join'
  | 'vacancy';

/** dedicated = one entity; shared = reusable across many via *FormId pointers */
export type RegistrationFormLinkMode = 'dedicated' | 'shared';

export type RegistrationEntryStatus =
  | 'submitted'
  | 'approved'
  | 'rejected';

export interface RegistrationFormField {
  key: string;
  label: string;
  type: RegistrationFieldType;
  required?: boolean;
  options?: string[];
  order: number;
  placeholder?: string;
}

/** Dynamic registration / application form (events, vacancies, or /join) */
export interface RegistrationForm {
  id: string;
  slug: string;
  title: string;
  description?: string;
  /** Optional top banner / poster (Google Forms–style header image) */
  bannerImageUrl?: string | null;
  entityType: RegistrationFormEntityType;
  /**
   * Dedicated: event/vacancy/activity id (or `site` for join).
   * Shared: use SHARED_FORM_ENTITY_ID (`shared`).
   */
  entityId: string;
  /** Defaults to dedicated when omitted (legacy forms). */
  linkMode?: RegistrationFormLinkMode;
  fields: RegistrationFormField[];
  isOpen: boolean;
  requiresApproval: boolean;
  maxSubmissions?: number | null;
  closedMessage?: string;
  successMessage?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationEntry {
  id: string;
  formId: string;
  formSlug: string;
  data: Record<string, string | number | boolean>;
  status: RegistrationEntryStatus;
  /** Normalized email when the form includes an email field */
  email?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
}

export interface Notice extends ContentBase {
  title: string;
  summary: string;
  body: string;
  noticeType: NoticeType;
  deadlineAt?: string | null;
  /**
   * In-site application form for vacancy notices (Career at BKSR).
   * Shared or dedicated vacancy forms.
   */
  applicationFormId?: string | null;
  /**
   * External apply link (for example a Google Form).
   * Used when no in-site Career form is attached.
   */
  applicationUrl?: string | null;
  featuredImageUrl?: string | null;
  originalLegacyUrl?: string;
  language?: string;
}

export interface Resource extends ContentBase {
  title: string;
  summary: string;
  description: string;
  resourceType: ResourceType;
  topics?: string[];
  software?: string[];
  externalUrl?: string | null;
  notes?: string;
  originalLegacyUrl?: string;
}

export interface GalleryAlbum extends ContentBase {
  title: string;
  description?: string;
  coverImageId?: string | null;
  imageIds: string[];
  comingSoon?: boolean;
}

export interface GalleryImage extends Timestamps {
  id: string;
  albumId: string;
  title?: string;
  caption?: string;
  alt: string;
  mediaId?: string | null;
  url: string;
  order?: number;
  status: ContentStatus;
}

export interface MediaAsset extends Timestamps {
  id: string;
  kind: MediaKind;
  title: string;
  alt?: string;
  url: string;
  source?: string;
  width?: number;
  height?: number;
  credit?: string;
  status: ContentStatus;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  children?: NavigationItem[];
  external?: boolean;
  /** When false, hidden from public menus. Undefined = visible. */
  visible?: boolean;
  order: number;
}

export interface HomepageStat {
  id: string;
  label: string;
  value: string;
  /** Whether this figure is confirmed from legacy/org sources */
  verified: boolean;
  note?: string;
  order: number;
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title?: string;
  enabled: boolean;
  order: number;
  config?: Record<string, unknown>;
}

export interface HomepageConfig {
  id: string;
  heroEyebrow?: string;
  heroTitle: string;
  heroSubtitle: string;
  /** Optional hero media URL (prototype or authentic) */
  heroImageUrl?: string | null;
  heroCtas: { label: string; href: string; variant?: 'primary' | 'secondary' }[];
  directorPersonId: string;
  directorMessageExcerpt: string;
  featuredResearchProjectIds: string[];
  featuredPublicationIds: string[];
  featuredNewsIds: string[];
  featuredEventIds: string[];
  /** When set, homepage Focus Areas shows these areas in this order. Empty keeps every on-site area. */
  featuredResearchAreaIds?: string[];
  /** When set, homepage BKSR in Media shows these clippings in this order. Empty keeps published coverage. */
  featuredMediaClippingIds?: string[];
  /** When set, homepage team row shows these people in this order. Empty keeps the first published profiles. */
  featuredPersonIds?: string[];
  /** When set, homepage notices show these in this order. Empty keeps the latest published notices. */
  featuredNoticeIds?: string[];
  /** Temporary homepage quotes until real researcher statements replace them. */
  researcherQuotes?: {
    imageSrc: string;
    quote: string;
    name: string;
    role: string;
  }[];
  sections: HomepageSection[];
  stats: HomepageStat[];
  updatedAt: string;
}

export type ContentCollectionKey =
  | 'pages'
  | 'people'
  | 'researchAreas'
  | 'researchProjects'
  | 'publications'
  | 'mediaClippings'
  | 'activities'
  | 'news'
  | 'events'
  | 'notices'
  | 'resources'
  | 'galleryAlbums'
  | 'galleryImages'
  | 'media'
  | 'personContentLinks'
  | 'registrationForms'
  | 'registrationEntries'
  | 'roleAssignments'
  | 'joinApplications'
  | 'achievements'
  | 'achievementAssignments'
  | 'memberAchievements';

export interface ContentDatabase {
  version: number;
  siteSettings: SiteSettings;
  navigation: {
    main: NavigationItem[];
    footer: NavigationItem[];
    knowledgeHub: NavigationItem[];
  };
  homepage: HomepageConfig;
  pages: Page[];
  people: Person[];
  researchAreas: ResearchArea[];
  researchProjects: ResearchProject[];
  publications: Publication[];
  mediaClippings: MediaClipping[];
  activities: Activity[];
  news: NewsArticle[];
  events: Event[];
  notices: Notice[];
  resources: Resource[];
  galleryAlbums: GalleryAlbum[];
  galleryImages: GalleryImage[];
  media: MediaAsset[];
  personContentLinks: PersonContentLink[];
  registrationForms: RegistrationForm[];
  registrationEntries: RegistrationEntry[];
  roleAssignments: RoleAssignment[];
  joinApplications: JoinApplication[];
  achievements: Achievement[];
  achievementAssignments: AchievementAssignment[];
  memberAchievements: MemberAchievement[];
}

export type CollectionEntityMap = {
  pages: Page;
  people: Person;
  researchAreas: ResearchArea;
  researchProjects: ResearchProject;
  publications: Publication;
  mediaClippings: MediaClipping;
  activities: Activity;
  news: NewsArticle;
  events: Event;
  notices: Notice;
  resources: Resource;
  galleryAlbums: GalleryAlbum;
  galleryImages: GalleryImage;
  media: MediaAsset;
  personContentLinks: PersonContentLink;
  registrationForms: RegistrationForm;
  registrationEntries: RegistrationEntry;
  roleAssignments: RoleAssignment;
  joinApplications: JoinApplication;
  achievements: Achievement;
  achievementAssignments: AchievementAssignment;
  memberAchievements: MemberAchievement;
};

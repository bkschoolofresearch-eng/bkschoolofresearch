import type {
  Activity,
  ContentCollectionKey,
  ContentStatus,
  Event,
  GalleryAlbum,
  MediaAsset,
  NewsArticle,
  Notice,
  Page,
  Person,
  PersonCategory,
  PersonLinkEntityType,
  Publication,
  ResearchArea,
  ResearchProject,
  Resource,
} from '@/types/content';

export type AdminCollectionSlug =
  | 'publications'
  | 'bksr-in-media'
  | 'research'
  | 'news'
  | 'events'
  | 'notices'
  | 'people'
  | 'activities'
  | 'resources'
  | 'pages'
  | 'gallery'
  | 'media'
  | 'research-areas';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'tags'
  | 'checkbox'
  | 'datetime'
  | 'url'
  | 'image'
  | 'slug'
  | 'status'
  | 'body';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  tab?: 'content' | 'metadata' | 'media' | 'relations';
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  required?: boolean;
}

export interface CollectionConfig {
  slug: AdminCollectionSlug;
  key: ContentCollectionKey;
  singular: string;
  plural: string;
  addLabel: string;
  /** One-line explanation for non-developers */
  helpText?: string;
  /** e.g. Appears on /news */
  publicHint?: string;
  /** Field used as card thumbnail */
  cardImageKey?: string;
  /** Field used as card excerpt */
  cardExcerptKey?: string;
  searchFields: string[];
  previewPath?: (item: {
    slug?: string;
    status?: ContentStatus;
    researchStatus?: string;
    url?: string | null;
  }) => string | null;
  listColumns: {
    key: string;
    label: string;
    render?: 'status' | 'date' | 'text' | 'claim';
  }[];
  filters?: {
    name: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  fields: FieldDef[];
  defaults: () => Record<string, unknown>;
  getTitle: (item: Record<string, unknown>) => string;
  canDuplicate?: boolean;
  personLink?: {
    entityType: PersonLinkEntityType;
    defaultRole: string;
  };
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const personCategories: { value: PersonCategory; label: string }[] = [
  { value: 'executive-director', label: 'Executive Director' },
  { value: 'distinguished-fellow', label: 'Distinguished Fellow' },
  { value: 'research-team', label: 'Research Team' },
  { value: 'administrative-team', label: 'Administrative Team' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'other', label: 'Other' },
];

function nowIso() {
  return new Date().toISOString();
}

export const collectionConfigs: Record<AdminCollectionSlug, CollectionConfig> = {
  publications: {
    slug: 'publications',
    key: 'publications',
    singular: 'Publication',
    plural: 'Publications',
    addLabel: 'Add publication',
    helpText: 'Papers, reports, and briefs in the Publications library.',
    publicHint: '/publications',
    cardImageKey: 'coverImageUrl',
    cardExcerptKey: 'abstract',
    searchFields: ['title', 'citation', 'authors', 'venue'],
    previewPath: (item) => (item.slug ? `/publications/${item.slug}` : null),
    canDuplicate: false,
    personLink: { entityType: 'publication', defaultRole: 'author' },
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'year', label: 'Year' },
      { key: 'status', label: 'Status', render: 'status' },
      { key: 'updatedAt', label: 'Updated', render: 'date' },
    ],
    filters: [
      {
        name: 'status',
        label: 'Status',
        options: statusOptions,
      },
      {
        name: 'type',
        label: 'Type',
        options: [
          { value: 'journal', label: 'Journal' },
          { value: 'book-chapter', label: 'Book chapter' },
          { value: 'conference', label: 'Conference' },
          { value: 'opinion', label: 'Opinion' },
          { value: 'report', label: 'Report' },
          { value: 'newsletter', label: 'Newsletter' },
          { value: 'annual-report', label: 'Annual report' },
          { value: 'policy-brief', label: 'Policy brief' },
          { value: 'working-paper', label: 'Working paper' },
        ],
      },
    ],
    getTitle: (item) => String(item.title ?? 'Untitled publication'),
    defaults: () => ({
      title: '',
      slug: '',
      status: 'draft',
      type: 'journal',
      authors: [],
      year: new Date().getFullYear(),
      citation: '',
      venue: '',
      volume: '',
      issue: '',
      pages: '',
      publisher: '',
      abstract: '',
      language: '',
      coverImageUrl: null,
      areaIds: [],
      projectId: null,
      doi: null,
      url: null,
      seo: {},
    }),
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'content', required: true },
      { name: 'slug', label: 'Page URL name', type: 'slug', tab: 'content' },
      { name: 'status', label: 'Status', type: 'status', tab: 'content' },
      {
        name: 'type',
        label: 'Publication Type',
        type: 'select',
        tab: 'content',
        options: [
          { value: 'journal', label: 'Journal' },
          { value: 'book-chapter', label: 'Book chapter' },
          { value: 'conference', label: 'Conference' },
          { value: 'opinion', label: 'Opinion' },
          { value: 'report', label: 'Report' },
          { value: 'newsletter', label: 'Newsletter' },
          { value: 'annual-report', label: 'Annual report' },
          { value: 'policy-brief', label: 'Policy brief' },
          { value: 'working-paper', label: 'Working paper' },
        ],
      },
      { name: 'authors', label: 'Authors', type: 'tags', tab: 'content', help: 'Comma-separated' },
      { name: 'year', label: 'Year', type: 'number', tab: 'content' },
      { name: 'citation', label: 'Citation', type: 'textarea', tab: 'content', rows: 3 },
      { name: 'abstract', label: 'Abstract', type: 'body', tab: 'content', rows: 8 },
      { name: 'venue', label: 'Venue / Journal', type: 'text', tab: 'metadata' },
      { name: 'volume', label: 'Volume', type: 'text', tab: 'metadata' },
      { name: 'issue', label: 'Issue', type: 'text', tab: 'metadata' },
      { name: 'pages', label: 'Pages', type: 'text', tab: 'metadata' },
      { name: 'publisher', label: 'Publisher', type: 'text', tab: 'metadata' },
      { name: 'doi', label: 'DOI', type: 'text', tab: 'metadata' },
      { name: 'url', label: 'External URL', type: 'url', tab: 'metadata' },
      { name: 'coverImageUrl', label: 'Cover image', type: 'image', tab: 'media', help: 'Prototype or authentic cover visual' },
      { name: 'language', label: 'Language', type: 'text', tab: 'metadata' },
      {
        name: 'areaIds',
        label: 'Research Areas',
        type: 'tags',
        tab: 'relations',
        help: 'Focus area IDs from the Focus areas list (comma-separated)',
      },
      { name: 'projectId', label: 'Related research project', type: 'text', tab: 'relations' },
    ],
  },

  'bksr-in-media': {
    slug: 'bksr-in-media',
    key: 'mediaClippings',
    singular: 'Clipping',
    plural: 'BKSR in Media',
    addLabel: 'Add clipping',
    helpText: 'Newspaper, television, and online coverage of BKSR. These are not publications.',
    publicHint: '/media',
    cardImageKey: 'coverImageUrl',
    cardExcerptKey: 'abstract',
    searchFields: ['title', 'citation', 'authors', 'venue'],
    previewPath: (item) => item.url?.trim() || null,
    canDuplicate: false,
    listColumns: [
      { key: 'title', label: 'Headline' },
      { key: 'venue', label: 'Outlet' },
      { key: 'year', label: 'Year' },
      { key: 'status', label: 'Status', render: 'status' },
      { key: 'updatedAt', label: 'Updated', render: 'date' },
    ],
    filters: [{ name: 'status', label: 'Status', options: statusOptions }],
    getTitle: (item) => String(item.title ?? 'Untitled clipping'),
    defaults: () => ({
      title: '',
      slug: '',
      status: 'draft',
      authors: [],
      year: new Date().getFullYear(),
      citation: '',
      venue: '',
      abstract: '',
      language: '',
      coverImageUrl: null,
      url: null,
      seo: {},
    }),
    fields: [
      { name: 'title', label: 'Headline', type: 'text', tab: 'content', required: true },
      { name: 'slug', label: 'Page URL name', type: 'slug', tab: 'content' },
      { name: 'status', label: 'On the site', type: 'status', tab: 'content' },
      { name: 'venue', label: 'Outlet', type: 'text', tab: 'content', help: 'Newspaper, television channel, or site' },
      { name: 'url', label: 'Outlet link', type: 'url', tab: 'content', required: true },
      { name: 'authors', label: 'Byline', type: 'tags', tab: 'content', help: 'Comma-separated. Leave empty if the outlet has no byline.' },
      { name: 'year', label: 'Year', type: 'number', tab: 'content' },
      { name: 'publishedAt', label: 'Published date', type: 'datetime', tab: 'content' },
      { name: 'citation', label: 'Citation', type: 'textarea', tab: 'content', rows: 3 },
      { name: 'abstract', label: 'Short description', type: 'textarea', tab: 'content', rows: 4 },
      { name: 'language', label: 'Language', type: 'text', tab: 'metadata' },
      { name: 'coverImageUrl', label: 'Clipping image', type: 'image', tab: 'media' },
    ],
  },

  research: {
    slug: 'research',
    key: 'researchProjects',
    singular: 'Research item',
    plural: 'Research',
    addLabel: 'Add research',
    helpText:
      'Everything on /research. Pick Ongoing or Completed, fill the card fields visitors see, choose focus areas, and attach the journal or DOI link opened on click.',
    publicHint: '/research',
    cardImageKey: 'featuredImageUrl',
    cardExcerptKey: 'summary',
    searchFields: [
      'title',
      'summary',
      'venue',
      'leadAuthorNames',
      'url',
      'description',
    ],
    previewPath: () => '/research',
    canDuplicate: true,
    personLink: { entityType: 'research', defaultRole: 'author' },
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'researchStatus', label: 'Category' },
      { key: 'year', label: 'Year' },
      { key: 'status', label: 'Status', render: 'status' },
      { key: 'updatedAt', label: 'Updated', render: 'date' },
    ],
    filters: [
      { name: 'status', label: 'Status', options: statusOptions },
      {
        name: 'researchStatus',
        label: 'Category',
        options: [
          { value: 'ongoing', label: 'Ongoing' },
          { value: 'completed', label: 'Completed' },
          { value: 'planned', label: 'Planned' },
          { value: 'archived', label: 'Archived' },
        ],
      },
    ],
    getTitle: (item) => String(item.title ?? 'Untitled research'),
    defaults: () => ({
      title: '',
      slug: '',
      status: 'draft',
      summary: '',
      description: '',
      venue: '',
      researchStatus: 'ongoing',
      url: '',
      areaIds: [],
      leadAuthorNames: [],
      publicationIds: [],
      year: new Date().getFullYear(),
      startYear: null,
      endYear: null,
      featuredImageUrl: null,
      featuredOnResearchPage: false,
      seo: {},
    }),
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        tab: 'content',
        required: true,
        help: 'Main heading on the Research page card.',
      },
      {
        name: 'researchStatus',
        label: 'Research stage',
        type: 'select',
        tab: 'content',
        required: true,
        options: [
          { value: 'ongoing', label: 'Ongoing' },
          { value: 'completed', label: 'Completed' },
          { value: 'planned', label: 'Planned' },
          { value: 'archived', label: 'Archived' },
        ],
        help: 'Is the research still running or finished? (Not the same as showing it on the website.)',
      },
      {
        name: 'featuredOnResearchPage',
        label: 'Featured on Research page',
        type: 'checkbox',
        tab: 'content',
        help: 'Show in the featured card row at the top of /research (newest up to 4). Any category can be featured — not only Ongoing.',
      },
      {
        name: 'status',
        label: 'Show on website',
        type: 'status',
        tab: 'content',
        options: [
          { value: 'draft', label: 'Draft — not on site' },
          { value: 'published', label: 'On site' },
          { value: 'archived', label: 'Hidden' },
        ],
        help: 'On site = listed on /research. Draft = admin only. This is not “published in a journal”.',
      },
      {
        name: 'leadAuthorNames',
        label: 'Authors',
        type: 'tags',
        tab: 'content',
        placeholder: 'B. Kumar, P. Banik',
        help: 'Comma-separated names shown on the card.',
      },
      {
        name: 'year',
        label: 'Year',
        type: 'number',
        tab: 'content',
        help: 'Full display year (e.g. 2022), shown on the card and year plate.',
      },
      {
        name: 'venue',
        label: 'Venue / source line',
        type: 'text',
        tab: 'content',
        placeholder: 'SN Business and Economics, 6:328',
        help: 'Journal, book chapter, or conference line under the title. Prefer this over pasting a full citation.',
      },
      {
        name: 'summary',
        label: 'Short summary',
        type: 'textarea',
        tab: 'content',
        rows: 3,
        help: '1–3 sentences under the title when you want a plain blurb instead of (or as well as) the venue line.',
      },
      {
        name: 'url',
        label: 'External link (journal / DOI / source)',
        type: 'url',
        tab: 'content',
        placeholder: 'https://doi.org/… or journal page URL',
        help: 'Preferred click target for visitors. If empty, the site tries a linked Publications record’s URL/DOI, then a DOI found in Notes.',
      },
      {
        name: 'areaIds',
        label: 'Focus areas',
        type: 'multiselect',
        tab: 'content',
        help: 'Pick one or more. Manage the list under Focus areas in the sidebar.',
      },
      {
        name: 'description',
        label: 'Notes / full citation (optional)',
        type: 'body',
        tab: 'content',
        rows: 6,
        help: 'Optional team notes or a full citation. If Venue is empty, the site may pull a source line from text after the title here.',
      },
      {
        name: 'featuredImageUrl',
        label: 'Card image',
        type: 'image',
        tab: 'media',
        help: 'Optional cover photo. Without an image, the card shows category + year.',
      },
      {
        name: 'startYear',
        label: 'Start year',
        type: 'number',
        tab: 'metadata',
        help: 'Optional — when the work started.',
      },
      {
        name: 'endYear',
        label: 'End year',
        type: 'number',
        tab: 'metadata',
        help: 'Optional — leave empty for ongoing work.',
      },
      {
        name: 'slug',
        label: 'Internal name',
        type: 'slug',
        tab: 'metadata',
        help: 'Auto-fills from the title. For admin only — visitors do not see a detail URL.',
      },
      {
        name: 'publicationIds',
        label: 'Linked publications (optional)',
        type: 'multiselect',
        tab: 'relations',
        help: 'Connect library records under Publications if useful. The external link field above still controls where clicks go.',
      },
    ],
  },

  news: {
    slug: 'news',
    key: 'news',
    singular: 'News article',
    plural: 'News articles',
    addLabel: 'Write news article',
    helpText: 'Stories that appear on the News pages of the website.',
    publicHint: '/news',
    cardImageKey: 'featuredImageUrl',
    cardExcerptKey: 'excerpt',
    searchFields: ['title', 'excerpt', 'body', 'author'],
    previewPath: (item) => (item.slug ? `/news/${item.slug}` : null),
    canDuplicate: false,
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'status', label: 'Status', render: 'status' },
      { key: 'updatedAt', label: 'Updated', render: 'date' },
    ],
    filters: [{ name: 'status', label: 'Status', options: statusOptions }],
    getTitle: (item) => String(item.title ?? 'Untitled article'),
    defaults: () => ({
      title: '',
      slug: '',
      status: 'draft',
      excerpt: '',
      body: '',
      author: '',
      categoryLabels: [],
      featuredImageUrl: null,
      seo: {},
    }),
    fields: [
      { name: 'title', label: 'Headline', type: 'text', tab: 'content', required: true, help: 'Main title visitors see.' },
      { name: 'slug', label: 'Page URL name', type: 'slug', tab: 'content', help: 'Auto-fills from the headline. Used in /news/...' },
      { name: 'status', label: 'Status', type: 'status', tab: 'content' },
      { name: 'excerpt', label: 'Short summary', type: 'textarea', tab: 'content', rows: 3, help: '1-2 sentences for cards and previews.' },
      { name: 'body', label: 'Full article', type: 'body', tab: 'content', rows: 14, help: 'The complete article text.' },
      { name: 'author', label: 'Author name', type: 'text', tab: 'metadata' },
      { name: 'categoryLabels', label: 'Topics / tags', type: 'tags', tab: 'metadata', help: 'Comma-separated, e.g. Climate, Education' },
      { name: 'language', label: 'Language', type: 'text', tab: 'metadata', placeholder: 'en' },
      {
        name: 'featuredImageUrl',
        label: 'Featured image',
        type: 'image',
        tab: 'media',
        placeholder: 'https://... or /media/...',
        help: 'Paste a link from Photo & file library.',
      },
    ],
  },

  events: {
    slug: 'events',
    key: 'events',
    singular: 'Event',
    plural: 'Events',
    addLabel: 'Add event',
    helpText: 'Gatherings on the Events calendar - seminars, talks, workshops.',
    publicHint: '/events',
    cardImageKey: 'featuredImageUrl',
    cardExcerptKey: 'summary',
    searchFields: ['title', 'summary', 'location', 'speakers'],
    previewPath: (item) => (item.slug ? `/events/${item.slug}` : null),
    canDuplicate: false,
    personLink: { entityType: 'event', defaultRole: 'speaker' },
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'eventStatus', label: 'Event status' },
      { key: 'startAt', label: 'Starts', render: 'date' },
      { key: 'status', label: 'Status', render: 'status' },
    ],
    filters: [
      { name: 'status', label: 'Status', options: statusOptions },
      {
        name: 'eventStatus',
        label: 'Calendar',
        options: [
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'past', label: 'Past / archive' },
          { value: 'cancelled', label: 'Cancelled' },
        ],
      },
    ],
    getTitle: (item) => String(item.title ?? 'Untitled event'),
    defaults: () => ({
      title: '',
      slug: '',
      status: 'draft',
      summary: '',
      description: '',
      eventStatus: 'upcoming',
      startAt: nowIso(),
      endAt: null,
      location: '',
      isOnline: false,
      speakers: [],
      registrationUrl: null,
      registrationFormId: null,
      recordingUrl: null,
      featuredImageUrl: null,
      seo: {},
    }),
    fields: [
      { name: 'title', label: 'Event name', type: 'text', tab: 'content', required: true },
      { name: 'slug', label: 'Page URL name', type: 'slug', tab: 'content', help: 'Auto-fills from the name. Used in /events/...' },
      { name: 'status', label: 'Status', type: 'status', tab: 'content' },
      {
        name: 'eventStatus',
        label: 'On the calendar as',
        type: 'select',
        tab: 'content',
        options: [
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'past', label: 'Past / archive' },
          { value: 'cancelled', label: 'Cancelled' },
        ],
        help: 'Controls Upcoming vs Archive on the public events page.',
      },
      { name: 'summary', label: 'Short summary', type: 'textarea', tab: 'content', rows: 3, help: 'Shown on event cards.' },
      { name: 'description', label: 'Full details', type: 'body', tab: 'content', rows: 12, help: 'Agenda, speakers intro, practical info...' },
      { name: 'startAt', label: 'Starts', type: 'datetime', tab: 'metadata', required: true },
      { name: 'endAt', label: 'Ends', type: 'datetime', tab: 'metadata' },
      { name: 'location', label: 'Venue / place', type: 'text', tab: 'metadata' },
      { name: 'isOnline', label: 'This is an online event', type: 'checkbox', tab: 'metadata' },
      {
        name: 'registrationFormId',
        label: 'Registration form',
        type: 'select',
        tab: 'metadata',
        options: [{ value: '', label: 'None — use dedicated form or external link' }],
        help: 'Pick a form from Forms (shared or dedicated). Create forms under Events & applications → Forms.',
      },
      {
        name: 'registrationUrl',
        label: 'External registration link',
        type: 'url',
        tab: 'metadata',
        help: 'Optional fallback if no in-site form is attached.',
      },
      { name: 'recordingUrl', label: 'Recording / replay link', type: 'url', tab: 'metadata', help: 'YouTube or archive link after the event.' },
      { name: 'speakers', label: 'Speaker names', type: 'tags', tab: 'relations', help: 'Comma-separated names. You can also link people profiles below.' },
      {
        name: 'featuredImageUrl',
        label: 'Featured image',
        type: 'image',
        tab: 'media',
        help: 'Paste a link from Photo & file library.',
      },
    ],
  },

  notices: {
    slug: 'notices',
    key: 'notices',
    singular: 'Notice',
    plural: 'Notices',
    addLabel: 'Add notice',
    helpText: 'Announcements, vacancies, and deadlines on Notices.',
    publicHint: '/notices',
    cardImageKey: 'featuredImageUrl',
    cardExcerptKey: 'summary',
    searchFields: ['title', 'summary', 'body'],
    previewPath: (item) => (item.slug ? `/notices/${item.slug}` : null),
    canDuplicate: false,
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'noticeType', label: 'Type' },
      { key: 'status', label: 'Status', render: 'status' },
      { key: 'updatedAt', label: 'Updated', render: 'date' },
    ],
    filters: [
      { name: 'status', label: 'Status', options: statusOptions },
      {
        name: 'noticeType',
        label: 'Type',
        options: [
          { value: 'vacancy', label: 'Vacancy' },
          { value: 'announcement', label: 'Announcement' },
          { value: 'deadline', label: 'Deadline' },
          { value: 'general', label: 'General' },
        ],
      },
    ],
    getTitle: (item) => String(item.title ?? 'Untitled notice'),
    defaults: () => ({
      title: '',
      slug: '',
      status: 'draft',
      summary: '',
      body: '',
      noticeType: 'announcement',
      deadlineAt: null,
      applicationFormId: null,
      applicationUrl: null,
      featuredImageUrl: null,
      seo: {},
    }),
    fields: [
      { name: 'title', label: 'Notice title', type: 'text', tab: 'content', required: true },
      { name: 'slug', label: 'Page URL name', type: 'slug', tab: 'content' },
      { name: 'status', label: 'Status', type: 'status', tab: 'content' },
      {
        name: 'noticeType',
        label: 'Notice type',
        type: 'select',
        tab: 'content',
        options: [
          { value: 'vacancy', label: 'Vacancy / job' },
          { value: 'announcement', label: 'Announcement' },
          { value: 'deadline', label: 'Deadline' },
          { value: 'general', label: 'General' },
        ],
      },
      { name: 'summary', label: 'Short summary', type: 'textarea', tab: 'content', rows: 3 },
      { name: 'body', label: 'Full notice', type: 'body', tab: 'content', rows: 12 },
      { name: 'deadlineAt', label: 'Deadline date', type: 'datetime', tab: 'metadata' },
      {
        name: 'applicationFormId',
        label: 'Application form (Career)',
        type: 'select',
        tab: 'metadata',
        options: [{ value: '', label: 'None — create under Forms → Career form' }],
        help: 'For vacancy notices. Attach a shared or dedicated Career form so Apply works on Career / the notice page.',
      },
      { name: 'language', label: 'Language', type: 'text', tab: 'metadata' },
      {
        name: 'featuredImageUrl',
        label: 'Featured image',
        type: 'image',
        tab: 'media',
      },
    ],
  },

  people: {
    slug: 'people',
    key: 'people',
    singular: 'Person',
    plural: 'People',
    addLabel: 'Add team member',
    helpText: 'Profiles on the People directory and homepage team section.',
    publicHint: '/people',
    cardImageKey: 'photoUrl',
    cardExcerptKey: 'shortBio',
    searchFields: ['name', 'role', 'bio', 'affiliation', 'email'],
    previewPath: (item) => (item.slug ? `/people/${item.slug}` : null),
    canDuplicate: false,
    listColumns: [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'category', label: 'Category' },
      { key: 'claimStatus', label: 'Claim', render: 'claim' },
      { key: 'status', label: 'Status', render: 'status' },
    ],
    filters: [
      { name: 'status', label: 'Status', options: statusOptions },
      { name: 'category', label: 'Category', options: personCategories },
    ],
    getTitle: (item) => String(item.name ?? 'Untitled person'),
    defaults: () => ({
      name: '',
      slug: '',
      status: 'draft',
      role: '',
      category: 'research-team',
      bio: '',
      shortBio: '',
      email: '',
      researchInterests: [],
      socialLinks: [],
      photoUrl: null,
      accountId: null,
      claimStatus: 'unclaimed',
      verificationCode: null,
      appointmentYear: null,
      order: 99,
      seo: {},
    }),
    fields: [
      { name: 'name', label: 'Name', type: 'text', tab: 'content', required: true },
      { name: 'slug', label: 'URL slug', type: 'slug', tab: 'content' },
      // Reserved: executive-director, distinguished-fellows, research-team, administrative-team
      { name: 'status', label: 'Status', type: 'status', tab: 'content' },
      { name: 'role', label: 'Role', type: 'text', tab: 'content', help: 'Current role snapshot. Year history is managed under Role history.' },
      {
        name: 'appointmentYear',
        label: 'Current appointment year',
        type: 'text',
        tab: 'content',
        placeholder: '2025-2026',
        help: 'Season label for the current role (e.g. 2025-2026). Full history lives in Role history.',
      },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        tab: 'content',
        options: personCategories,
      },
      { name: 'shortBio', label: 'Short Bio', type: 'textarea', tab: 'content', rows: 3 },
      { name: 'bio', label: 'Biography', type: 'body', tab: 'content', rows: 12 },
      { name: 'affiliation', label: 'Affiliation', type: 'text', tab: 'metadata' },
      {
        name: 'email',
        label: 'Account invite email (allowlist)',
        type: 'text',
        tab: 'metadata',
        placeholder: 'name@example.org',
        help: 'Required for profile claim. Share /register - they must use this exact email. Cannot clear once claimed.',
      },
      {
        name: 'verificationCode',
        label: 'Public verification code',
        type: 'text',
        tab: 'metadata',
        help: 'Auto-assigned on create (BKSR-#####M). Public check at /verify.',
      },
      { name: 'phone', label: 'Phone', type: 'text', tab: 'metadata' },
      { name: 'order', label: 'Display Order', type: 'number', tab: 'metadata' },
      {
        name: 'researchInterests',
        label: 'Research Interests',
        type: 'tags',
        tab: 'relations',
      },
      { name: 'photoUrl', label: 'Photo', type: 'image', tab: 'media' },
    ],
  },

  activities: {
    slug: 'activities',
    key: 'activities',
    singular: 'Activity',
    plural: 'Activities',
    addLabel: 'Add programme',
    helpText: 'Programme cards under Activities (seminar, campaigns, talks...).',
    publicHint: '/activities',
    cardImageKey: 'imageUrl',
    cardExcerptKey: 'summary',
    searchFields: ['title', 'summary', 'description'],
    previewPath: (item) => (item.slug ? `/activities/${item.slug}` : null),
    canDuplicate: false,
    personLink: { entityType: 'activity', defaultRole: 'organizer' },
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status', render: 'status' },
      { key: 'updatedAt', label: 'Updated', render: 'date' },
    ],
    filters: [
      { name: 'status', label: 'Status', options: statusOptions },
      {
        name: 'type',
        label: 'Type',
        options: [
          { value: 'capacity-building', label: 'Capacity Building' },
          { value: 'research-talk', label: 'Policy & Academic Engagement' },
          { value: 'awareness-campaign', label: 'Community & Social Impact' },
          { value: 'innovation-showcasing', label: 'Innovation Showcasing (archive)' },
        ],
      },
    ],
    getTitle: (item) => String(item.title ?? 'Untitled activity'),
    defaults: () => ({
      title: '',
      slug: '',
      status: 'draft',
      type: 'capacity-building',
      summary: '',
      description: '',
      relatedEventIds: [],
      order: 99,
      seo: {},
    }),
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'content', required: true },
      { name: 'slug', label: 'Page URL name', type: 'slug', tab: 'content' },
      { name: 'status', label: 'Status', type: 'status', tab: 'content' },
      {
        name: 'type',
        label: 'Programme',
        type: 'select',
        tab: 'content',
        options: [
          { value: 'capacity-building', label: 'Capacity Building' },
          { value: 'research-talk', label: 'Policy & Academic Engagement' },
          { value: 'awareness-campaign', label: 'Community & Social Impact' },
          { value: 'innovation-showcasing', label: 'Innovation Showcasing (archive)' },
        ],
      },
      { name: 'summary', label: 'Summary', type: 'textarea', tab: 'content', rows: 3 },
      { name: 'description', label: 'Description', type: 'body', tab: 'content', rows: 10 },
      {
        name: 'imageUrl',
        label: 'Image',
        type: 'image',
        tab: 'media',
        help: 'Prototype or authentic programme visual',
      },
      { name: 'order', label: 'Display Order', type: 'number', tab: 'metadata' },
      {
        name: 'relatedEventIds',
        label: 'Related events',
        type: 'tags',
        tab: 'relations',
      },
    ],
  },

  resources: {
    slug: 'resources',
    key: 'resources',
    singular: 'Resource',
    plural: 'Resources',
    addLabel: 'Add resource',
    helpText: 'Guides and materials in the Knowledge Hub.',
    publicHint: '/resources',
    cardExcerptKey: 'summary',
    searchFields: ['title', 'summary', 'topics', 'software'],
    previewPath: (item) => (item.slug ? `/resources/${item.slug}` : null),
    canDuplicate: false,
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'resourceType', label: 'Type' },
      { key: 'status', label: 'Status', render: 'status' },
      { key: 'updatedAt', label: 'Updated', render: 'date' },
    ],
    filters: [
      { name: 'status', label: 'Status', options: statusOptions },
      {
        name: 'resourceType',
        label: 'Type',
        options: [
          { value: 'tutorial', label: 'Tutorial' },
          { value: 'video-series', label: 'Video series' },
          { value: 'archive', label: 'Archive' },
          { value: 'tool-guide', label: 'Tool guide' },
          { value: 'document', label: 'Document' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
    getTitle: (item) => String(item.title ?? 'Untitled resource'),
    defaults: () => ({
      title: '',
      slug: '',
      status: 'draft',
      summary: '',
      description: '',
      resourceType: 'tutorial',
      topics: [],
      software: [],
      externalUrl: null,
      seo: {},
    }),
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'content', required: true },
      { name: 'slug', label: 'Page URL name', type: 'slug', tab: 'content' },
      { name: 'status', label: 'Status', type: 'status', tab: 'content' },
      {
        name: 'resourceType',
        label: 'Resource Type',
        type: 'select',
        tab: 'content',
        options: [
          { value: 'tutorial', label: 'Tutorial' },
          { value: 'video-series', label: 'Video series' },
          { value: 'archive', label: 'Archive' },
          { value: 'tool-guide', label: 'Tool guide' },
          { value: 'document', label: 'Document' },
          { value: 'other', label: 'Other' },
        ],
      },
      { name: 'summary', label: 'Summary', type: 'textarea', tab: 'content', rows: 3 },
      { name: 'description', label: 'Description', type: 'body', tab: 'content', rows: 10 },
      { name: 'topics', label: 'Topics', type: 'tags', tab: 'metadata' },
      { name: 'software', label: 'Software', type: 'tags', tab: 'metadata' },
      { name: 'externalUrl', label: 'External URL', type: 'url', tab: 'media' },
      { name: 'notes', label: 'Notes', type: 'textarea', tab: 'metadata', rows: 3 },
    ],
  },

  pages: {
    slug: 'pages',
    key: 'pages',
    singular: 'Page',
    plural: 'Pages',
    addLabel: 'Add page',
    helpText: 'Legacy page records. About pages are written in the site code.',
    publicHint: '/contact',
    cardExcerptKey: 'excerpt',
    searchFields: ['title', 'excerpt', 'body'],
    previewPath: (item) => (item.slug ? `/${item.slug}` : null),
    canDuplicate: true,
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'template', label: 'Template' },
      { key: 'status', label: 'Status', render: 'status' },
      { key: 'updatedAt', label: 'Updated', render: 'date' },
    ],
    filters: [{ name: 'status', label: 'Status', options: statusOptions }],
    getTitle: (item) => String(item.title ?? 'Untitled page'),
    defaults: () => ({
      title: '',
      slug: '',
      status: 'draft',
      excerpt: '',
      body: '',
      template: 'default',
      order: 99,
      seo: {},
    }),
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'content', required: true },
      { name: 'slug', label: 'Page URL name', type: 'slug', tab: 'content' },
      { name: 'status', label: 'Status', type: 'status', tab: 'content' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', tab: 'content', rows: 3 },
      { name: 'body', label: 'Body', type: 'body', tab: 'content', rows: 14 },
      { name: 'template', label: 'Template', type: 'text', tab: 'metadata' },
      { name: 'order', label: 'Order', type: 'number', tab: 'metadata' },
      { name: 'parentId', label: 'Parent Page ID', type: 'text', tab: 'relations' },
    ],
  },

  gallery: {
    slug: 'gallery',
    key: 'galleryAlbums',
    singular: 'Gallery album',
    plural: 'Gallery albums',
    addLabel: 'Add album',
    helpText: 'Photo albums for the Gallery page.',
    publicHint: '/gallery',
    cardExcerptKey: 'description',
    searchFields: ['title', 'description'],
    previewPath: () => '/gallery',
    canDuplicate: true,
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'comingSoon', label: 'Coming soon' },
      { key: 'status', label: 'Status', render: 'status' },
      { key: 'updatedAt', label: 'Updated', render: 'date' },
    ],
    filters: [{ name: 'status', label: 'Status', options: statusOptions }],
    getTitle: (item) => String(item.title ?? 'Untitled album'),
    defaults: () => ({
      title: '',
      slug: '',
      status: 'draft',
      description: '',
      imageIds: [],
      comingSoon: true,
      seo: {},
    }),
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'content', required: true },
      { name: 'slug', label: 'Page URL name', type: 'slug', tab: 'content' },
      { name: 'status', label: 'Status', type: 'status', tab: 'content' },
      { name: 'description', label: 'Description', type: 'textarea', tab: 'content', rows: 4 },
      { name: 'comingSoon', label: 'Coming soon', type: 'checkbox', tab: 'metadata' },
      {
        name: 'imageIds',
        label: 'Image IDs',
        type: 'tags',
        tab: 'media',
        help: 'Gallery image IDs',
      },
      { name: 'coverImageId', label: 'Cover Image ID', type: 'text', tab: 'media' },
    ],
  },

  media: {
    slug: 'media',
    key: 'media',
    singular: 'Media file',
    plural: 'Media files',
    addLabel: 'Add media',
    helpText: 'Photos and files you reuse across the site. Prefer the Media Library page for uploads.',
    cardImageKey: 'url',
    cardExcerptKey: 'alt',
    searchFields: ['title', 'alt', 'url', 'credit'],
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'kind', label: 'Type' },
      { key: 'status', label: 'Status', render: 'status' },
      { key: 'updatedAt', label: 'Updated', render: 'date' },
    ],
    filters: [
      { name: 'status', label: 'Status', options: statusOptions },
      {
        name: 'kind',
        label: 'Kind',
        options: [
          { value: 'image', label: 'Image' },
          { value: 'video', label: 'Video' },
          { value: 'document', label: 'Document' },
          { value: 'audio', label: 'Audio' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
    getTitle: (item) => String(item.title ?? 'Untitled media'),
    defaults: () => ({
      title: '',
      kind: 'image',
      alt: '',
      url: '',
      status: 'published',
      credit: '',
      source: 'manual',
    }),
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'content', required: true },
      {
        name: 'kind',
        label: 'Type',
        type: 'select',
        tab: 'content',
        options: [
          { value: 'image', label: 'Image' },
          { value: 'video', label: 'Video' },
          { value: 'document', label: 'Document' },
          { value: 'audio', label: 'Audio' },
          { value: 'other', label: 'Other' },
        ],
      },
      { name: 'status', label: 'Status', type: 'status', tab: 'content' },
      { name: 'url', label: 'Image', type: 'image', tab: 'media', required: true },
      { name: 'alt', label: 'Alt text', type: 'text', tab: 'media' },
      { name: 'credit', label: 'Credit', type: 'text', tab: 'metadata' },
      { name: 'source', label: 'Source', type: 'text', tab: 'metadata' },
      { name: 'width', label: 'Width', type: 'number', tab: 'metadata' },
      { name: 'height', label: 'Height', type: 'number', tab: 'metadata' },
    ],
  },

  'research-areas': {
    slug: 'research-areas',
    key: 'researchAreas',
    singular: 'Focus area',
    plural: 'Focus areas',
    addLabel: 'Add focus area',
    helpText:
      'Categories used to filter research on /research and on the homepage Focus Areas section.',
    publicHint: '/research/areas',
    searchFields: ['title', 'description', 'shortDescription'],
    previewPath: () => '/research/areas',
    canDuplicate: false,
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'order', label: 'Order' },
      { key: 'status', label: 'Status', render: 'status' },
      { key: 'updatedAt', label: 'Updated', render: 'date' },
    ],
    filters: [{ name: 'status', label: 'Status', options: statusOptions }],
    getTitle: (item) => String(item.title ?? 'Untitled area'),
    defaults: () => ({
      title: '',
      slug: '',
      status: 'draft',
      description: '',
      shortDescription: '',
      order: 99,
      relatedProjectIds: [],
      relatedPublicationIds: [],
      seo: {},
    }),
    fields: [
      {
        name: 'title',
        label: 'Area name',
        type: 'text',
        tab: 'content',
        required: true,
        help: 'e.g. Environment and Climate',
      },
      {
        name: 'slug',
        label: 'Internal name',
        type: 'slug',
        tab: 'content',
        help: 'Auto-fills from the name.',
      },
      { name: 'status', label: 'Publish status', type: 'status', tab: 'content' },
      {
        name: 'shortDescription',
        label: 'Short line',
        type: 'textarea',
        tab: 'content',
        rows: 2,
        help: 'One short line for cards and filters.',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'body',
        tab: 'content',
        rows: 8,
      },
      {
        name: 'order',
        label: 'Display order',
        type: 'number',
        tab: 'metadata',
        help: 'Lower numbers appear first.',
      },
    ],
  },
};

export type CollectionItem =
  | Publication
  | ResearchProject
  | NewsArticle
  | Event
  | Notice
  | Person
  | Activity
  | Resource
  | Page
  | GalleryAlbum
  | MediaAsset
  | ResearchArea;


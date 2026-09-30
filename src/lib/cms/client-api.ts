'use client';

import type {
  CollectionEntityMap,
  ContentCollectionKey,
  ContentDatabase,
  HomepageConfig,
  SiteSettings,
} from '@/types/content';

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `Request failed (${res.status})`,
    );
  }
  return data;
}

/** Client → Next.js CMS API (Mongo-backed when CMS_DRIVER=mongo). */
export const cmsApi = {
  async getSession(): Promise<{ authenticated: boolean; apiEnabled: boolean }> {
    return parseJson(await fetch('/api/cms/session', { credentials: 'include' }));
  },

  async login(
    email: string,
    password: string,
  ): Promise<{
    step: 'otp' | 'done';
    maskedEmail?: string;
    mailSent?: boolean;
    devOtp?: string;
    mailError?: string;
  }> {
    return parseJson(
      await fetch('/api/cms/session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }),
    );
  },

  async verifyOtp(otp: string, remember = false): Promise<void> {
    await parseJson(
      await fetch('/api/cms/session/otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, remember }),
      }),
    );
  },

  async resendOtp(): Promise<{
    maskedEmail?: string;
    mailSent?: boolean;
    devOtp?: string;
    mailError?: string;
  }> {
    return parseJson(
      await fetch('/api/cms/session/otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resend: true }),
      }),
    );
  },

  async logout(): Promise<void> {
    await parseJson(
      await fetch('/api/cms/session', {
        method: 'DELETE',
        credentials: 'include',
      }),
    );
  },

  async health(): Promise<{
    ok: boolean;
    driver: string;
    apiEnabled: boolean;
    mongoConfigured: boolean;
    cloudinaryConfigured: boolean;
    resendConfigured: boolean;
    mode: string;
  }> {
    return parseJson(await fetch('/api/cms/health'));
  },

  async getDatabase(): Promise<ContentDatabase> {
    const data = await parseJson<{ database: ContentDatabase }>(
      await fetch('/api/cms', { credentials: 'include' }),
    );
    return data.database;
  },

  async listCollection<K extends ContentCollectionKey>(
    collection: K,
    params: {
      page?: number;
      pageSize?: number;
      q?: string;
      status?: string;
      researchStatus?: string;
      /** Publications library type filter → API search param `type` */
      publicationType?: string;
      yearFrom?: number;
      yearTo?: number;
      areaId?: string;
      featured?: boolean;
      hasLink?: boolean;
      eventStatus?: string;
      online?: boolean;
      hasRegistration?: boolean;
      noticeType?: string;
      hasApplication?: boolean;
      activityType?: string;
      resourceType?: string;
      software?: string;
      newsLanguage?: string;
      newsCategory?: string;
      clippingLanguage?: string;
      outlet?: string;
      sort?: string;
      facets?: boolean;
    } = {},
  ): Promise<{
    items: CollectionEntityMap[K][];
    total: number;
    page: number;
    pageSize: number;
    facets?: {
      total: number;
      published: number;
      featured?: number;
      withLink: number;
      byCategory?: Record<string, number>;
      byType?: Record<string, number>;
      byCalendar?: Record<string, number>;
      withRegistration?: number;
      withApplication?: number;
      bySoftware?: Record<string, number>;
      byLanguage?: Record<string, number>;
      byOutlet?: Record<string, number>;
      byStatus: { draft: number; published: number; archived: number };
    };
    options?: {
      years: number[];
      areas: Array<{ id: string; title: string }>;
    };
    related?: {
      publications?: Array<{
        id: string;
        url?: string | null;
        doi?: string | null;
        citation?: string | null;
      }>;
      researchAreas: Array<{ id: string; title: string }>;
    };
  }> {
    const search = new URLSearchParams();
    search.set('page', String(params.page ?? 1));
    search.set('limit', String(params.pageSize ?? 20));
    if (params.q) search.set('q', params.q);
    if (params.status) search.set('status', params.status);
    if (params.researchStatus) search.set('researchStatus', params.researchStatus);
    if (params.publicationType) search.set('type', params.publicationType);
    if (params.yearFrom != null) search.set('yearFrom', String(params.yearFrom));
    if (params.yearTo != null) search.set('yearTo', String(params.yearTo));
    if (params.areaId) search.set('areaId', params.areaId);
    if (params.featured === true) search.set('featured', '1');
    if (params.featured === false) search.set('featured', '0');
    if (params.hasLink === true) search.set('hasLink', '1');
    if (params.hasLink === false) search.set('hasLink', '0');
    if (params.eventStatus) search.set('eventStatus', params.eventStatus);
    if (params.online === true) search.set('online', '1');
    if (params.online === false) search.set('online', '0');
    if (params.hasRegistration === true) search.set('hasRegistration', '1');
    if (params.hasRegistration === false) search.set('hasRegistration', '0');
    if (params.noticeType) search.set('noticeType', params.noticeType);
    if (params.hasApplication === true) search.set('hasApplication', '1');
    if (params.hasApplication === false) search.set('hasApplication', '0');
    if (params.activityType) search.set('activityType', params.activityType);
    if (params.resourceType) search.set('resourceType', params.resourceType);
    if (params.software) search.set('software', params.software);
    if (params.newsLanguage) search.set('newsLanguage', params.newsLanguage);
    if (params.newsCategory) search.set('newsCategory', params.newsCategory);
    if (params.clippingLanguage) search.set('clippingLanguage', params.clippingLanguage);
    if (params.outlet) search.set('outlet', params.outlet);
    if (params.sort) search.set('sort', params.sort);
    if (params.facets) search.set('facets', '1');

    return parseJson(
      await fetch(`/api/cms/${collection}?${search.toString()}`, {
        credentials: 'include',
      }),
    );
  },

  async create<K extends ContentCollectionKey>(
    collection: K,
    input: Omit<CollectionEntityMap[K], 'id' | 'createdAt' | 'updatedAt'> &
      Partial<Pick<CollectionEntityMap[K], 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<CollectionEntityMap[K]> {
    const data = await parseJson<{ item: CollectionEntityMap[K] }>(
      await fetch(`/api/cms/${collection}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    );
    return data.item;
  },

  async update<K extends ContentCollectionKey>(
    collection: K,
    id: string,
    patch: Partial<CollectionEntityMap[K]>,
  ): Promise<CollectionEntityMap[K]> {
    const data = await parseJson<{ item: CollectionEntityMap[K] }>(
      await fetch(`/api/cms/${collection}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      }),
    );
    return data.item;
  },

  async remove(collection: ContentCollectionKey, id: string): Promise<void> {
    await parseJson(
      await fetch(`/api/cms/${collection}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      }),
    );
  },

  async removeMany(
    collection: ContentCollectionKey,
    options:
      | { ids: string[] }
      | {
          matchAll: true;
          q?: string;
          status?: string;
          researchStatus?: string;
          yearFrom?: number;
          yearTo?: number;
          areaId?: string;
          featured?: boolean;
          hasLink?: boolean;
        },
  ): Promise<{ deleted: number }> {
    const search = new URLSearchParams();
    if ('matchAll' in options && options.matchAll) {
      if (options.q) search.set('q', options.q);
      if (options.status) search.set('status', options.status);
      if (options.researchStatus) {
        search.set('researchStatus', options.researchStatus);
      }
      if (options.yearFrom != null) {
        search.set('yearFrom', String(options.yearFrom));
      }
      if (options.yearTo != null) search.set('yearTo', String(options.yearTo));
      if (options.areaId) search.set('areaId', options.areaId);
      if (options.featured === true) search.set('featured', '1');
      if (options.featured === false) search.set('featured', '0');
      if (options.hasLink === true) search.set('hasLink', '1');
      if (options.hasLink === false) search.set('hasLink', '0');
    }

    const qs = search.toString();
    return parseJson(
      await fetch(`/api/cms/${collection}${qs ? `?${qs}` : ''}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          'matchAll' in options && options.matchAll
            ? { matchAll: true }
            : { ids: 'ids' in options ? options.ids : [] },
        ),
      }),
    );
  },

  async duplicate<K extends ContentCollectionKey>(
    collection: K,
    id: string,
  ): Promise<CollectionEntityMap[K]> {
    const data = await parseJson<{ item: CollectionEntityMap[K] }>(
      await fetch(`/api/cms/${collection}/${id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      }),
    );
    return data.item;
  },

  async updateSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    const data = await parseJson<{ siteSettings: SiteSettings }>(
      await fetch('/api/cms/site-settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      }),
    );
    return data.siteSettings;
  },

  async updateHomepage(patch: Partial<HomepageConfig>): Promise<HomepageConfig> {
    const data = await parseJson<{ homepage: HomepageConfig }>(
      await fetch('/api/cms/homepage', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      }),
    );
    return data.homepage;
  },

  async updateNavigation(
    patch: Partial<ContentDatabase['navigation']>,
  ): Promise<ContentDatabase['navigation']> {
    const data = await parseJson<{ navigation: ContentDatabase['navigation'] }>(
      await fetch('/api/cms/navigation', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      }),
    );
    return data.navigation;
  },

  async seed(wipe = false): Promise<{ collections: number; documents: number }> {
    return parseJson(
      await fetch('/api/cms/seed', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wipe }),
      }),
    );
  },

  async uploadMedia(file: File, meta?: { title?: string; alt?: string; kind?: string }) {
    const form = new FormData();
    form.append('file', file);
    if (meta?.title) form.append('title', meta.title);
    if (meta?.alt) form.append('alt', meta.alt);
    if (meta?.kind) form.append('kind', meta.kind);

    return parseJson<{
      item: CollectionEntityMap['media'];
      storage: { publicId?: string; url: string; resourceType?: string };
    }>(
      await fetch('/api/media/upload', {
        method: 'POST',
        credentials: 'include',
        body: form,
      }),
    );
  },
};

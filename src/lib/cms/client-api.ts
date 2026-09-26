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

  async verifyOtp(otp: string): Promise<void> {
    await parseJson(
      await fetch('/api/cms/session/otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
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

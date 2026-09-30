'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cmsApi } from '@/lib/cms/client-api';
import type {
  CollectionEntityMap,
  ContentCollectionKey,
  ContentDatabase,
  HomepageConfig,
  SiteSettings,
} from '@/types/content';

interface CmsContextValue {
  database: ContentDatabase | null;
  /** Session checked (login screen vs shell). */
  ready: boolean;
  /** Full CMS snapshot still loading after auth. */
  contentLoading: boolean;
  mode: 'fs' | 'mongo';
  apiAuthenticated: boolean;
  refresh: () => Promise<void>;
  loginCms: (
    email: string,
    password: string,
  ) => Promise<{
    step: 'otp' | 'done';
    maskedEmail?: string;
    mailSent?: boolean;
    devOtp?: string;
    mailError?: string;
  }>;
  verifyCmsOtp: (otp: string, remember?: boolean) => Promise<void>;
  resendCmsOtp: () => Promise<{
    maskedEmail?: string;
    mailSent?: boolean;
    devOtp?: string;
    mailError?: string;
  }>;
  logoutCms: () => Promise<void>;
  createItem: <K extends ContentCollectionKey>(
    collection: K,
    input: Omit<CollectionEntityMap[K], 'id' | 'createdAt' | 'updatedAt'> &
      Partial<Pick<CollectionEntityMap[K], 'id' | 'createdAt' | 'updatedAt'>>,
  ) => Promise<CollectionEntityMap[K]>;
  updateItem: <K extends ContentCollectionKey>(
    collection: K,
    id: string,
    patch: Partial<CollectionEntityMap[K]>,
  ) => Promise<CollectionEntityMap[K] | undefined>;
  deleteItem: <K extends ContentCollectionKey>(
    collection: K,
    id: string,
  ) => Promise<void>;
  duplicateItem: <K extends ContentCollectionKey>(
    collection: K,
    id: string,
  ) => Promise<CollectionEntityMap[K] | undefined>;
  saveSiteSettings: (patch: Partial<SiteSettings>) => Promise<void>;
  saveHomepage: (patch: Partial<HomepageConfig>) => Promise<void>;
  saveNavigation: (
    patch: Partial<ContentDatabase['navigation']>,
  ) => Promise<void>;
  resetDemoData: () => Promise<void>;
  contentError: string | null;
}

const CmsContext = createContext<CmsContextValue | null>(null);

function patchCollection<K extends ContentCollectionKey>(
  db: ContentDatabase,
  collection: K,
  nextRows: CollectionEntityMap[K][],
): ContentDatabase {
  return { ...db, [collection]: nextRows };
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const [database, setDatabase] = useState<ContentDatabase | null>(null);
  const [ready, setReady] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [apiAuthenticated, setApiAuthenticated] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [mode, setMode] = useState<'fs' | 'mongo'>('fs');

  const loadDatabase = useCallback(async () => {
    setContentLoading(true);
    setContentError(null);
    try {
      const db = await cmsApi.getDatabase();
      setDatabase(db);
    } catch (error) {
      setDatabase(null);
      const raw = error instanceof Error ? error.message : '';
      setContentError(
        /querySrv|ECONNREFUSED|MongoServerSelection|timed out/i.test(raw)
          ? 'Signed in, but the content library could not be reached. Check the connection and try again.'
          : 'Signed in, but the content library did not load. Try again.',
      );
    } finally {
      setContentLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [session, health] = await Promise.all([
        cmsApi.getSession(),
        cmsApi.health().catch(() => null),
      ]);
      setApiAuthenticated(session.authenticated);
      if (health?.driver === 'mongo' || health?.mode === 'mongo') {
        setMode('mongo');
      } else {
        setMode('fs');
      }

      if (!session.authenticated) {
        setDatabase(null);
        setContentLoading(false);
        return;
      }

      await loadDatabase();
    } catch {
      setApiAuthenticated(false);
      setDatabase(null);
      setContentLoading(false);
    }
  }, [loadDatabase]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [session, health] = await Promise.all([
          cmsApi.getSession(),
          cmsApi.health().catch(() => null),
        ]);
        if (cancelled) return;
        setApiAuthenticated(session.authenticated);
        if (health?.driver === 'mongo' || health?.mode === 'mongo') {
          setMode('mongo');
        } else {
          setMode('fs');
        }
        setReady(true);

        if (!session.authenticated) {
          setDatabase(null);
          return;
        }

        await loadDatabase();
      } catch {
        if (cancelled) return;
        setApiAuthenticated(false);
        setDatabase(null);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadDatabase]);

  const loginCms = useCallback(
    async (email: string, password: string) => {
      const result = await cmsApi.login(email, password);
      if (result.step === 'done') {
        setApiAuthenticated(true);
        await loadDatabase();
      }
      return result;
    },
    [loadDatabase],
  );

  const verifyCmsOtp = useCallback(
    async (otp: string, remember = false) => {
      await cmsApi.verifyOtp(otp, remember);
      setApiAuthenticated(true);
      await loadDatabase();
    },
    [loadDatabase],
  );

  const resendCmsOtp = useCallback(async () => {
    return cmsApi.resendOtp();
  }, []);

  const logoutCms = useCallback(async () => {
    await cmsApi.logout();
    setApiAuthenticated(false);
    setDatabase(null);
    setContentLoading(false);
  }, []);

  const value = useMemo<CmsContextValue>(
    () => ({
      database,
      ready,
      contentLoading,
      mode,
      apiAuthenticated,
      refresh,
      loginCms,
      verifyCmsOtp,
      resendCmsOtp,
      logoutCms,
      createItem: async (collection, input) => {
        const item = await cmsApi.create(collection, input);
        setDatabase((prev) => {
          if (!prev) return prev;
          const rows = prev[collection] as CollectionEntityMap[typeof collection][];
          return patchCollection(prev, collection, [...rows, item]);
        });
        return item;
      },
      updateItem: async (collection, id, patch) => {
        const item = await cmsApi.update(collection, id, patch);
        if (!item) return undefined;
        setDatabase((prev) => {
          if (!prev) return prev;
          const rows = prev[collection] as CollectionEntityMap[typeof collection][];
          return patchCollection(
            prev,
            collection,
            rows.map((row) => (row.id === id ? item : row)),
          );
        });
        return item;
      },
      deleteItem: async (collection, id) => {
        await cmsApi.remove(collection, id);
        setDatabase((prev) => {
          if (!prev) return prev;
          const rows = prev[collection] as CollectionEntityMap[typeof collection][];
          return patchCollection(
            prev,
            collection,
            rows.filter((row) => row.id !== id),
          );
        });
      },
      duplicateItem: async (collection, id) => {
        const item = await cmsApi.duplicate(collection, id);
        if (!item) return undefined;
        setDatabase((prev) => {
          if (!prev) return prev;
          const rows = prev[collection] as CollectionEntityMap[typeof collection][];
          return patchCollection(prev, collection, [...rows, item]);
        });
        return item;
      },
      saveSiteSettings: async (patch) => {
        await cmsApi.updateSiteSettings(patch);
        setDatabase((prev) =>
          prev
            ? { ...prev, siteSettings: { ...prev.siteSettings, ...patch } }
            : prev,
        );
      },
      saveHomepage: async (patch) => {
        await cmsApi.updateHomepage(patch);
        setDatabase((prev) =>
          prev ? { ...prev, homepage: { ...prev.homepage, ...patch } } : prev,
        );
      },
      saveNavigation: async (patch) => {
        await cmsApi.updateNavigation(patch);
        setDatabase((prev) =>
          prev
            ? { ...prev, navigation: { ...prev.navigation, ...patch } }
            : prev,
        );
      },
      resetDemoData: async () => {
        await cmsApi.seed(true);
        await loadDatabase();
      },
      contentError,
    }),
    [
      database,
      ready,
      contentLoading,
      mode,
      apiAuthenticated,
      refresh,
      loginCms,
      verifyCmsOtp,
      resendCmsOtp,
      logoutCms,
      loadDatabase,
      contentError,
    ],
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error('useCms must be used within CmsProvider');
  return ctx;
}

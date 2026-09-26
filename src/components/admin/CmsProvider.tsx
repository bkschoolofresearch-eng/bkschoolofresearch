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
  ready: boolean;
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
  verifyCmsOtp: (otp: string) => Promise<void>;
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
}

const CmsContext = createContext<CmsContextValue | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [database, setDatabase] = useState<ContentDatabase | null>(null);
  const [ready, setReady] = useState(false);
  const [apiAuthenticated, setApiAuthenticated] = useState(false);
  const [mode, setMode] = useState<'fs' | 'mongo'>('fs');

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
        return;
      }

      const db = await cmsApi.getDatabase();
      setDatabase(db);
    } catch {
      setApiAuthenticated(false);
      setDatabase(null);
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setReady(true));
  }, [refresh]);

  const loginCms = useCallback(
    async (email: string, password: string) => {
      const result = await cmsApi.login(email, password);
      if (result.step === 'done') {
        setApiAuthenticated(true);
        await refresh();
      }
      return result;
    },
    [refresh],
  );

  const verifyCmsOtp = useCallback(
    async (otp: string) => {
      await cmsApi.verifyOtp(otp);
      setApiAuthenticated(true);
      await refresh();
    },
    [refresh],
  );

  const resendCmsOtp = useCallback(async () => {
    return cmsApi.resendOtp();
  }, []);

  const logoutCms = useCallback(async () => {
    await cmsApi.logout();
    setApiAuthenticated(false);
    setDatabase(null);
  }, []);

  const value = useMemo<CmsContextValue>(
    () => ({
      database,
      ready,
      mode,
      apiAuthenticated,
      refresh,
      loginCms,
      verifyCmsOtp,
      resendCmsOtp,
      logoutCms,
      createItem: async (collection, input) => {
        const item = await cmsApi.create(collection, input);
        await refresh();
        return item;
      },
      updateItem: async (collection, id, patch) => {
        const item = await cmsApi.update(collection, id, patch);
        await refresh();
        return item;
      },
      deleteItem: async (collection, id) => {
        await cmsApi.remove(collection, id);
        await refresh();
      },
      duplicateItem: async (collection, id) => {
        const item = await cmsApi.duplicate(collection, id);
        await refresh();
        return item;
      },
      saveSiteSettings: async (patch) => {
        await cmsApi.updateSiteSettings(patch);
        await refresh();
      },
      saveHomepage: async (patch) => {
        await cmsApi.updateHomepage(patch);
        await refresh();
      },
      saveNavigation: async (patch) => {
        await cmsApi.updateNavigation(patch);
        await refresh();
      },
      resetDemoData: async () => {
        await cmsApi.seed(true);
        await refresh();
      },
    }),
    [
      database,
      ready,
      mode,
      apiAuthenticated,
      refresh,
      loginCms,
      verifyCmsOtp,
      resendCmsOtp,
      logoutCms,
    ],
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error('useCms must be used within CmsProvider');
  return ctx;
}

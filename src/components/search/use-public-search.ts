'use client';

import { useEffect, useState } from 'react';
import type { SearchCategory } from '@/lib/cms/search';

export type PublicSearchItem = {
  id: string;
  category: Exclude<SearchCategory, 'all'>;
  title: string;
  href: string;
  excerpt: string;
};

export function usePublicSearch(
  query: string,
  category: SearchCategory = 'all',
  limit = 8,
) {
  const [items, setItems] = useState<PublicSearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setItems([]);
      setLoading(false);
      return;
    }

    setItems([]);
    setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q, limit: String(limit) });
        if (category !== 'all') params.set('category', category);
        const response = await fetch(`/api/public/search?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setItems([]);
          return;
        }
        const body = (await response.json()) as { items?: PublicSearchItem[] };
        setItems(Array.isArray(body.items) ? body.items : []);
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        setItems([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 160);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, category, limit]);

  return { items, loading };
}

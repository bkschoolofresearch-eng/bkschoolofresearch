'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import type { SearchCategory } from '@/lib/cms/search';
import { usePublicSearch } from '@/components/search/use-public-search';
import { cn } from '@/lib/utils';

const CATEGORIES: { label: string; value: SearchCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Publications', value: 'publications' },
  { label: 'Research', value: 'research' },
  { label: 'People', value: 'people' },
  { label: 'News', value: 'news' },
  { label: 'Events', value: 'events' },
  { label: 'Notices', value: 'notices' },
  { label: 'Resources', value: 'resources' },
  { label: 'BKSR in Media', value: 'media' },
];

type SearchPanelProps = {
  initialQuery?: string;
  initialCategory?: string;
};

export function SearchPanel({
  initialQuery = '',
  initialCategory = 'all',
}: SearchPanelProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchCategory>(
    (CATEGORIES.some((c) => c.value === initialCategory)
      ? initialCategory
      : 'all') as SearchCategory,
  );

  const { items: results, loading } = usePublicSearch(query, category, 20);

  function syncUrl(nextQuery: string, nextCategory: SearchCategory) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set('q', nextQuery.trim());
    if (nextCategory !== 'all') params.set('category', nextCategory);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/search?${qs}` : '/search');
    });
  }

  return (
    <div>
      <label className="block">
        <span className="sr-only">Search</span>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              syncUrl(value, category);
            }}
            placeholder="Search publications, research, people…"
            className="h-14 w-full border border-border bg-paper pl-12 pr-4 font-sans text-base text-ink outline-none focus:border-accent"
            autoFocus
          />
        </div>
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setCategory(item.value);
              syncUrl(query, item.value);
            }}
            className={cn(
              'border px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.12em] transition-colors',
              category === item.value
                ? 'border-accent bg-accent text-paper'
                : 'border-border text-muted hover:border-ink hover:text-ink',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {!query.trim() ? (
          <p className="text-base text-muted">
            Enter a keyword to search the public archive.
          </p>
        ) : loading && results.length === 0 ? (
          <p className="text-base text-muted">Searching…</p>
        ) : results.length === 0 ? (
          <p className="text-base text-muted">
            No results for “{query.trim()}”.
          </p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {results.map((item) => (
              <li key={`${item.category}-${item.id}`} className="py-5">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  {item.category}
                </p>
                <Link
                  href={item.href}
                  {...(item.href.startsWith('http')
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="mt-1 block font-display text-2xl text-ink transition-colors hover:text-accent"
                >
                  {item.title}
                </Link>
                {item.excerpt ? (
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted line-clamp-2">
                    {item.excerpt}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

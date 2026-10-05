'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import type { SearchCategory } from '@/lib/cms/search';
import { usePublicSearch } from '@/components/search/use-public-search';
import { cn } from '@/lib/utils';

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

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

const CATEGORY_LABELS: Record<string, string> = {
  publications: 'Publication',
  research: 'Research',
  people: 'People',
  news: 'News',
  events: 'Event',
  notices: 'Notice',
  resources: 'Resource',
  media: 'BKSR in Media',
  pages: 'Page',
};

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [active, setActive] = useState(0);
  const { items: results, loading } = usePublicSearch(query, category, 8);

  useEffect(() => {
    setActive(0);
  }, [query, category, results]);

  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [active, results]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setCategory('all');
    }
  }, [open]);

  function openResult(href: string) {
    onClose();
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    router.push(href);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => Math.min(results.length - 1, index + 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
      return;
    }
    if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      openResult(results[active].href);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/70 px-3 pt-[8vh] backdrop-blur-md sm:px-6 sm:pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Site search"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-[1.35rem] border border-paper/10 bg-paper shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)] sm:max-w-2xl sm:rounded-[1.75rem]">
        <div className="flex items-center gap-3 px-4 pt-4 sm:gap-3.5 sm:px-5 sm:pt-5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-ink/10 bg-surface-subtle px-3.5 py-2.5 sm:px-4 sm:py-3">
            <Search
              className="size-4 shrink-0 text-muted sm:size-[1.05rem]"
              strokeWidth={2}
              aria-hidden
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the archive…"
              className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-muted/75 sm:text-[0.9375rem]"
              aria-label="Search query"
              aria-autocomplete="list"
              aria-controls="site-search-suggestions"
              aria-activedescendant={
                results[active] ? `site-search-option-${results[active].id}` : undefined
              }
              onKeyDown={onInputKeyDown}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-3.5" strokeWidth={2.25} aria-hidden />
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-ink/10 text-muted transition-colors hover:border-ink/25 hover:text-ink"
            aria-label="Close search"
          >
            <X className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div
          data-lenis-prevent
          className="mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mt-4 sm:gap-2 sm:px-5 [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Search categories"
        >
          {CATEGORIES.map((item) => {
            const selected = category === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setCategory(item.value)}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 font-sans text-[0.6875rem] font-semibold tracking-[0.04em] transition-colors sm:px-3.5 sm:py-2 sm:text-xs',
                  selected
                    ? 'border-ink bg-ink text-paper'
                    : 'border-ink/10 bg-white text-ink/65 hover:border-ink/25 hover:text-ink',
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <ul
          id="site-search-suggestions"
          ref={listRef}
          role="listbox"
          data-lenis-prevent
          className="mt-2 max-h-[min(22rem,48vh)] overflow-y-auto overscroll-contain px-2 pb-2 sm:mt-3 sm:max-h-[min(24rem,50vh)] sm:px-3 sm:pb-3 [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-ink/20"
        >
          {!query.trim() ? (
            <li className="px-3 py-10 text-center font-instrument text-sm text-muted sm:py-12">
              Start typing to see suggestions.
            </li>
          ) : loading && results.length === 0 ? (
            <li className="px-3 py-10 text-center font-instrument text-sm text-muted sm:py-12">
              Searching…
            </li>
          ) : results.length === 0 ? (
            <li className="px-3 py-10 text-center font-instrument text-sm text-muted sm:py-12">
              No matches for “{query}”.
            </li>
          ) : (
            results.map((result, index) => {
              const opensOutlet = result.href.startsWith('http');
              const selected = index === active;
              return (
              <li key={`${result.category}-${result.id}`} role="presentation">
                <Link
                  id={`site-search-option-${result.id}`}
                  role="option"
                  aria-selected={selected}
                  href={result.href}
                  onMouseEnter={() => setActive(index)}
                  onClick={onClose}
                  {...(opensOutlet
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className={cn(
                    'group block rounded-[1rem] px-3 py-3 transition-colors sm:rounded-[1.15rem] sm:px-3.5 sm:py-3.5',
                    selected ? 'bg-surface-subtle' : 'hover:bg-surface-subtle',
                  )}
                >
                  <span className="font-sans text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    {CATEGORY_LABELS[result.category] ?? result.category}
                  </span>
                  <span className="mt-1 block font-instrument text-[0.975rem] font-medium leading-snug text-ink transition-colors group-hover:text-accent sm:text-base">
                    {result.title}
                  </span>
                  {result.excerpt ? (
                    <span className="mt-1 line-clamp-2 block text-[0.8125rem] leading-relaxed text-muted">
                      {result.excerpt}
                    </span>
                  ) : null}
                </Link>
              </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t border-ink/8 px-4 py-2.5 sm:px-5 sm:py-3">
          <p className="font-sans text-[0.6875rem] text-muted">
            <kbd className="mr-1 inline-flex min-w-[1.5rem] items-center justify-center rounded-md border border-ink/10 bg-surface-subtle px-1.5 py-0.5 font-sans text-[0.625rem] font-semibold text-ink/70">
              Esc
            </kbd>
            close
          </p>
          {results.length > 0 ? (
            <p className="font-sans text-[0.6875rem] tabular-nums text-muted">
              {results.length} result{results.length === 1 ? '' : 's'}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

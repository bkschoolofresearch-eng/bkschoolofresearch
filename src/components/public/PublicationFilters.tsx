'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { getPublicationCoverUrl } from '@/lib/content/prototype-media';
import { PUBLICATION_TYPE_LABELS } from '@/lib/public/labels';
import type { PublicationType, ResearchArea } from '@/types/content';
import { cn } from '@/lib/utils';

type FilterableItem = {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  year: number;
  citation: string;
  venue?: string | null;
  url?: string | null;
  coverImageUrl?: string | null;
  areaIds?: string[];
  type?: PublicationType;
};

type Props = {
  publications: FilterableItem[];
  areas: ResearchArea[];
  initialType?: PublicationType | 'all';
  /** When true, type cannot change (used on /publications/journals etc.) */
  lockType?: boolean;
  /** Outlet clippings open the external URL instead of a publication page. */
  external?: boolean;
};

const chipScroll =
  'flex w-max max-w-none gap-2 sm:w-auto sm:flex-wrap';
const chipScroller =
  '-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden';

function SoftSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
      <span className="relative mt-2.5 block">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-full border border-ink/10 bg-white py-2.5 pl-4 pr-9 font-sans text-sm font-medium text-ink outline-none transition-colors focus-visible:border-ink/35"
        >
          {children}
        </select>
        <span
          className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-muted"
          aria-hidden
        >
          ▾
        </span>
      </span>
    </label>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border px-3.5 py-2 font-sans text-xs transition-[background-color,border-color,color,box-shadow] duration-200 sm:px-4 sm:py-2.5 sm:text-[0.8125rem]',
        active
          ? 'border-ink bg-ink text-paper shadow-[0_10px_28px_-18px_rgba(13,39,69,0.55)]'
          : 'border-ink/12 bg-white text-ink/70 hover:border-ink/30 hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

export function PublicationFilters({
  publications,
  areas,
  initialType = 'all',
  lockType = false,
  external = false,
}: Props) {
  const baseId = useId();
  const [type, setType] = useState(initialType);
  const [area, setArea] = useState('all');
  const [year, setYear] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [refineOpen, setRefineOpen] = useState(false);

  const scoped = useMemo(() => {
    if (external) return publications;
    if (lockType && initialType !== 'all') {
      return publications.filter((item) => item.type === initialType);
    }
    return publications;
  }, [publications, lockType, initialType, external]);

  const years = useMemo(
    () =>
      Array.from(new Set(scoped.map((item) => item.year))).sort((a, b) => b - a),
    [scoped],
  );

  const typeOptions = useMemo(() => {
    const used = new Set(scoped.map((item) => item.type));
    return (Object.keys(PUBLICATION_TYPE_LABELS) as PublicationType[]).filter(
      (value) => used.has(value),
    );
  }, [scoped]);

  const areaOptions = useMemo(() => {
    const used = new Set(scoped.flatMap((item) => item.areaIds ?? []));
    return areas.filter((item) => used.has(item.id));
  }, [areas, scoped]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return scoped
      .filter((item) => {
        if (!lockType && type !== 'all' && item.type !== type) return false;
        if (area !== 'all' && !(item.areaIds ?? []).includes(area)) return false;
        if (year !== 'all' && String(item.year) !== year) return false;
        if (needle) {
          const hay = [
            item.title,
            item.citation,
            item.venue,
            item.type ? PUBLICATION_TYPE_LABELS[item.type] : '',
            ...item.authors,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      })
      .sort((a, b) => (sort === 'newest' ? b.year - a.year : a.year - b.year));
  }, [scoped, lockType, type, area, year, query, sort]);

  const activeRefineCount =
    (area !== 'all' ? 1 : 0) + (year !== 'all' ? 1 : 0) + (query.trim() ? 1 : 0);

  const hasActiveFilters =
    (!lockType && type !== 'all') ||
    area !== 'all' ||
    year !== 'all' ||
    query.trim().length > 0;

  const countLabel = external
    ? `${filtered.length} press coverage${filtered.length === 1 ? '' : 's'}`
    : lockType && initialType !== 'all'
      ? `${filtered.length} ${PUBLICATION_TYPE_LABELS[initialType].toLowerCase()}${filtered.length === 1 ? '' : 's'}`
      : `${filtered.length} publication${filtered.length === 1 ? '' : 's'}`;

  const clearFilters = () => {
    if (!lockType) setType('all');
    setArea('all');
    setYear('all');
    setQuery('');
  };

  useEffect(() => {
    if (!refineOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRefineOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [refineOpen]);

  const renderSearchField = () => (
    <label className="relative block">
      <span className="sr-only">
        {external ? 'Search coverage' : 'Search publications'}
      </span>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
        strokeWidth={2}
        aria-hidden
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Title or author…"
        className="w-full rounded-full border border-ink/10 bg-white py-2.5 pl-10 pr-10 font-sans text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus-visible:border-ink/35"
      />
      {query ? (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          aria-label="Clear search"
        >
          <X className="size-3.5" strokeWidth={2.25} />
        </button>
      ) : null}
    </label>
  );

  const typeChipRow = !lockType ? (
    <div className={chipScroller}>
      <div className={chipScroll} role="group" aria-label="Publication type">
        <FilterChip active={type === 'all'} onClick={() => setType('all')}>
          All types
        </FilterChip>
        {typeOptions.map((value) => (
          <FilterChip
            key={value}
            active={type === value}
            onClick={() => setType(value)}
          >
            {PUBLICATION_TYPE_LABELS[value]}
          </FilterChip>
        ))}
      </div>
    </div>
  ) : null;

  const desktopTypeList = !lockType ? (
    <div>
      <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
        Type
      </p>
      <div
        role="group"
        aria-label="Publication type"
        className="mt-3 flex flex-col gap-1"
      >
        <button
          type="button"
          aria-pressed={type === 'all'}
          onClick={() => setType('all')}
          className={cn(
            'rounded-full px-3.5 py-2 text-left font-sans text-sm transition-colors',
            type === 'all'
              ? 'bg-ink font-semibold text-paper'
              : 'font-medium text-muted hover:bg-ink/4 hover:text-ink',
          )}
        >
          All types
        </button>
        {typeOptions.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={type === value}
            onClick={() => setType(value)}
            className={cn(
              'rounded-full px-3.5 py-2 text-left font-sans text-sm transition-colors',
              type === value
                ? 'bg-ink font-semibold text-paper'
                : 'font-medium text-muted hover:bg-ink/4 hover:text-ink',
            )}
          >
            {PUBLICATION_TYPE_LABELS[value]}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  const refineFields = (
    <div className="space-y-5">
      <SoftSelect
        id={`${baseId}-area`}
        label="Area"
        value={area}
        onChange={setArea}
      >
        <option value="all">All areas</option>
        {areaOptions.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </SoftSelect>

      <SoftSelect
        id={`${baseId}-year`}
        label="Year"
        value={year}
        onChange={setYear}
      >
        <option value="all">All years</option>
        {years.map((value) => (
          <option key={value} value={String(value)}>
            {value}
          </option>
        ))}
      </SoftSelect>

      <div>
        <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
          Sort
        </p>
        <div
          role="group"
          aria-label="Sort publications"
          className="mt-2.5 inline-flex w-full items-center rounded-full border border-ink/10 bg-white p-1"
        >
          {(
            [
              { value: 'newest', label: 'Newest' },
              { value: 'oldest', label: 'Oldest' },
            ] as const
          ).map((option) => {
            const active = sort === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setSort(option.value)}
                className={cn(
                  'flex-1 rounded-full px-3.5 py-2 font-sans text-xs font-semibold tracking-[0.02em] transition-colors',
                  active
                    ? 'bg-ink text-paper'
                    : 'text-muted hover:text-ink',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-14 xl:gap-16">
      {/* Desktop sidebar */}
      <aside
        data-lenis-prevent
        className="hidden lg:sticky lg:top-28 lg:block lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pr-1 scrollbar-gutter-stable"
      >
        <div className="space-y-7 rounded-3xl border border-ink/8 bg-surface-subtle p-5 xl:p-6">
          <div>
            <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
              Search
            </p>
            <div className="mt-3">{renderSearchField()}</div>
          </div>

          {desktopTypeList}

          <SoftSelect
            id={`${baseId}-area-desktop`}
            label="Area"
            value={area}
            onChange={setArea}
          >
            <option value="all">All areas</option>
            {areaOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </SoftSelect>

          <SoftSelect
            id={`${baseId}-year-desktop`}
            label="Year"
            value={year}
            onChange={setYear}
          >
            <option value="all">All years</option>
            {years.map((value) => (
              <option key={value} value={String(value)}>
                {value}
              </option>
            ))}
          </SoftSelect>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent transition-colors hover:text-ink"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile / tablet controls */}
        <div className="space-y-3.5 lg:hidden">
          {renderSearchField()}
          {typeChipRow}

          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border pb-3.5">
            <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
              {countLabel}
            </p>
            <div className="flex items-center gap-2">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full px-2.5 py-1.5 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink"
                >
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setRefineOpen((open) => !open)}
                aria-expanded={refineOpen}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] transition-colors',
                  refineOpen || activeRefineCount
                    ? 'border-ink bg-ink text-paper'
                    : 'border-ink/15 bg-white text-ink/75',
                )}
              >
                <SlidersHorizontal className="size-3" strokeWidth={2.25} />
                Refine
                {activeRefineCount ? (
                  <span className="tabular-nums">{activeRefineCount}</span>
                ) : null}
              </button>
            </div>
          </div>

          {refineOpen ? (
            <div className="rounded-[1.35rem] border border-ink/8 bg-surface-subtle p-4 sm:p-5">
              {refineFields}
            </div>
          ) : null}
        </div>

        <div className="mt-0 hidden items-center justify-between gap-4 border-b border-border pb-4 lg:mt-0 lg:flex">
          <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
            {countLabel}
          </p>
          <div
            role="group"
            aria-label="Sort publications"
            className="inline-flex items-center rounded-full border border-ink/10 bg-white p-1"
          >
            {(
              [
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
              ] as const
            ).map((option) => {
              const active = sort === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSort(option.value)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold tracking-[0.02em] transition-colors',
                    active
                      ? 'bg-ink text-paper'
                      : 'text-muted hover:text-ink',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length ? (
          <ul className="divide-y divide-border">
            {filtered.map((item) => {
              const cover = getPublicationCoverUrl(item);
              const outletUrl = item.url?.trim() ?? '';
              const href =
                external && outletUrl ? outletUrl : `/publications/${item.slug}`;
              const opensOutlet = external && Boolean(outletUrl);
              return (
                <li key={item.id}>
                  <Link
                    href={href}
                    {...(opensOutlet
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="group grid grid-cols-[4.25rem_minmax(0,1fr)] gap-4 py-6 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-7 sm:py-8"
                  >
                    <span
                      className="relative aspect-3/4 overflow-hidden rounded-[0.65rem] border border-ink/8 bg-surface sm:rounded-none sm:border-border"
                      aria-hidden
                    >
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt=""
                          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                        />
                      ) : (
                        <span className="flex h-full flex-col justify-between p-2">
                          <span className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted">
                            {item.year}
                          </span>
                          <span className="font-display text-lg leading-none text-ink/30">
                            {String(item.year).slice(2)}
                          </span>
                        </span>
                      )}
                    </span>

                    <span className="min-w-0 self-center sm:self-auto">
                      <span className="font-sans text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted sm:text-[0.6875rem] sm:tracking-[0.16em]">
                        {lockType || external
                          ? item.venue ||
                            (item.type ? PUBLICATION_TYPE_LABELS[item.type] : 'Coverage')
                          : item.type
                            ? PUBLICATION_TYPE_LABELS[item.type]
                            : 'Coverage'}
                        <span className="mx-1.5 text-border sm:mx-2" aria-hidden>
                          ·
                        </span>
                        {item.year}
                      </span>
                      <span className="mt-1.5 block font-display text-lg leading-snug text-ink transition-colors group-hover:text-accent sm:mt-2.5 sm:text-[1.35rem] md:text-2xl">
                        {item.title}
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-muted sm:mt-2.5">
                        {item.authors.join(', ')}
                      </span>
                      {item.venue && !lockType && !external ? (
                        <span className="mt-1 hidden font-serif text-sm italic leading-snug text-body/80 sm:mt-1.5 sm:block">
                          {item.venue}
                        </span>
                      ) : null}
                      <span className="mt-3 inline-flex items-center gap-1.5 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent sm:mt-4 sm:opacity-0 sm:transition-opacity sm:duration-200 sm:group-hover:opacity-100 motion-reduce:opacity-100">
                        View
                        <span aria-hidden>→</span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title={external ? 'No matching coverage' : 'No matching publications'}
            description={
              external
                ? 'Try a different year or keyword.'
                : 'Try a different type, year, area, or keyword.'
            }
          />
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  ResearchProjectAnchor,
  researchProjectHref,
} from '@/components/editorial/ResearchFeature';
import { ResearchProjectMedia } from '@/components/editorial/ResearchProjectMedia';
import { EmptyState } from '@/components/ui/EmptyState';
import { researchProjectVenueLine } from '@/lib/content/research-links';
import { RESEARCH_STATUS_LABELS } from '@/lib/public/labels';
import type {
  ResearchArea,
  ResearchProject,
  ResearchStatus,
} from '@/types/content';
import { cn } from '@/lib/utils';

type Props = {
  projects: ResearchProject[];
  areas: ResearchArea[];
  initialStatus?: ResearchStatus | 'all';
  /** Area id or slug from ?area= */
  initialArea?: string;
  lockStatus?: boolean;
  /** Keep ?area= in sync with the active focus-area filter */
  syncAreaToUrl?: boolean;
};

function resolveAreaFilterId(
  areas: ResearchArea[],
  initial?: string,
): string {
  const raw = initial?.trim();
  if (!raw || raw === 'all') return 'all';
  if (areas.some((item) => item.id === raw)) return raw;
  const bySlug = areas.find((item) => item.slug === raw);
  return bySlug?.id ?? 'all';
}

const chipScroll = 'flex w-max max-w-none gap-2 sm:w-auto sm:flex-wrap';
const chipScroller =
  '-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden';

const STATUS_ORDER: ResearchStatus[] = [
  'ongoing',
  'completed',
  'planned',
  'archived',
];

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

export function ResearchFilters({
  projects,
  areas,
  initialStatus = 'all',
  initialArea,
  lockStatus = false,
  syncAreaToUrl = false,
}: Props) {
  const baseId = useId();
  const [status, setStatus] = useState(initialStatus);
  const [area, setArea] = useState(() =>
    resolveAreaFilterId(areas, initialArea),
  );
  const [year, setYear] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [refineOpen, setRefineOpen] = useState(
    () => resolveAreaFilterId(areas, initialArea) !== 'all',
  );

  const scoped = useMemo(
    () =>
      lockStatus && initialStatus !== 'all'
        ? projects.filter((item) => item.researchStatus === initialStatus)
        : projects,
    [projects, lockStatus, initialStatus],
  );

  const years = useMemo(
    () =>
      Array.from(
        new Set(
          scoped
            .map((project) => project.year)
            .filter((value): value is number => Boolean(value)),
        ),
      ).sort((a, b) => b - a),
    [scoped],
  );

  const statusOptions = useMemo(() => {
    const used = new Set(scoped.map((item) => item.researchStatus));
    return STATUS_ORDER.filter((value) => used.has(value));
  }, [scoped]);

  const areaOptions = useMemo(() => {
    const used = new Set(scoped.flatMap((item) => item.areaIds ?? []));
    return areas.filter((item) => used.has(item.id));
  }, [areas, scoped]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return scoped
      .filter((project) => {
        if (!lockStatus && status !== 'all' && project.researchStatus !== status)
          return false;
        if (area !== 'all' && !(project.areaIds ?? []).includes(area))
          return false;
        if (year !== 'all' && String(project.year) !== year) return false;
        if (needle) {
          const hay = [
            project.title,
            project.summary,
            RESEARCH_STATUS_LABELS[project.researchStatus],
            ...project.leadAuthorNames,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const yearA = a.year ?? 0;
        const yearB = b.year ?? 0;
        return sort === 'newest' ? yearB - yearA : yearA - yearB;
      });
  }, [scoped, lockStatus, status, area, year, query, sort]);

  const activeRefineCount =
    (area !== 'all' ? 1 : 0) + (year !== 'all' ? 1 : 0) + (query.trim() ? 1 : 0);

  const hasActiveFilters =
    (!lockStatus && status !== 'all') ||
    area !== 'all' ||
    year !== 'all' ||
    query.trim().length > 0;

  const countLabel = `${filtered.length} project${filtered.length === 1 ? '' : 's'}`;

  const clearFilters = () => {
    if (!lockStatus) setStatus('all');
    setArea('all');
    setYear('all');
    setQuery('');
  };

  useEffect(() => {
    setArea(resolveAreaFilterId(areas, initialArea));
  }, [areas, initialArea]);

  useEffect(() => {
    if (!syncAreaToUrl || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (area === 'all') {
      url.searchParams.delete('area');
    } else {
      const slug =
        areas.find((item) => item.id === area)?.slug ?? area;
      url.searchParams.set('area', slug);
    }
    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) {
      window.history.replaceState(null, '', next);
    }
  }, [area, areas, syncAreaToUrl]);

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
      <span className="sr-only">Search projects</span>
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

  const statusChipRow = !lockStatus ? (
    <div className={chipScroller}>
      <div className={chipScroll} role="group" aria-label="Project status">
        <FilterChip active={status === 'all'} onClick={() => setStatus('all')}>
          All projects
        </FilterChip>
        {statusOptions.map((value) => (
          <FilterChip
            key={value}
            active={status === value}
            onClick={() => setStatus(value)}
          >
            {RESEARCH_STATUS_LABELS[value]}
          </FilterChip>
        ))}
      </div>
    </div>
  ) : null;

  const desktopStatusList = !lockStatus ? (
    <div>
      <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
        Status
      </p>
      <div
        role="group"
        aria-label="Project status"
        className="mt-3 flex flex-col gap-1"
      >
        <button
          type="button"
          aria-pressed={status === 'all'}
          onClick={() => setStatus('all')}
          className={cn(
            'rounded-full px-3.5 py-2 text-left font-sans text-sm transition-colors',
            status === 'all'
              ? 'bg-ink font-semibold text-paper'
              : 'font-medium text-muted hover:bg-ink/4 hover:text-ink',
          )}
        >
          All projects
        </button>
        {statusOptions.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={status === value}
            onClick={() => setStatus(value)}
            className={cn(
              'rounded-full px-3.5 py-2 text-left font-sans text-sm transition-colors',
              status === value
                ? 'bg-ink font-semibold text-paper'
                : 'font-medium text-muted hover:bg-ink/4 hover:text-ink',
            )}
          >
            {RESEARCH_STATUS_LABELS[value]}
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
          aria-label="Sort projects"
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

          {desktopStatusList}

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
        <div className="space-y-3.5 lg:hidden">
          {renderSearchField()}
          {statusChipRow}

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

        <div className="mt-0 hidden items-center justify-between gap-4 border-b border-border pb-4 lg:flex">
          <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
            {countLabel}
          </p>
          <div
            role="group"
            aria-label="Sort projects"
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
            {filtered.map((project) => {
              const href = researchProjectHref(project);
              const venueLine = researchProjectVenueLine(project);

              return (
                <li key={project.id}>
                  <ResearchProjectAnchor
                    project={project}
                    className={cn(
                      'group flex items-start gap-4 py-6 sm:gap-7 sm:py-8',
                      !href && 'cursor-default',
                    )}
                  >
                    <span className="w-[4.5rem] shrink-0 sm:w-[5.5rem]">
                      <ResearchProjectMedia project={project} size="list" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block font-display text-lg leading-[1.2] text-ink sm:text-[1.35rem] sm:leading-[1.22] md:text-2xl',
                          href &&
                            'transition-colors group-hover:text-accent',
                        )}
                      >
                        {project.title}
                      </span>
                      {project.leadAuthorNames.length ? (
                        <span className="mt-2 block text-sm leading-relaxed text-muted sm:mt-2.5">
                          {project.leadAuthorNames.join(', ')}
                        </span>
                      ) : null}
                      {venueLine ? (
                        <span className="mt-1 hidden font-serif text-sm italic leading-snug text-body/80 sm:mt-1.5 sm:block">
                          {venueLine}
                        </span>
                      ) : null}
                      {href ? (
                        <span className="mt-3 inline-flex items-center gap-1.5 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent sm:mt-4 sm:opacity-0 sm:transition-opacity sm:duration-200 sm:group-hover:opacity-100 motion-reduce:opacity-100">
                          View
                          <span aria-hidden>→</span>
                        </span>
                      ) : null}
                    </span>
                  </ResearchProjectAnchor>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="No matching projects"
            description="Try a different status, area, year, or keyword."
          />
        )}
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { cmsApi } from '@/lib/cms/client-api';
import { formatDate } from '@/lib/utils';
import type { Event, EventStatus } from '@/types/content';
import { AdminLoading } from './AdminLoading';
import { ConfirmDialog } from './ConfirmDialog';
import {
  AdminLockedState,
  AdminPageHeader,
  AdminPrimaryButton,
} from './AdminUI';
import { SITE_VISIBILITY_LABELS } from './StatusBadge';
import { useCms } from './CmsProvider';

const CALENDAR_ORDER: EventStatus[] = ['upcoming', 'past', 'cancelled'];

const CALENDAR_LABELS: Record<EventStatus, string> = {
  upcoming: 'Upcoming',
  past: 'Past',
  cancelled: 'Cancelled',
};

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type EventListSort =
  | 'start_desc'
  | 'start_asc'
  | 'updated_desc'
  | 'updated_asc'
  | 'title_asc';

const SORT_OPTIONS: Array<{ value: EventListSort; label: string }> = [
  { value: 'start_desc', label: 'Starts · newest' },
  { value: 'start_asc', label: 'Starts · soonest' },
  { value: 'updated_desc', label: 'Updated · newest' },
  { value: 'updated_asc', label: 'Updated · oldest' },
  { value: 'title_asc', label: 'Title · A–Z' },
];

const EMPTY_FACETS = {
  total: 0,
  published: 0,
  withRegistration: 0,
  byCalendar: { upcoming: 0, past: 0, cancelled: 0 } as Record<
    EventStatus,
    number
  >,
  byStatus: { draft: 0, published: 0, archived: 0 },
};

const selectClass =
  'w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0B1F36] outline-none focus:border-[#0B1F36] focus:bg-white focus:ring-2 focus:ring-[#0B1F36]/10';

function SiteVisibilityToggle({
  item,
  busy,
  onToggle,
}: {
  item: Event;
  busy: boolean;
  onToggle: (published: boolean) => void;
}) {
  const onSite = item.status === 'published';
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onToggle(!onSite)}
      title={
        onSite
          ? 'On site — click to hide from /events'
          : 'Not on site — click to show on /events'
      }
      className={
        onSite
          ? 'inline-flex items-center rounded-md bg-[#E4F0EB] px-2 py-0.5 text-xs font-medium text-[#173B6C] ring-1 ring-inset ring-[#C5DCD4] hover:bg-[#D5E8E1] disabled:opacity-50'
          : 'inline-flex items-center rounded-md bg-[#F3E8D8] px-2 py-0.5 text-xs font-medium text-[#7A5428] ring-1 ring-inset ring-[#E4D2B5] hover:bg-[#EAD9C4] disabled:opacity-50'
      }
    >
      {onSite ? 'On site' : SITE_VISIBILITY_LABELS[item.status] ?? 'Draft'}
    </button>
  );
}

function EventThumb({
  item,
  size = 'md',
}: {
  item: Event;
  size?: 'sm' | 'md';
}) {
  const src = item.featuredImageUrl?.trim() || '';
  const dim = size === 'sm' ? 'h-12 w-12' : 'h-14 w-14';
  const day = item.startAt ? formatDate(item.startAt, 'd') : '';
  const month = item.startAt ? formatDate(item.startAt, 'MMM') : '';
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl bg-[#EEF2F6] ${dim}`}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes={size === 'sm' ? '48px' : '56px'}
          unoptimized={src.startsWith('http')}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center px-1 text-center">
          <span className="font-[family-name:var(--font-admin-display)] text-sm leading-none text-[#0B1F36]">
            {day || '—'}
          </span>
          {month ? (
            <span className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-[#7A90A8]">
              {month}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

function placeLine(item: Event): string {
  if (item.isOnline) return item.location?.trim() ? `Online · ${item.location}` : 'Online';
  return item.location?.trim() || 'Place not set';
}

export function EventsAdminPage() {
  const { ready, deleteItem, updateItem, apiAuthenticated } = useCms();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [calendarFilter, setCalendarFilter] = useState<string>('');
  const [publishStatus, setPublishStatus] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [online, setOnline] = useState<'' | '1' | '0'>('');
  const [hasRegistration, setHasRegistration] = useState<'' | '1' | '0'>('');
  const [sort, setSort] = useState<EventListSort>('start_desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState<null | 'selected'>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [pageItems, setPageItems] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [safePage, setSafePage] = useState(1);
  const [facets, setFacets] = useState(EMPTY_FACETS);
  const [filterYears, setFilterYears] = useState<number[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  const listParams = useCallback(
    (extra?: { page?: number; pageSize?: number; facets?: boolean }) => ({
      page: extra?.page ?? page,
      pageSize: extra?.pageSize ?? PAGE_SIZE,
      q: debouncedQuery || undefined,
      eventStatus: calendarFilter || undefined,
      status: publishStatus || undefined,
      yearFrom: yearFrom ? Number(yearFrom) : undefined,
      yearTo: yearTo ? Number(yearTo) : undefined,
      online: online === '' ? undefined : online === '1',
      hasRegistration:
        hasRegistration === '' ? undefined : hasRegistration === '1',
      sort,
      facets: extra?.facets ?? false,
    }),
    [
      page,
      debouncedQuery,
      calendarFilter,
      publishStatus,
      yearFrom,
      yearTo,
      online,
      hasRegistration,
      sort,
    ],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [
    debouncedQuery,
    calendarFilter,
    publishStatus,
    yearFrom,
    yearTo,
    online,
    hasRegistration,
    sort,
  ]);

  const loadPage = useCallback(async () => {
    if (!apiAuthenticated) return;
    setListLoading(true);
    setListError(null);
    try {
      const result = await cmsApi.listCollection('events', {
        ...listParams(),
        facets: true,
      });

      setPageItems(result.items as Event[]);
      setTotal(result.total);
      setSafePage(result.page);

      if (result.facets) {
        const calendar = result.facets.byCalendar ?? {};
        setFacets({
          total: result.facets.total,
          published: result.facets.published,
          withRegistration: result.facets.withRegistration ?? 0,
          byCalendar: {
            upcoming: calendar.upcoming ?? 0,
            past: calendar.past ?? 0,
            cancelled: calendar.cancelled ?? 0,
          },
          byStatus: result.facets.byStatus,
        });
      }

      if (result.options) {
        setFilterYears(result.options.years);
      }
    } catch (error) {
      setListError(
        error instanceof Error ? error.message : 'Failed to load events',
      );
      setPageItems([]);
      setTotal(0);
    } finally {
      setListLoading(false);
    }
  }, [apiAuthenticated, listParams, reloadToken]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtersOpen]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const counts = facets;
  const publishCounts = facets.byStatus;

  const advancedFilterCount = [
    publishStatus,
    yearFrom,
    yearTo,
    online,
    hasRegistration,
    sort !== 'start_desc' ? sort : '',
  ].filter(Boolean).length;

  const filtersActive = Boolean(
    query.trim() || debouncedQuery || calendarFilter || advancedFilterCount > 0,
  );

  const clearAdvancedFilters = () => {
    setPublishStatus('');
    setYearFrom('');
    setYearTo('');
    setOnline('');
    setHasRegistration('');
    setSort('start_desc');
  };

  const clearFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setCalendarFilter('');
    clearAdvancedFilters();
    setPage(1);
  };

  const chipClass = (active: boolean) =>
    active
      ? 'rounded-full bg-[#0B1F36] px-3 py-1.5 text-xs font-semibold text-white'
      : 'rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0B1F36] hover:bg-white';

  const refreshList = () => setReloadToken((n) => n + 1);

  const selectedCount = selectedIds.size;
  const allMatchingSelected = total > 0 && selectedCount === total;
  const someSelected = selectedCount > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllMatching = useCallback(async () => {
    if (total <= 0) return;
    setBulkBusy(true);
    try {
      const result = await cmsApi.listCollection('events', {
        ...listParams({
          page: 1,
          pageSize: Math.min(Math.max(total, 1), 10_000),
        }),
      });
      setSelectedIds(new Set(result.items.map((item) => item.id)));
    } catch (error) {
      setListError(
        error instanceof Error ? error.message : 'Could not select all matches',
      );
    } finally {
      setBulkBusy(false);
    }
  }, [total, listParams]);

  const toggleSelectAllMatching = () => {
    if (allMatchingSelected) {
      setSelectedIds(new Set());
      return;
    }
    void selectAllMatching();
  };

  const runBulkDelete = async () => {
    if (bulkDeleteMode !== 'selected') return;
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      await cmsApi.removeMany('events', { ids });
      setSelectedIds(new Set());
      setBulkDeleteMode(null);
      setDeleteId(null);
      refreshList();
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Bulk delete failed');
      setBulkDeleteMode(null);
    } finally {
      setBulkBusy(false);
    }
  };

  const setPublished = async (item: Event, published: boolean) => {
    setBusyId(item.id);
    try {
      await updateItem('events', item.id, {
        status: published ? 'published' : 'draft',
        ...(published
          ? { publishedAt: item.publishedAt ?? new Date().toISOString() }
          : {}),
      } as never);
      refreshList();
    } finally {
      setBusyId(null);
    }
  };

  if (!ready) {
    return <AdminLoading label="Loading events" />;
  }

  if (!apiAuthenticated) {
    return <AdminLockedState noun="events" />;
  }

  const rangeStart = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Calendar"
        title="Events"
        description={`${counts.total} gatherings · ${counts.published} on site`}
        action={
          <AdminPrimaryButton href="/admin/events/new">
            <Plus className="h-4 w-4" />
            Add event
          </AdminPrimaryButton>
        }
      />

      <div className="sticky top-12 z-20 -mx-4 border-b border-[#E2E8F0] bg-[#EEF2F6]/95 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-8 lg:px-8">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-2.5 shadow-[0_1px_2px_rgba(11,31,54,0.04)] sm:p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full max-w-[13.5rem] shrink-0 sm:max-w-[15rem]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7A90A8]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-8 pr-2.5 text-sm outline-none focus:border-[#0B1F36] focus:bg-white focus:ring-2 focus:ring-[#0B1F36]/10"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCalendarFilter('')}
                className={chipClass(calendarFilter === '')}
              >
                All ({counts.total})
              </button>
              {CALENDAR_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setCalendarFilter((current) => (current === key ? '' : key))
                  }
                  className={chipClass(calendarFilter === key)}
                >
                  {CALENDAR_LABELS[key]} ({counts.byCalendar[key] ?? 0})
                </button>
              ))}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              {filtersActive ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl px-2.5 py-2 text-xs font-semibold text-[#5B6B7C] hover:bg-[#F8FAFC] hover:text-[#0B1F36]"
                >
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${
                  advancedFilterCount > 0
                    ? 'border-[#0B1F36] bg-[#0B1F36] text-white'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0B1F36] hover:bg-white'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                {advancedFilterCount > 0 ? (
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[0.65rem] leading-none">
                    {advancedFilterCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          {filtersActive ? (
            <p className="mt-2 px-0.5 text-xs text-[#5B6B7C]">
              <span className="font-semibold text-[#0B1F36]">{total}</span>{' '}
              match{total === 1 ? '' : 'es'}
              {calendarFilter
                ? ` · ${CALENDAR_LABELS[calendarFilter as EventStatus] ?? calendarFilter}`
                : ''}
              {publishStatus
                ? ` · ${SITE_VISIBILITY_LABELS[publishStatus] ?? publishStatus}`
                : ''}
              {yearFrom || yearTo
                ? ` · ${yearFrom || '…'}–${yearTo || '…'}`
                : ''}
              {online === '1' ? ' · Online' : online === '0' ? ' · In person' : ''}
              {sort !== 'start_desc'
                ? ` · ${SORT_OPTIONS.find((o) => o.value === sort)?.label}`
                : ''}
              {query.trim() ? ` · “${query.trim()}”` : ''}
            </p>
          ) : null}
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-[#0B1F36]/35 backdrop-blur-[1px]"
            onClick={() => setFiltersOpen(false)}
          />
          <aside className="relative flex h-full w-full max-w-sm flex-col border-l border-[#E2E8F0] bg-white shadow-[-12px_0_40px_rgba(11,31,54,0.12)]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[#0B1F36]">Filters</p>
                <p className="text-xs text-[#7A90A8]">
                  Visibility, year, place & registration
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg p-2 text-[#5B6B7C] hover:bg-[#F8FAFC] hover:text-[#0B1F36]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <label className="block space-y-1.5">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
                  Show on website?
                </span>
                <p className="text-xs text-[#7A90A8]">
                  Whether this gathering appears on /events. Upcoming, past, and
                  cancelled are the calendar chips above.
                </p>
                <select
                  value={publishStatus}
                  onChange={(e) => setPublishStatus(e.target.value)}
                  className={selectClass}
                >
                  <option value="">All</option>
                  <option value="published">
                    On site ({publishCounts.published})
                  </option>
                  <option value="draft">
                    Draft — not on site ({publishCounts.draft})
                  </option>
                  {(publishCounts.archived > 0 || publishStatus === 'archived') && (
                    <option value="archived">
                      Hidden ({publishCounts.archived})
                    </option>
                  )}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1.5">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
                    Year from
                  </span>
                  <select
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Any</option>
                    {filterYears.map((year) => (
                      <option key={`from-${year}`} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
                    Year to
                  </span>
                  <select
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Any</option>
                    {filterYears.map((year) => (
                      <option key={`to-${year}`} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
                  Sort order
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as EventListSort)}
                  className={selectClass}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
                  Place
                </span>
                <select
                  value={online}
                  onChange={(e) => setOnline(e.target.value as '' | '1' | '0')}
                  className={selectClass}
                >
                  <option value="">Any</option>
                  <option value="1">Online</option>
                  <option value="0">In person</option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
                  Registration
                </span>
                <select
                  value={hasRegistration}
                  onChange={(e) =>
                    setHasRegistration(e.target.value as '' | '1' | '0')
                  }
                  className={selectClass}
                >
                  <option value="">Any</option>
                  <option value="1">
                    Has a form or link ({counts.withRegistration})
                  </option>
                  <option value="0">
                    No registration (
                    {Math.max(0, counts.total - counts.withRegistration)})
                  </option>
                </select>
              </label>
            </div>

            <div className="flex gap-2 border-t border-[#E2E8F0] px-4 py-3">
              <button
                type="button"
                onClick={clearAdvancedFilters}
                className="flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm font-semibold text-[#0B1F36] hover:bg-white"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex-1 rounded-xl bg-[#0B1F36] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#173B6C]"
              >
                Done
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {listError ? (
        <div className="rounded-2xl border border-[#F5D0D0] bg-[#FFF8F8] px-4 py-3 text-sm text-[#8A3B3B]">
          {listError}
        </div>
      ) : null}

      {selectedCount > 0 ? (
        <div className="sticky top-[4.5rem] z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-[#0B1F36]/15 bg-[#0B1F36] px-3 py-2.5 text-white shadow-lg lg:top-2">
          <p className="mr-auto text-xs">
            <span className="font-semibold">{selectedCount}</span> of{' '}
            <span className="font-semibold">{total}</span> selected
            {!allMatchingSelected ? (
              <>
                {' · '}
                <button
                  type="button"
                  disabled={bulkBusy || listLoading}
                  onClick={() => void selectAllMatching()}
                  className="font-semibold underline decoration-white/40 underline-offset-2 hover:decoration-white disabled:opacity-50"
                >
                  Select all {total}
                </button>
              </>
            ) : null}
          </p>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => setBulkDeleteMode('selected')}
            className="rounded-xl bg-[#C45C5C] px-3 py-2 text-xs font-semibold text-white hover:bg-[#B04E4E] disabled:opacity-50"
          >
            Delete selected ({selectedCount})
          </button>
        </div>
      ) : null}

      {listLoading && pageItems.length === 0 ? (
        <AdminLoading label="Loading events" />
      ) : total === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D5DEE8] bg-white px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[#0B1F36]">Nothing here yet</p>
          <p className="mt-1 text-sm text-[#5B6B7C]">
            {query || calendarFilter || publishStatus
              ? 'Try clearing search or filters.'
              : 'Add a gathering to show it on /events.'}
          </p>
          {!query && !calendarFilter && !publishStatus ? (
            <div className="mt-4 flex justify-center">
              <AdminPrimaryButton href="/admin/events/new">
                <Plus className="h-4 w-4" />
                Add event
              </AdminPrimaryButton>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className={`space-y-6 ${listLoading ? 'opacity-60 transition-opacity' : ''}`}
        >
          <div className="hidden overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(11,31,54,0.04)] lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[58rem] border-collapse text-left text-sm">
                <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
                  <tr>
                    <th className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={allMatchingSelected}
                        disabled={bulkBusy || total === 0}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = someSelected && !allMatchingSelected;
                          }
                        }}
                        onChange={toggleSelectAllMatching}
                        aria-label={`Select all ${total} events`}
                        title={
                          allMatchingSelected
                            ? 'Clear selection'
                            : `Select all ${total} items`
                        }
                        className="h-4 w-4 rounded border-[#CBD5E1] text-[#0B1F36] focus:ring-[#0B1F36]/30 disabled:opacity-50"
                      />
                    </th>
                    <th className="px-4 py-3 font-semibold">Gathering</th>
                    <th className="px-3 py-3 font-semibold">Calendar</th>
                    <th className="px-3 py-3 font-semibold">Starts</th>
                    <th className="px-3 py-3 font-semibold">Place</th>
                    <th className="px-3 py-3 font-semibold">Page</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => {
                    const pageHref = item.slug ? `/events/${item.slug}` : '';
                    const speakers = (item.speakers ?? []).slice(0, 2).join(', ');
                    const checked = selectedIds.has(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-[#EEF2F6] last:border-0 hover:bg-[#F8FAFC]/80 ${
                          checked ? 'bg-[#F3F7FB]' : ''
                        }`}
                      >
                        <td className="px-3 py-3 align-middle">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(item.id)}
                            aria-label={`Select ${item.title || 'event'}`}
                            className="h-4 w-4 rounded border-[#CBD5E1] text-[#0B1F36] focus:ring-[#0B1F36]/30"
                          />
                        </td>
                        <td className="max-w-[26rem] px-4 py-3 align-middle">
                          <div className="flex items-start gap-3">
                            <EventThumb item={item} />
                            <div className="min-w-0">
                              <Link
                                href={`/admin/events/${item.id}`}
                                className="line-clamp-2 font-semibold text-[#0B1F36] hover:text-[#173B6C]"
                              >
                                {item.title || 'Untitled event'}
                              </Link>
                              <p className="mt-1 line-clamp-1 text-xs text-[#7A90A8]">
                                {speakers || item.summary || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 align-middle text-[#5B6B7C]">
                          {CALENDAR_LABELS[item.eventStatus] ?? item.eventStatus}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 align-middle text-[#5B6B7C]">
                          {item.startAt
                            ? formatDate(item.startAt, 'd MMM yyyy, h:mm a')
                            : '—'}
                        </td>
                        <td className="max-w-[12rem] px-3 py-3 align-middle text-[#5B6B7C]">
                          <span className="inline-flex items-start gap-1">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span className="line-clamp-2">{placeLine(item)}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3 align-middle">
                          {pageHref ? (
                            <a
                              href={pageHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#173B6C] hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Open
                            </a>
                          ) : (
                            <span className="text-xs text-[#8A6B2F]">No page</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <SiteVisibilityToggle
                              item={item}
                              busy={busyId === item.id}
                              onToggle={(published) =>
                                void setPublished(item, published)
                              }
                            />
                            <Link
                              href={`/admin/events/${item.id}`}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#0B1F36] hover:bg-[#EEF2F6]"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteId(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#8A3B3B] hover:bg-[#FDF2F2]"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="space-y-3 lg:hidden">
            {pageItems.map((item) => {
              const pageHref = item.slug ? `/events/${item.slug}` : '';
              return (
                <li
                  key={item.id}
                  className={`rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_2px_rgba(11,31,54,0.04)] ${
                    selectedIds.has(item.id) ? 'ring-2 ring-[#0B1F36]/15' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      aria-label={`Select ${item.title || 'event'}`}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-[#CBD5E1] text-[#0B1F36] focus:ring-[#0B1F36]/30"
                    />
                    <EventThumb item={item} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
                        {CALENDAR_LABELS[item.eventStatus] ?? item.eventStatus}
                        {item.startAt
                          ? ` · ${formatDate(item.startAt, 'd MMM yyyy')}`
                          : ''}
                      </p>
                      <Link
                        href={`/admin/events/${item.id}`}
                        className="mt-1 line-clamp-2 font-semibold text-[#0B1F36]"
                      >
                        {item.title || 'Untitled event'}
                      </Link>
                      <p className="mt-1 line-clamp-1 text-xs text-[#7A90A8]">
                        {placeLine(item)}
                      </p>
                      {pageHref ? (
                        <a
                          href={pageHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#173B6C]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open page
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-[#EEF2F6] pt-3">
                    <SiteVisibilityToggle
                      item={item}
                      busy={busyId === item.id}
                      onToggle={(published) => void setPublished(item, published)}
                    />
                    <Link
                      href={`/admin/events/${item.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0B1F36] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteId(item.id)}
                      className="ml-auto rounded-lg px-2 py-1.5 text-xs font-medium text-[#8A3B3B] hover:bg-[#FDF2F2]"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#5B6B7C]">
              Showing{' '}
              <span className="font-semibold text-[#0B1F36]">
                {rangeStart}–{rangeEnd}
              </span>{' '}
              of <span className="font-semibold text-[#0B1F36]">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1 || listLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0B1F36] hover:bg-white disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <span className="min-w-[5.5rem] text-center text-xs font-semibold text-[#5B6B7C]">
                Page {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages || listLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0B1F36] hover:bg-white disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this event?"
        description="It will be removed from the events calendar. This cannot be undone from here."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteItem('events', deleteId);
            setSelectedIds((prev) => {
              const next = new Set(prev);
              next.delete(deleteId);
              return next;
            });
            setDeleteId(null);
            refreshList();
          }
        }}
      />

      <ConfirmDialog
        open={bulkDeleteMode === 'selected'}
        title={`Delete ${selectedCount} selected gathering${selectedCount === 1 ? '' : 's'}?`}
        description="Selected events will be removed from the CMS and the public events calendar. This cannot be undone from here."
        confirmLabel={bulkBusy ? 'Deleting…' : `Delete ${selectedCount}`}
        onCancel={() => {
          if (!bulkBusy) setBulkDeleteMode(null);
        }}
        onConfirm={() => {
          void runBulkDelete();
        }}
      />
    </div>
  );
}

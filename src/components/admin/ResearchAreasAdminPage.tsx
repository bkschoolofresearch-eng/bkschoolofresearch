'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { cmsApi } from '@/lib/cms/client-api';
import type { ResearchArea } from '@/types/content';
import { AdminLoading } from './AdminLoading';
import { ConfirmDialog } from './ConfirmDialog';
import {
  AdminLockedState,
  AdminPageHeader,
  AdminPrimaryButton,
} from './AdminUI';
import { SITE_VISIBILITY_LABELS } from './StatusBadge';
import { useCms } from './CmsProvider';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type AreaListSort = 'order_asc' | 'title_asc' | 'updated_desc' | 'updated_asc';

const SORT_OPTIONS: Array<{ value: AreaListSort; label: string }> = [
  { value: 'order_asc', label: 'Display order' },
  { value: 'title_asc', label: 'Title · A–Z' },
  { value: 'updated_desc', label: 'Updated · newest' },
  { value: 'updated_asc', label: 'Updated · oldest' },
];

const EMPTY_FACETS = {
  total: 0,
  published: 0,
  byStatus: { draft: 0, published: 0, archived: 0 },
};

const selectClass =
  'w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0B1F36] outline-none focus:border-[#0B1F36] focus:bg-white focus:ring-2 focus:ring-[#0B1F36]/10';

function SiteVisibilityToggle({
  item,
  busy,
  onToggle,
}: {
  item: ResearchArea;
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
          ? 'On site — click to hide from Focus Areas'
          : 'Not on site — click to show on Focus Areas'
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

export function ResearchAreasAdminPage() {
  const { ready, deleteItem, updateItem, apiAuthenticated } = useCms();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [publishStatus, setPublishStatus] = useState('');
  const [sort, setSort] = useState<AreaListSort>('order_asc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState<null | 'selected'>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [pageItems, setPageItems] = useState<ResearchArea[]>([]);
  const [total, setTotal] = useState(0);
  const [safePage, setSafePage] = useState(1);
  const [facets, setFacets] = useState(EMPTY_FACETS);
  const [reloadToken, setReloadToken] = useState(0);

  const listParams = useCallback(
    (extra?: { page?: number; pageSize?: number }) => ({
      page: extra?.page ?? page,
      pageSize: extra?.pageSize ?? PAGE_SIZE,
      q: debouncedQuery || undefined,
      status: publishStatus || undefined,
      sort,
    }),
    [page, debouncedQuery, publishStatus, sort],
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedQuery(query.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [debouncedQuery, publishStatus, sort]);

  const loadPage = useCallback(async () => {
    if (!apiAuthenticated) return;
    setListLoading(true);
    setListError(null);
    try {
      const result = await cmsApi.listCollection('researchAreas', {
        ...listParams(),
        facets: true,
      });
      setPageItems(result.items as ResearchArea[]);
      setTotal(result.total);
      setSafePage(result.page);
      if (result.facets) {
        setFacets({
          total: result.facets.total,
          published: result.facets.published,
          byStatus: result.facets.byStatus,
        });
      }
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Failed to load focus areas');
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
    sort !== 'order_asc' ? sort : '',
  ].filter(Boolean).length;
  const filtersActive = Boolean(
    query.trim() || debouncedQuery || advancedFilterCount > 0,
  );

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
      const result = await cmsApi.listCollection('researchAreas', {
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

  const runBulkDelete = async () => {
    if (bulkDeleteMode !== 'selected') return;
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      await cmsApi.removeMany('researchAreas', { ids });
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

  const setPublished = async (item: ResearchArea, published: boolean) => {
    setBusyId(item.id);
    try {
      await updateItem('researchAreas', item.id, {
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

  if (!ready) return <AdminLoading label="Loading focus areas" />;
  if (!apiAuthenticated) return <AdminLockedState noun="focus areas" />;

  const rangeStart = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Research"
        title="Focus areas"
        description={`${counts.total} areas · ${counts.published} on site`}
        action={
          <AdminPrimaryButton href="/admin/research-areas/new">
            <Plus className="h-4 w-4" />
            Add focus area
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
            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              {filtersActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setDebouncedQuery('');
                    setPublishStatus('');
                    setSort('order_asc');
                    setPage(1);
                  }}
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
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-[#0B1F36]/35"
            onClick={() => setFiltersOpen(false)}
          />
          <aside className="relative flex h-full w-full max-w-sm flex-col border-l border-[#E2E8F0] bg-white">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
              <p className="text-sm font-semibold text-[#0B1F36]">Filters</p>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg p-2 text-[#5B6B7C] hover:bg-[#F8FAFC]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <label className="block space-y-1.5">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
                  Show on website?
                </span>
                <select
                  value={publishStatus}
                  onChange={(e) => setPublishStatus(e.target.value)}
                  className={selectClass}
                >
                  <option value="">All</option>
                  <option value="published">On site ({publishCounts.published})</option>
                  <option value="draft">Draft — not on site ({publishCounts.draft})</option>
                  {(publishCounts.archived > 0 || publishStatus === 'archived') && (
                    <option value="archived">Hidden ({publishCounts.archived})</option>
                  )}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
                  Sort order
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as AreaListSort)}
                  className={selectClass}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex gap-2 border-t border-[#E2E8F0] px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setPublishStatus('');
                  setSort('order_asc');
                }}
                className="flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm font-semibold text-[#0B1F36]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex-1 rounded-xl bg-[#0B1F36] px-3 py-2.5 text-sm font-semibold text-white"
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
        <div className="sticky top-[4.5rem] z-20 flex flex-wrap items-center gap-2 rounded-2xl bg-[#0B1F36] px-3 py-2.5 text-white lg:top-2">
          <p className="mr-auto text-xs">
            <span className="font-semibold">{selectedCount}</span> of {total} selected
          </p>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-white/80"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => setBulkDeleteMode('selected')}
            className="rounded-xl bg-[#C45C5C] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            Delete selected ({selectedCount})
          </button>
        </div>
      ) : null}

      {listLoading && pageItems.length === 0 ? (
        <AdminLoading label="Loading focus areas" />
      ) : total === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D5DEE8] bg-white px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[#0B1F36]">Nothing here yet</p>
          <p className="mt-1 text-sm text-[#5B6B7C]">
            Add a focus area to use it on /research and the homepage.
          </p>
        </div>
      ) : (
        <div className={`space-y-6 ${listLoading ? 'opacity-60' : ''}`}>
          <div className="hidden overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
                <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
                  <tr>
                    <th className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={allMatchingSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected && !allMatchingSelected;
                        }}
                        onChange={() => {
                          if (allMatchingSelected) setSelectedIds(new Set());
                          else void selectAllMatching();
                        }}
                        aria-label={`Select all ${total} focus areas`}
                        className="h-4 w-4 rounded border-[#CBD5E1]"
                      />
                    </th>
                    <th className="px-4 py-3">Focus area</th>
                    <th className="px-3 py-3">Order</th>
                    <th className="px-3 py-3">Page</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => {
                    const href = item.slug
                      ? `/research/areas/${item.slug}`
                      : '/research/areas';
                    const checked = selectedIds.has(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-[#EEF2F6] last:border-0 ${checked ? 'bg-[#F3F7FB]' : ''}`}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(item.id)}
                            aria-label={`Select ${item.title || 'focus area'}`}
                            className="h-4 w-4 rounded border-[#CBD5E1]"
                          />
                        </td>
                        <td className="max-w-[32rem] px-4 py-3">
                          <Link
                            href={`/admin/research-areas/${item.id}`}
                            className="line-clamp-2 font-semibold text-[#0B1F36] hover:text-[#173B6C]"
                          >
                            {item.title || 'Untitled focus area'}
                          </Link>
                          <p className="mt-1 line-clamp-1 text-xs text-[#7A90A8]">
                            {item.shortDescription || '—'}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-[#5B6B7C]">{item.order ?? '—'}</td>
                        <td className="px-3 py-3">
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#173B6C] hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <SiteVisibilityToggle
                              item={item}
                              busy={busyId === item.id}
                              onToggle={(published) => void setPublished(item, published)}
                            />
                            <Link
                              href={`/admin/research-areas/${item.id}`}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#0B1F36] hover:bg-[#EEF2F6]"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteId(item.id)}
                              className="rounded-lg px-2 py-1.5 text-[#8A3B3B] hover:bg-[#FDF2F2]"
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
            {pageItems.map((item) => (
              <li key={item.id} className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    aria-label={`Select ${item.title || 'focus area'}`}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
                      Order {item.order ?? '—'}
                    </p>
                    <Link
                      href={`/admin/research-areas/${item.id}`}
                      className="mt-1 line-clamp-2 font-semibold text-[#0B1F36]"
                    >
                      {item.title || 'Untitled focus area'}
                    </Link>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-[#EEF2F6] pt-3">
                  <SiteVisibilityToggle
                    item={item}
                    busy={busyId === item.id}
                    onToggle={(published) => void setPublished(item, published)}
                  />
                  <Link
                    href={`/admin/research-areas/${item.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#0B1F36] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    className="ml-auto text-xs font-medium text-[#8A3B3B]"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
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
                className="inline-flex items-center gap-1 rounded-xl border border-[#E2E8F0] px-3 py-2 text-xs font-semibold disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <span className="text-xs font-semibold text-[#5B6B7C]">
                Page {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages || listLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-[#E2E8F0] px-3 py-2 text-xs font-semibold disabled:opacity-40"
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
        title="Delete this focus area?"
        description="It will be removed from Focus Areas. Research items that used it will keep their other fields."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteItem('researchAreas', deleteId);
            setDeleteId(null);
            refreshList();
          }
        }}
      />
      <ConfirmDialog
        open={bulkDeleteMode === 'selected'}
        title={`Delete ${selectedCount} selected focus area${selectedCount === 1 ? '' : 's'}?`}
        description="Selected focus areas will be removed from the CMS and the public Focus Areas pages."
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

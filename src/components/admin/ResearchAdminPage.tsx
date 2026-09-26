'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Copy,
  ExternalLink,
  Link2,
  Link2Off,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';
import { RESEARCH_STATUS_LABELS } from '@/lib/public/labels';
import type { ResearchProject, ResearchStatus } from '@/types/content';
import { ConfirmDialog } from './ConfirmDialog';
import {
  AdminLockedState,
  AdminPageHeader,
  AdminPrimaryButton,
} from './AdminUI';
import { StatusBadge } from './StatusBadge';
import { useCms } from './CmsProvider';

const CATEGORY_ORDER: ResearchStatus[] = [
  'ongoing',
  'completed',
  'planned',
  'archived',
];

function hasExternalLink(item: ResearchProject): boolean {
  return typeof item.url === 'string' && Boolean(item.url.trim());
}

export function ResearchAdminPage() {
  const { database, ready, deleteItem, duplicateItem, updateItem, apiAuthenticated } =
    useCms();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [publishStatus, setPublishStatus] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const items = useMemo(() => {
    if (!database) return [];
    return [...database.researchProjects]
      .filter((item) => {
        if (category && item.researchStatus !== category) return false;
        if (publishStatus && item.status !== publishStatus) return false;
        if (!query.trim()) return true;
        const blob = [
          item.title,
          item.summary,
          item.venue,
          item.description,
          item.url,
          ...(item.leadAuthorNames ?? []),
        ]
          .join(' ')
          .toLowerCase();
        return blob.includes(query.trim().toLowerCase());
      })
      .sort((a, b) => {
        const cat =
          CATEGORY_ORDER.indexOf(a.researchStatus) -
          CATEGORY_ORDER.indexOf(b.researchStatus);
        if (cat !== 0) return cat;
        const year = (b.year ?? 0) - (a.year ?? 0);
        if (year !== 0) return year;
        return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''));
      });
  }, [database, query, category, publishStatus]);

  const counts = useMemo(() => {
    const list = database?.researchProjects ?? [];
    const byCategory = Object.fromEntries(
      CATEGORY_ORDER.map((key) => [
        key,
        list.filter((p) => p.researchStatus === key).length,
      ]),
    ) as Record<ResearchStatus, number>;
    return {
      total: list.length,
      withLink: list.filter(hasExternalLink).length,
      published: list.filter((p) => p.status === 'published').length,
      byCategory,
    };
  }, [database]);

  const areaTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const area of database?.researchAreas ?? []) {
      map.set(area.id, area.title);
    }
    return map;
  }, [database]);

  if (!ready) {
    return <p className="text-sm text-[#5B6B7C]">Loading research…</p>;
  }

  if (!apiAuthenticated || !database) {
    return <AdminLockedState noun="research items" />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Library"
        title="Research"
        description={`Manage everything on /research — category, authors, year, venue, summary, image, focus areas, and the journal/DOI link visitors open on click. · ${counts.total} items · ${counts.published} published · ${counts.withLink} with link`}
        action={
          <AdminPrimaryButton href="/admin/research/new">
            <Plus className="h-4 w-4" />
            Add research
          </AdminPrimaryButton>
        }
      />

      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm leading-relaxed text-[#5B6B7C]">
        <p>
          <span className="font-semibold text-[#173B6C]">How to add:</span>{' '}
          Choose Ongoing or Completed → fill title, authors, year, venue/source
          line, and short summary → paste the journal or DOI link → pick focus
          areas → set Publish status to Published. Focus area labels are managed
          under{' '}
          <Link
            href="/admin/research-areas"
            className="font-semibold text-[#173B6C] underline-offset-2 hover:underline"
          >
            Focus areas
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('')}
          className={
            category === ''
              ? 'rounded-full bg-[#0B1F36] px-3.5 py-1.5 text-xs font-semibold text-white'
              : 'rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0B1F36] hover:bg-[#F8FAFC]'
          }
        >
          All ({counts.total})
        </button>
        {CATEGORY_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={
              category === key
                ? 'rounded-full bg-[#0B1F36] px-3.5 py-1.5 text-xs font-semibold text-white'
                : 'rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0B1F36] hover:bg-[#F8FAFC]'
            }
          >
            {RESEARCH_STATUS_LABELS[key]} ({counts.byCategory[key]})
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-[0_1px_2px_rgba(11,31,54,0.04)] sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A90A8]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, authors, venue, link…"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0B1F36] focus:bg-white focus:ring-2 focus:ring-[#0B1F36]/10"
          />
        </div>
        <select
          value={publishStatus}
          onChange={(e) => setPublishStatus(e.target.value)}
          className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm outline-none focus:border-[#0B1F36] focus:bg-white"
        >
          <option value="">All publish statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D5DEE8] bg-white px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[#0B1F36]">Nothing here yet</p>
          <p className="mt-1 text-sm text-[#5B6B7C]">
            {query || category || publishStatus
              ? 'Try clearing search or filters.'
              : 'Add your first research item to show it on /research.'}
          </p>
          {!query && !category && !publishStatus ? (
            <div className="mt-4 flex justify-center">
              <AdminPrimaryButton href="/admin/research/new">
                <Plus className="h-4 w-4" />
                Add research
              </AdminPrimaryButton>
            </div>
          ) : null}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const linked = hasExternalLink(item);
            const areas = (item.areaIds ?? [])
              .map((id) => areaTitleById.get(id))
              .filter(Boolean)
              .slice(0, 2);
            const authors = (item.leadAuthorNames ?? []).slice(0, 3).join(', ');

            return (
              <li
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(11,31,54,0.04)] transition hover:border-[#0B1F36]/25 hover:shadow-[0_8px_24px_rgba(11,31,54,0.06)]"
              >
                <Link
                  href={`/admin/research/${item.id}`}
                  className="relative block aspect-[16/10] bg-[#EEF2F6]"
                >
                  {item.featuredImageUrl ? (
                    <Image
                      src={item.featuredImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                      unoptimized={item.featuredImageUrl.startsWith('http')}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center">
                      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#7A90A8]">
                        {RESEARCH_STATUS_LABELS[item.researchStatus]}
                      </span>
                      <span className="font-[family-name:var(--font-admin-display)] text-3xl text-[#0B1F36]">
                        {item.year ?? '—'}
                      </span>
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span
                      className={
                        linked
                          ? 'inline-flex items-center gap-1 rounded-full bg-[#0B1F36]/90 px-2.5 py-1 text-[0.65rem] font-semibold text-white'
                          : 'inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[0.65rem] font-semibold text-[#8A6B2F] ring-1 ring-[#E2E8F0]'
                      }
                    >
                      {linked ? (
                        <>
                          <Link2 className="h-3 w-3" />
                          Link attached
                        </>
                      ) : (
                        <>
                          <Link2Off className="h-3 w-3" />
                          No link
                        </>
                      )}
                    </span>
                  </div>
                </Link>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#7A90A8]">
                      {RESEARCH_STATUS_LABELS[item.researchStatus]}
                      {item.year ? ` · ${item.year}` : ''}
                      {item.featuredOnResearchPage ? ' · Featured' : ''}
                    </p>
                    <Link
                      href={`/admin/research/${item.id}`}
                      className="line-clamp-2 font-[family-name:var(--font-admin-display)] text-lg leading-snug text-[#0B1F36] hover:text-[#173B6C]"
                    >
                      {item.title || 'Untitled research'}
                    </Link>
                    {authors ? (
                      <p className="line-clamp-1 text-sm text-[#5B6B7C]">
                        {authors}
                        {(item.leadAuthorNames?.length ?? 0) > 3 ? '…' : ''}
                      </p>
                    ) : null}
                    {item.venue ? (
                      <p className="line-clamp-1 text-xs italic text-[#7A90A8]">
                        {item.venue}
                      </p>
                    ) : item.summary ? (
                      <p className="line-clamp-2 text-sm leading-relaxed text-[#5B6B7C]">
                        {item.summary}
                      </p>
                    ) : null}
                    {areas.length ? (
                      <p className="text-xs text-[#7A90A8]">
                        {areas.join(' · ')}
                        {(item.areaIds?.length ?? 0) > 2
                          ? ` · +${(item.areaIds?.length ?? 0) - 2}`
                          : ''}
                      </p>
                    ) : null}
                    <p className="text-xs text-[#7A90A8]">
                      Updated {formatDateShort(item.updatedAt)}
                      {linked ? ' · Has link' : ''}
                    </p>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[#EEF2F6] pt-3">
                    <Link
                      href={`/admin/research/${item.id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B1F36] px-3 py-2 text-xs font-semibold text-white hover:bg-[#173B6C]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <Link
                      href="/research"
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0B1F36] hover:bg-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View page
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.status !== 'published' ? (
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={async () => {
                          setBusyId(item.id);
                          try {
                            await updateItem('researchProjects', item.id, {
                              status: 'published',
                              publishedAt:
                                item.publishedAt ?? new Date().toISOString(),
                            } as never);
                          } finally {
                            setBusyId(null);
                          }
                        }}
                        className="rounded-lg px-2 py-1.5 text-xs font-medium text-[#173B6C] hover:bg-[#EEF2F6] disabled:opacity-50"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={async () => {
                          setBusyId(item.id);
                          try {
                            await updateItem('researchProjects', item.id, {
                              status: 'draft',
                            } as never);
                          } finally {
                            setBusyId(null);
                          }
                        }}
                        className="rounded-lg px-2 py-1.5 text-xs font-medium text-[#5B6B7C] hover:bg-[#EEF2F6] disabled:opacity-50"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={async () => {
                        setBusyId(item.id);
                        try {
                          await duplicateItem('researchProjects', item.id);
                        } finally {
                          setBusyId(null);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#5B6B7C] hover:bg-[#EEF2F6] disabled:opacity-50"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(item.id)}
                      className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#8A3B3B] hover:bg-[#FDF2F2]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this research item?"
        description="It will be removed from the Research page. You can restore starter content from System & data if needed."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteItem('researchProjects', deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}

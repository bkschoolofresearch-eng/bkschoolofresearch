'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Copy,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { formatDateShort, humanizeLabel } from '@/lib/utils';
import { getPersonClaimStatus } from '@/lib/auth/permissions';
import { AdminLoading } from './AdminLoading';
import { ConfirmDialog } from './ConfirmDialog';
import {
  AdminLockedState,
  AdminPageHeader,
  AdminPrimaryButton,
} from './AdminUI';
import { StatusBadge } from './StatusBadge';
import { useCms } from './CmsProvider';
import {
  collectionConfigs,
  type AdminCollectionSlug,
} from './collections';
import type { ContentStatus, Person } from '@/types/content';

export function CollectionListPage({
  collectionSlug,
}: {
  collectionSlug: AdminCollectionSlug;
}) {
  const config = collectionConfigs[collectionSlug];
  const router = useRouter();
  const { database, ready, deleteItem, duplicateItem, updateItem, apiAuthenticated } =
    useCms();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const items = useMemo(() => {
    if (!database) return [];
    const list = database[config.key] as unknown as Record<string, unknown>[];
    return list
      .filter((item) => {
        for (const [key, value] of Object.entries(filters)) {
          if (!value) continue;
          if (String(item[key] ?? '') !== value) return false;
        }
        if (!query.trim()) return true;
        const blob = config.searchFields
          .map((field) => {
            const v = item[field];
            return Array.isArray(v) ? v.join(' ') : String(v ?? '');
          })
          .join(' ')
          .toLowerCase();
        return blob.includes(query.trim().toLowerCase());
      })
      .sort((a, b) => {
        const aTime = String(a.updatedAt ?? a.createdAt ?? '');
        const bTime = String(b.updatedAt ?? b.createdAt ?? '');
        return bTime.localeCompare(aTime);
      });
  }, [database, config, query, filters]);

  if (!ready) {
    return <AdminLoading label="Loading content" />;
  }

  if (!apiAuthenticated || !database) {
    return <AdminLockedState noun={config.plural.toLowerCase()} />;
  }

  const metaBits = (item: Record<string, unknown>) => {
    const bits: string[] = [];
    if (item.type) bits.push(humanizeLabel(String(item.type)));
    if (item.researchStatus) bits.push(humanizeLabel(String(item.researchStatus)));
    if (item.eventStatus) bits.push(humanizeLabel(String(item.eventStatus)));
    if (item.noticeType) bits.push(humanizeLabel(String(item.noticeType)));
    if (item.category) bits.push(humanizeLabel(String(item.category)));
    if (item.role) bits.push(String(item.role));
    if (item.year) bits.push(String(item.year));
    if (typeof item.url === 'string' && item.url.trim()) bits.push('Has link');
    if (item.startAt) bits.push(formatDateShort(String(item.startAt)));
    if (item.updatedAt) bits.push(`Updated ${formatDateShort(String(item.updatedAt))}`);
    return bits.slice(0, 4);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Library"
        title={config.plural}
        description={`${config.helpText ?? `Manage ${config.plural.toLowerCase()} shown on the public site.`}${config.publicHint ? ` Live page: ${config.publicHint}.` : ''} · ${items.length} shown${query || Object.values(filters).some(Boolean) ? ' (filtered)' : ''}`}
        action={
          <AdminPrimaryButton href={`/admin/${config.slug}/new`}>
            <Plus className="h-4 w-4" />
            {config.addLabel}
          </AdminPrimaryButton>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-[0_1px_2px_rgba(11,31,54,0.04)] sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A90A8]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${config.plural.toLowerCase()}…`}
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0B1F36] focus:bg-white focus:ring-2 focus:ring-[#0B1F36]/10"
          />
        </div>
        {config.filters?.map((filter) => (
          <select
            key={filter.name}
            value={filters[filter.name] ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, [filter.name]: e.target.value }))
            }
            className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm outline-none focus:border-[#0B1F36] focus:bg-white"
          >
            <option value="">All {filter.label.toLowerCase()}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D5DEE8] bg-white px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[#0B1F36]">Nothing here yet</p>
          <p className="mt-1 text-sm text-[#5B6B7C]">
            {query || Object.values(filters).some(Boolean)
              ? 'Try clearing search or filters.'
              : `Add your first ${config.singular.toLowerCase()} to show it on the website.`}
          </p>
          {!query && !Object.values(filters).some(Boolean) ? (
            <div className="mt-4 flex justify-center">
              <AdminPrimaryButton href={`/admin/${config.slug}/new`}>
                <Plus className="h-4 w-4" />
                {config.addLabel}
              </AdminPrimaryButton>
            </div>
          ) : null}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const id = String(item.id);
            const title = config.getTitle(item);
            const status = String(item.status ?? 'draft');
            const imageRaw = config.cardImageKey
              ? item[config.cardImageKey]
              : null;
            const imageUrl =
              typeof imageRaw === 'string' && imageRaw.trim()
                ? imageRaw
                : null;
            const excerptRaw = config.cardExcerptKey
              ? item[config.cardExcerptKey]
              : null;
            const excerpt =
              typeof excerptRaw === 'string' ? excerptRaw.trim() : '';
            const preview =
              config.previewPath?.(
                item as {
                  slug?: string;
                  status?: ContentStatus;
                  researchStatus?: string;
                },
              ) ?? null;
            const claim =
              collectionSlug === 'people'
                ? getPersonClaimStatus(item as unknown as Person)
                : null;
            const bits = metaBits(item);

            return (
              <li
                key={id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(11,31,54,0.04)] transition hover:border-[#0B1F36]/25 hover:shadow-[0_8px_24px_rgba(11,31,54,0.06)]"
              >
                <Link
                  href={`/admin/${config.slug}/${id}`}
                  className="relative block aspect-[16/10] bg-[#EEF2F6]"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                      unoptimized={imageUrl.startsWith('http')}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-xs font-medium uppercase tracking-wide text-[#7A90A8]">
                      No image
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <StatusBadge status={status} />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="min-w-0 space-y-1.5">
                    <Link
                      href={`/admin/${config.slug}/${id}`}
                      className="line-clamp-2 font-[family-name:var(--font-admin-display)] text-lg leading-snug text-[#0B1F36] hover:text-[#173B6C]"
                    >
                      {title}
                    </Link>
                    {excerpt ? (
                      <p className="line-clamp-2 text-sm leading-relaxed text-[#5B6B7C]">
                        {excerpt}
                      </p>
                    ) : null}
                    {bits.length ? (
                      <p className="text-xs text-[#7A90A8]">{bits.join(' · ')}</p>
                    ) : null}
                    {claim ? (
                      <p className="text-xs font-medium text-[#173B6C]">
                        Profile: {claim}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[#EEF2F6] pt-3">
                    <Link
                      href={`/admin/${config.slug}/${id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B1F36] px-3 py-2 text-xs font-semibold text-white hover:bg-[#173B6C]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    {preview ? (
                      <Link
                        href={preview}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0B1F36] hover:bg-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === id}
                        onClick={async () => {
                          setBusyId(id);
                          try {
                            const next =
                              status === 'published' ? 'draft' : 'published';
                            await updateItem(config.key, id, {
                              status: next,
                              ...(next === 'published' && !item.publishedAt
                                ? { publishedAt: new Date().toISOString() }
                                : {}),
                            } as never);
                          } finally {
                            setBusyId(null);
                          }
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0B1F36] hover:bg-white disabled:opacity-50"
                      >
                        {status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {preview && status !== 'published' ? (
                      <button
                        type="button"
                        disabled={busyId === id}
                        onClick={async () => {
                          setBusyId(id);
                          try {
                            await updateItem(config.key, id, {
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
                    ) : null}
                    {preview && status === 'published' ? (
                      <button
                        type="button"
                        disabled={busyId === id}
                        onClick={async () => {
                          setBusyId(id);
                          try {
                            await updateItem(config.key, id, {
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
                    ) : null}
                    {config.canDuplicate ? (
                      <button
                        type="button"
                        title="Duplicate"
                        disabled={busyId === id}
                        onClick={async () => {
                          setBusyId(id);
                          try {
                            const copy = await duplicateItem(config.key, id);
                            if (copy) {
                              router.push(`/admin/${config.slug}/${copy.id}`);
                            }
                          } finally {
                            setBusyId(null);
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#5B6B7C] hover:bg-[#EEF2F6] hover:text-[#0B1F36] disabled:opacity-50"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Duplicate
                      </button>
                    ) : null}
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => setDeleteId(id)}
                      className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#8A3B3B] hover:bg-[#FFF8F8] disabled:opacity-50"
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
        title={`Delete this ${config.singular.toLowerCase()}?`}
        description="It will disappear from the website after the next refresh. This cannot be undone unless you restore from a backup or starter library."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) await deleteItem(config.key, deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useCms } from '@/components/admin/CmsProvider';
import { AdminLoading } from '@/components/admin/AdminLoading';
import {
  AdminLockedState,
  AdminPageHeader,
  AdminPrimaryButton,
} from '@/components/admin/AdminUI';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import {
  PERSON_LINK_ROLE_OPTIONS,
  PERSON_LINK_TYPE_LABEL,
  getEntitiesForPicker,
  humanizeLinkRole,
  resolveEntityMeta,
} from '@/lib/content/person-links';
import {
  addPersonContentLink,
  removePersonContentLink,
} from '@/lib/cms/client-ops';
import type { PersonLinkEntityType } from '@/types/content';

const TYPES: PersonLinkEntityType[] = [
  'event',
  'research',
  'publication',
  'activity',
];

const PAGE_SIZE = 10;

const fieldClass =
  'w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0B1F36] outline-none focus:border-[#0B1F36] focus:bg-white';

export function InvolvementsAdminPage({ embedded = false }: { embedded?: boolean }) {
  const { database, ready, apiAuthenticated, refresh } = useCms();
  const [personId, setPersonId] = useState('');
  const [entityType, setEntityType] = useState<PersonLinkEntityType>('event');
  const [entityId, setEntityId] = useState('');
  const [role, setRole] = useState('speaker');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const people = database?.people ?? [];
  const entities = useMemo(
    () => (database ? getEntitiesForPicker(database, entityType) : []),
    [database, entityType],
  );

  const rows = useMemo(() => {
    if (!database) return [];
    const needle = query.trim().toLowerCase();
    return [...database.personContentLinks]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((link) => {
        const person = people.find((item) => item.id === link.personId);
        const meta = resolveEntityMeta(database, link.entityType, link.entityId);
        return {
          ...link,
          personName: person?.name ?? 'Unknown person',
          adminHref: person ? `/admin/people/${person.id}` : null,
          entityTitle: meta?.title ?? link.entityId,
          entityHref: meta?.href ?? null,
        };
      })
      .filter((row) => {
        if (!needle) return true;
        return `${row.personName} ${row.entityTitle} ${row.role}`
          .toLowerCase()
          .includes(needle);
      });
  }, [database, people, query]);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, total);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  if (!ready) return <AdminLoading label="Loading links" />;
  if (!apiAuthenticated || !database) {
    return <AdminLockedState noun="people links" />;
  }

  return (
    <div className="space-y-4">
      {embedded ? null : (
        <AdminPageHeader
          eyebrow="People"
          title="Who worked on what"
          description="Connect a person to research, a publication, an event, or a programme. The link shows on both pages."
        />
      )}

      <form
        className="grid gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_2px_rgba(11,31,54,0.04)] lg:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          if (!personId || !entityId) {
            setError('Choose a person and an item.');
            return;
          }
          void (async () => {
            const result = await addPersonContentLink({
              personId,
              entityType,
              entityId,
              role,
            });
            if ('error' in result) {
              setError(result.error);
              return;
            }
            await refresh();
            setEntityId('');
            setPage(1);
          })();
        }}
      >
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[#0B1F36]">Person</span>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className={fieldClass}
          >
            <option value="">Select…</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[#0B1F36]">Kind</span>
          <select
            value={entityType}
            onChange={(e) => {
              const next = e.target.value as PersonLinkEntityType;
              setEntityType(next);
              setEntityId('');
              setRole(PERSON_LINK_ROLE_OPTIONS[next][0]?.value ?? 'contributor');
            }}
            className={fieldClass}
          >
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {PERSON_LINK_TYPE_LABEL[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm lg:col-span-2">
          <span className="font-medium text-[#0B1F36]">Item</span>
          <select
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            className={fieldClass}
          >
            <option value="">Select…</option>
            {entities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[#0B1F36]">Part they played</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={fieldClass}
          >
            {PERSON_LINK_ROLE_OPTIONS[entityType].map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <div className="lg:col-span-5">
          {error ? <p className="mb-2 text-sm text-[#8A3B3B]">{error}</p> : null}
          <AdminPrimaryButton type="submit">
            <Plus className="h-4 w-4" />
            Add link
          </AdminPrimaryButton>
        </div>
      </form>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A90A8]" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search person or title"
          className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0B1F36]"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] uppercase tracking-[0.12em] text-[#7A90A8]">
            <tr>
              <th className="px-4 py-3 font-semibold">Person</th>
              <th className="px-4 py-3 font-semibold">Kind</th>
              <th className="px-4 py-3 font-semibold">Item</th>
              <th className="px-4 py-3 font-semibold">Part</th>
              <th className="px-4 py-3 font-semibold"> </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#5B6B7C]">
                  No links for this search.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id} className="border-b border-[#EEF2F6] last:border-0">
                  <td className="px-4 py-3">
                    {row.adminHref ? (
                      <Link href={row.adminHref} className="font-medium text-[#173B6C] hover:underline">
                        {row.personName}
                      </Link>
                    ) : (
                      row.personName
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#5B6B7C]">
                    {PERSON_LINK_TYPE_LABEL[row.entityType]}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3">
                    {row.entityHref ? (
                      <Link href={row.entityHref} className="text-[#173B6C] hover:underline">
                        {row.entityTitle}
                      </Link>
                    ) : (
                      row.entityTitle
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#5B6B7C]">{humanizeLinkRole(row.role)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteId(row.id)}
                      className="text-xs font-semibold text-[#8A3B3B]"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 0 ? (
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
              disabled={safePage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
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
              disabled={safePage >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0B1F36] hover:bg-white disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Remove this link?"
        description="The person stays on the team. Only this connection to the item is removed."
        confirmLabel="Remove"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          const target = deleteId;
          setDeleteId(null);
          void (async () => {
            await removePersonContentLink(target);
            await refresh();
          })();
        }}
      />
    </div>
  );
}

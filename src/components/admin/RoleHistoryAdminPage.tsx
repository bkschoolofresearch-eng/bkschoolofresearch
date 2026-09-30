'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useCms } from '@/components/admin/CmsProvider';
import {
  AdminLockedState,
  AdminPageHeader,
  AdminPrimaryButton,
} from '@/components/admin/AdminUI';
import { AdminLoading } from '@/components/admin/AdminLoading';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import {
  deleteRoleAssignment,
  syncPersonRoleSnapshot,
  upsertRoleAssignment,
} from '@/lib/cms/client-ops';

const fieldClass =
  'w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0B1F36] outline-none focus:border-[#0B1F36] focus:bg-white';

export function RoleHistoryAdminPage({ embedded = false }: { embedded?: boolean }) {
  const { database, ready, apiAuthenticated, refresh } = useCms();
  const [personId, setPersonId] = useState('');
  const [role, setRole] = useState('');
  const [year, setYear] = useState('2025-2026');
  const [yearFilter, setYearFilter] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editYear, setEditYear] = useState('');
  const [editRole, setEditRole] = useState('');

  const people = database?.people ?? [];
  const years = useMemo(() => {
    if (!database) return [];
    return Array.from(new Set(database.roleAssignments.map((row) => row.year))).sort(
      (a, b) => b.localeCompare(a),
    );
  }, [database]);

  const rows = useMemo(() => {
    if (!database) return [];
    const needle = query.trim().toLowerCase();
    return [...database.roleAssignments]
      .filter((row) => !yearFilter || row.year === yearFilter)
      .sort((a, b) => b.year.localeCompare(a.year) || (a.order ?? 0) - (b.order ?? 0))
      .map((row) => {
        const person = people.find((item) => item.id === row.personId);
        return {
          ...row,
          personName: person?.name ?? 'Unknown',
          adminHref: person ? `/admin/people/${person.id}` : null,
        };
      })
      .filter((row) => {
        if (!needle) return true;
        return `${row.personName} ${row.role} ${row.year}`.toLowerCase().includes(needle);
      });
  }, [database, people, yearFilter, query]);

  if (!ready) return <AdminLoading label="Loading appointments" />;
  if (!apiAuthenticated || !database) {
    return <AdminLockedState noun="committee appointments" />;
  }

  return (
    <div className="space-y-4">
      {embedded ? null : (
        <AdminPageHeader
          eyebrow="People"
          title="Committee appointments"
          description="Add the same person to a later season, or edit a row to change the year or position. Members cannot edit these."
        />
      )}

      <form
        className="grid gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_2px_rgba(11,31,54,0.04)] lg:grid-cols-[1.2fr_1fr_8rem_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          if (!personId || !role.trim() || !year.trim()) {
            setError('Choose a person, a position, and a season.');
            return;
          }
          void (async () => {
            await upsertRoleAssignment({ personId, role, year });
            await refresh();
            setRole('');
          })();
        }}
      >
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[#0B1F36]">Person</span>
          <select
            className={fieldClass}
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
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
          <span className="font-medium text-[#0B1F36]">Position</span>
          <input
            className={fieldClass}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Research Associate"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[#0B1F36]">Season</span>
          <input
            className={fieldClass}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2025-2026"
          />
        </label>
        <div className="flex items-end gap-2">
          <AdminPrimaryButton type="submit">
            <Plus className="h-4 w-4" />
            Add
          </AdminPrimaryButton>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:col-span-4">
          <button
            type="button"
            disabled={!personId}
            onClick={() => {
              if (!personId) return;
              void (async () => {
                const saved = await syncPersonRoleSnapshot(personId);
                if (!saved) {
                  setError('That profile needs a current position and a season first.');
                  return;
                }
                await refresh();
              })();
            }}
            className="text-sm font-semibold text-[#173B6C] disabled:opacity-40"
          >
            Copy their current position into history
          </button>
          {error ? <p className="text-sm text-[#8A3B3B]">{error}</p> : null}
        </div>
      </form>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A90A8]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search person or position"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0B1F36] focus:bg-white"
          />
        </div>
        <select
          className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">All seasons</option>
          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] uppercase tracking-[0.12em] text-[#7A90A8]">
            <tr>
              <th className="px-4 py-3 font-semibold">Season</th>
              <th className="px-4 py-3 font-semibold">Person</th>
              <th className="px-4 py-3 font-semibold">Position</th>
              <th className="px-4 py-3 font-semibold"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[#5B6B7C]">
                  No appointments for this search.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const editing = editId === row.id;
                return (
                <tr key={row.id} className="border-b border-[#EEF2F6] last:border-0">
                  <td className="px-4 py-3 font-medium text-[#0B1F36]">
                    {editing ? (
                      <input
                        className={fieldClass}
                        value={editYear}
                        onChange={(e) => setEditYear(e.target.value)}
                      />
                    ) : (
                      row.year
                    )}
                  </td>
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
                    {editing ? (
                      <input
                        className={fieldClass}
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                      />
                    ) : (
                      row.role
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      {editing ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!editYear.trim() || !editRole.trim()) return;
                            void (async () => {
                              await upsertRoleAssignment({
                                id: row.id,
                                personId: row.personId,
                                year: editYear,
                                role: editRole,
                              });
                              setEditId(null);
                              await refresh();
                            })();
                          }}
                          className="text-xs font-semibold text-[#173B6C]"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditId(row.id);
                            setEditYear(row.year);
                            setEditRole(row.role);
                          }}
                          className="text-xs font-semibold text-[#173B6C]"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteId(row.id)}
                        className="text-xs font-semibold text-[#8A3B3B]"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Remove this appointment?"
        description="Only this season row is removed. The person’s current position on the site stays."
        confirmLabel="Remove"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          const target = deleteId;
          setDeleteId(null);
          void (async () => {
            await deleteRoleAssignment(target);
            await refresh();
          })();
        }}
      />
    </div>
  );
}

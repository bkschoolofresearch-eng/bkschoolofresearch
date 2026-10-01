'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import {
  assignmentForPerson,
  nextTeamSectionSlug,
} from '@/lib/content/team-sections';
import { RESERVED_PEOPLE_CATEGORY_SLUGS } from '@/lib/content/people-slugs';
import type { TeamSection } from '@/types/content';
import { AdminLoading } from './AdminLoading';
import {
  AdminLockedState,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSecondaryButton,
} from './AdminUI';
import { ConfirmDialog } from './ConfirmDialog';
import { useCms } from './CmsProvider';

const fieldClass =
  'w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0B1F36] outline-none focus:border-[#0B1F36] focus:bg-white';

export function TeamSectionsAdminPage({ embedded = false }: { embedded?: boolean }) {
  const { database, ready, apiAuthenticated, saveSiteSettings, updateItem, refresh } =
    useCms();
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  if (!ready) return <AdminLoading label="Loading team sections" />;
  if (!apiAuthenticated || !database) {
    return <AdminLockedState noun="team sections" />;
  }

  const sections = [...(database.siteSettings.teamSections ?? [])].sort(
    (a, b) => a.order - b.order || a.label.localeCompare(b.label),
  );

  const saveSections = async (next: TeamSection[]) => {
    await saveSiteSettings({ teamSections: next });
    await refresh();
  };

  return (
    <div className="space-y-4">
      {embedded ? null : (
        <AdminPageHeader
          eyebrow="Team"
          title="Team sections"
          description="The four researcher sections are Distinguished Research Fellow, Senior Research Associate, Research Associate, and Research Assistant. Add another section only when a small group needs its own place."
          action={
            <Link href="/admin/people?tab=sections" className="text-sm font-semibold text-[#173B6C] hover:underline">
              Back to team
            </Link>
          }
        />
      )}

      <form
        className="grid gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 lg:grid-cols-[1fr_1.4fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          const name = label.trim();
          if (!name) {
            setError('Give the section a name.');
            return;
          }
          const slug = nextTeamSectionSlug(
            name,
            sections,
            database.people.map((person) => person.slug),
          );
          if (RESERVED_PEOPLE_CATEGORY_SLUGS[slug]) {
            setError('That name is already used by a built-in section.');
            return;
          }
          const next: TeamSection = {
            id: `section-${slug}`,
            slug,
            label: name,
            description: description.trim(),
            order: sections.reduce((max, section) => Math.max(max, section.order), 0) + 1,
          };
          void (async () => {
            await saveSections([...sections, next]);
            setLabel('');
            setDescription('');
          })();
        }}
      >
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[#0B1F36]">New section</span>
          <input
            className={fieldClass}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Visiting scholars"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[#0B1F36]">Short line on the team page</span>
          <input
            className={fieldClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
        </label>
        <div className="flex items-end">
          <AdminPrimaryButton type="submit">
            <Plus className="h-4 w-4" />
            Create section
          </AdminPrimaryButton>
        </div>
        {error ? (
          <p className="text-sm text-[#8A3B3B] lg:col-span-3">{error}</p>
        ) : null}
      </form>

      {sections.length === 0 ? (
        <p className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-10 text-center text-sm text-[#5B6B7C]">
          No extra sections yet. Create one, then assign people to it from their profile.
        </p>
      ) : (
        <ul className="space-y-2">
          {sections.map((section) => {
            const count = database.people.filter(
              (person) =>
                assignmentForPerson(person, database.siteSettings.teamSections)
                  .sectionSlug === section.slug,
            ).length;
            return (
              <li
                key={section.id}
                className="grid gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 lg:grid-cols-[1fr_1.4fr_auto]"
              >
                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium text-[#0B1F36]">Name</span>
                  <input
                    className={fieldClass}
                    defaultValue={section.label}
                    onBlur={(e) => {
                      const nextLabel = e.target.value.trim();
                      if (!nextLabel || nextLabel === section.label) return;
                      void saveSections(
                        sections.map((row) =>
                          row.id === section.id ? { ...row, label: nextLabel } : row,
                        ),
                      );
                    }}
                  />
                  <span className="text-xs text-[#7A90A8]">
                    /people/{section.slug} · {count}{' '}
                    {count === 1 ? 'person' : 'people'}
                  </span>
                </label>
                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium text-[#0B1F36]">Short line</span>
                  <input
                    className={fieldClass}
                    defaultValue={section.description}
                    onBlur={(e) => {
                      const nextDescription = e.target.value.trim();
                      if (nextDescription === section.description) return;
                      void saveSections(
                        sections.map((row) =>
                          row.id === section.id
                            ? { ...row, description: nextDescription }
                            : row,
                        ),
                      );
                    }}
                  />
                </label>
                <div className="flex items-end justify-end gap-2">
                  <Link
                    href={`/people/${section.slug}`}
                    className="text-sm font-semibold text-[#173B6C] hover:underline"
                  >
                    View
                  </Link>
                  <AdminSecondaryButton
                    type="button"
                    onClick={() => setDeleteSlug(section.slug)}
                  >
                    Remove
                  </AdminSecondaryButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleteSlug)}
        title="Remove this section?"
        description="People in it move to Other. Their profiles stay. The section page is removed."
        confirmLabel="Remove section"
        onCancel={() => setDeleteSlug(null)}
        onConfirm={() => {
          const slug = deleteSlug;
          setDeleteSlug(null);
          if (!slug) return;
          void (async () => {
            const members = database.people.filter((person) => person.sectionSlug === slug);
            await Promise.all(
              members.map((person) =>
                updateItem('people', person.id, {
                  sectionSlug: null,
                  category: 'other',
                }),
              ),
            );
            await saveSections(sections.filter((section) => section.slug !== slug));
          })();
        }}
      />
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import type { ContentStatus, Person, PersonSocialLink, RoleAssignment } from '@/types/content';
import { CloudinaryImageField } from '@/components/media/CloudinaryImageField';
import {
  allSections,
  assignmentForPerson,
  reservedSectionSlugs,
} from '@/lib/content/team-sections';
import {
  deleteRoleAssignment,
  syncPersonRoleSnapshot,
  upsertRoleAssignment,
} from '@/lib/cms/client-ops';
import { slugify } from '@/lib/utils';
import { AdminLoading } from './AdminLoading';
import { AdminLockedState, AdminPrimaryButton } from './AdminUI';
import { BodyEditor } from './BodyEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { useSaveConfirm } from './SaveAlert';
import { useCms } from './CmsProvider';

const fieldClass =
  'w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[15px] text-[#0B1F36] outline-none placeholder:text-[#7A90A8] focus:border-[#0B1F36] focus:bg-white focus:ring-2 focus:ring-[#0B1F36]/10';

type Draft = {
  name: string;
  slug: string;
  role: string;
  category: Person['category'];
  sectionSlug: string;
  status: ContentStatus;
  order: string;
  shortBio: string;
  bio: string;
  affiliation: string;
  phone: string;
  email: string;
  photoUrl: string;
  appointmentYear: string;
  interests: string;
  socialLinks: PersonSocialLink[];
};

function toDraft(person: Person): Draft {
  return {
    name: person.name,
    slug: person.slug,
    role: person.role,
    category: person.category,
    sectionSlug: person.sectionSlug ?? '',
    status: person.status,
    order: String(person.order ?? ''),
    shortBio: person.shortBio ?? '',
    bio: person.bio ?? '',
    affiliation: person.affiliation ?? '',
    phone: person.phone ?? '',
    email: person.email ?? '',
    photoUrl: person.photoUrl ?? '',
    appointmentYear: person.appointmentYear ?? '',
    interests: (person.researchInterests ?? []).join(', '),
    socialLinks: person.socialLinks?.length
      ? person.socialLinks.map((link) => ({ ...link }))
      : [{ label: '', url: '' }],
  };
}

export function PersonEditorPage({ id }: { id: string }) {
  const router = useRouter();
  const { database, ready, apiAuthenticated, updateItem, refresh, deleteItem } = useCms();
  const { askSave, saveDialog } = useSaveConfirm();
  const person = database?.people.find((item) => item.id === id);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [year, setYear] = useState('2025-2026');
  const [committeeRole, setCommitteeRole] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);

  useEffect(() => {
    if (person && !draft) setDraft(toDraft(person));
  }, [person, draft]);

  const appointments = useMemo(() => {
    if (!database) return [];
    return database.roleAssignments
      .filter((row) => row.personId === id)
      .sort((a, b) => b.year.localeCompare(a.year) || (a.order ?? 0) - (b.order ?? 0));
  }, [database, id]);

  if (!ready) return <AdminLoading label="Loading profile" />;
  if (!apiAuthenticated || !database) {
    return <AdminLockedState noun="this profile" />;
  }
  if (!person || !draft) {
    return <p className="text-sm text-[#5B6B7C]">This person is not in the team directory.</p>;
  }

  const claimed = Boolean(person.accountId);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft({ ...draft, [key]: value });

  const save = async () => {
    const name = draft.name.trim();
    const role = draft.role.trim();
    if (!name || !role) {
      setMessage('Name and position are required.');
      return;
    }
    if (!(await askSave())) return;
    const slug = slugify(slugTouched ? draft.slug : draft.slug || name);
    if (!slug || reservedSectionSlugs(database?.siteSettings.teamSections).has(slug)) {
      setMessage('Choose another page address. That one is reserved for a team section.');
      return;
    }
    const email = draft.email.trim().toLowerCase();
    if (claimed && !email) {
      setMessage('This profile is already claimed, so the email stays.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await updateItem('people', id, {
        ...person,
        name,
        slug,
        role,
        category: draft.sectionSlug ? 'other' : draft.category,
        sectionSlug: draft.sectionSlug || null,
        status: draft.status,
        order: Number(draft.order) || person.order || 99,
        shortBio: draft.shortBio.trim(),
        bio: draft.bio,
        affiliation: draft.affiliation.trim(),
        phone: draft.phone.trim(),
        email: email || undefined,
        photoUrl: draft.photoUrl.trim() || null,
        appointmentYear: draft.appointmentYear.trim() || null,
        researchInterests: draft.interests
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        socialLinks: draft.socialLinks.filter(
          (link) => link.label.trim() && link.url.trim(),
        ),
        claimStatus: claimed ? 'claimed' : email ? 'unclaimed' : undefined,
      });
      setMessage('Saved');
      window.setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/people"
          className="inline-flex items-center gap-1.5 text-sm text-[#5B6B7C] hover:text-[#0B1F36]"
        >
          <ArrowLeft className="h-4 w-4" />
          Team
        </Link>
        <div className="flex items-center gap-2">
          {message ? (
            <span className="text-xs font-semibold text-[#173B6C]">{message}</span>
          ) : null}
          {person.slug ? (
            <Link
              href={`/people/${person.slug}`}
              className="text-sm font-semibold text-[#173B6C] hover:underline"
            >
              View profile
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setRemoveOpen(true)}
            className="text-sm font-semibold text-[#8A3B3B]"
          >
            Remove person
          </button>
          <AdminPrimaryButton onClick={() => void save()} disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </AdminPrimaryButton>
        </div>
      </div>

      <Section title="Basics" help="Name, position, and which team section this person belongs to.">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#0B1F36]">Name</span>
          <input
            value={draft.name}
            onChange={(e) => {
              const name = e.target.value;
              setDraft({
                ...draft,
                name,
                slug: slugTouched ? draft.slug : slugify(name),
              });
            }}
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#0B1F36]">Position</span>
          <input
            value={draft.role}
            onChange={(e) => set('role', e.target.value)}
            className={fieldClass}
          />
        </label>
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-[#0B1F36]">Team section</span>
          <div className="flex flex-wrap gap-2">
            {allSections(database.siteSettings.teamSections).map((section) => {
              const selected =
                assignmentForPerson(
                  {
                    category: draft.category,
                    sectionSlug: draft.sectionSlug || null,
                  },
                  database.siteSettings.teamSections,
                ).key === section.key;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      category: section.category,
                      sectionSlug: section.sectionSlug ?? '',
                    })
                  }
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    selected
                      ? 'bg-[#0B1F36] text-white'
                      : 'bg-[#F4F7FB] text-[#0B1F36]'
                  }`}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
          <Link href="/admin/people?tab=sections" className="text-xs font-semibold text-[#173B6C] hover:underline">
            Create a section
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#0B1F36]">Page address</span>
            <input
              value={draft.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set('slug', e.target.value);
              }}
              className={fieldClass}
            />
            <span className="text-xs text-[#7A90A8]">/people/{slugify(draft.slug || draft.name) || '…'}</span>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#0B1F36]">Display order</span>
            <input
              value={draft.order}
              onChange={(e) => set('order', e.target.value)}
              className={fieldClass}
            />
            <span className="text-xs text-[#7A90A8]">Lower numbers appear first in the section.</span>
          </label>
        </div>
        <div className="flex gap-2">
          {(['draft', 'published'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => set('status', status)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                draft.status === status
                  ? 'bg-[#0B1F36] text-white'
                  : 'bg-[#F4F7FB] text-[#0B1F36]'
              }`}
            >
              {status === 'published' ? 'On site' : 'Draft'}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Profile" help="What visitors read on the person page and the flip card.">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#0B1F36]">Short line</span>
          <textarea
            value={draft.shortBio}
            rows={2}
            onChange={(e) => set('shortBio', e.target.value)}
            className={fieldClass}
          />
        </label>
        <BodyEditor label="Biography" value={draft.bio} onChange={(bio) => set('bio', bio)} rows={8} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#0B1F36]">Affiliation</span>
            <input
              value={draft.affiliation}
              onChange={(e) => set('affiliation', e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#0B1F36]">Phone</span>
            <input
              value={draft.phone}
              onChange={(e) => set('phone', e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
        <CloudinaryImageField
          label="Photo"
          value={draft.photoUrl}
          onChange={(photoUrl) => set('photoUrl', photoUrl)}
          previewAspect="portrait"
        />
      </Section>

      <Section title="Account" help="The invite is only so they can open an account with this email and edit their own profile. Photo, bio, position, and section stay editable here.">
        <p className="text-sm text-[#5B6B7C]">
          {claimed
            ? 'Account active. You can still edit this profile, including the photo. The login email stays with their account.'
            : draft.email
              ? 'No account yet. Send the invite when you want them to take over this profile.'
              : 'No email yet. Add one when you are ready to invite them.'}
        </p>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#0B1F36]">Email</span>
          <input
            type="email"
            value={draft.email}
            disabled={claimed}
            onChange={(e) => set('email', e.target.value)}
            className={fieldClass}
          />
        </label>
        {!claimed ? (
          <button
            type="button"
            onClick={() => {
              const email = draft.email.trim().toLowerCase();
              if (!email.includes('@')) {
                setMessage('Add an email, save, then send the invite.');
                return;
              }
              if (email !== (person.email ?? '').toLowerCase()) {
                setMessage('Save the profile first so the invite uses this email.');
                return;
              }
              void (async () => {
                const res = await fetch('/api/auth/invite', {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ personId: person.id }),
                });
                const data = (await res.json()) as { error?: string; emailSent?: boolean };
                setMessage(
                  res.ok
                    ? data.emailSent
                      ? `Invite sent to ${email}.`
                      : 'Invite link created. Mail is not configured, so share it from the team list.'
                    : data.error || 'Could not send the invite.',
                );
              })();
            }}
            className="text-sm font-semibold text-[#173B6C]"
          >
            Send invite email
          </button>
        ) : null}
        <p className="text-sm text-[#0B1F36]">
          Verification code:{' '}
          <span className="font-medium">{person.verificationCode || 'Assigned when the profile is created'}</span>
        </p>
      </Section>

      <Section title="Interests and links" help="Shown on the profile. Separate interests with commas.">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#0B1F36]">Research interests</span>
          <input
            value={draft.interests}
            onChange={(e) => set('interests', e.target.value)}
            className={fieldClass}
          />
        </label>
        <div className="space-y-2">
          <span className="text-sm font-medium text-[#0B1F36]">Links</span>
          {draft.socialLinks.map((link, index) => (
            <div key={index} className="grid grid-cols-[8rem_1fr_auto] gap-2">
              <input
                value={link.label}
                placeholder="Label"
                onChange={(e) => {
                  const socialLinks = draft.socialLinks.map((item, i) =>
                    i === index ? { ...item, label: e.target.value } : item,
                  );
                  set('socialLinks', socialLinks);
                }}
                className={fieldClass}
              />
              <input
                value={link.url}
                placeholder="https://"
                onChange={(e) => {
                  const socialLinks = draft.socialLinks.map((item, i) =>
                    i === index ? { ...item, url: e.target.value } : item,
                  );
                  set('socialLinks', socialLinks);
                }}
                className={fieldClass}
              />
              <button
                type="button"
                aria-label="Remove link"
                onClick={() =>
                  set(
                    'socialLinks',
                    draft.socialLinks.filter((_, i) => i !== index),
                  )
                }
                className="rounded-lg px-2 text-[#7A90A8] hover:bg-[#F4F7FB]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              set('socialLinks', [...draft.socialLinks, { label: '', url: '' }])
            }
            className="text-sm font-semibold text-[#173B6C]"
          >
            Add link
          </button>
        </div>
      </Section>

      <Section
        title="Committee appointments"
        help="Add this person to another season, or edit a row to change the year or position. The position above is what the site shows now."
      >
        <div className="grid gap-2 sm:grid-cols-[8rem_1fr_auto]">
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2025-2026"
            className={fieldClass}
          />
          <input
            value={committeeRole}
            onChange={(e) => setCommitteeRole(e.target.value)}
            placeholder="Position that season"
            className={fieldClass}
          />
          <button
            type="button"
            onClick={() => {
              if (!committeeRole.trim() || !year.trim()) return;
              void (async () => {
                await upsertRoleAssignment({
                  personId: id,
                  role: committeeRole,
                  year,
                });
                setCommitteeRole('');
                await refresh();
              })();
            }}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#0B1F36] px-3 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            if (
              draft.role.trim() !== person.role ||
              (draft.appointmentYear.trim() || null) !== (person.appointmentYear ?? null)
            ) {
              setMessage('Save the profile first, then copy the position into history.');
              return;
            }
            void (async () => {
              await syncPersonRoleSnapshot(id);
              await refresh();
            })();
          }}
          className="text-left text-sm font-semibold text-[#173B6C]"
        >
          Copy the current position into {draft.appointmentYear || 'the season above'}
        </button>
        {appointments.length ? (
          <ul className="space-y-1">
            {appointments.map((row) => (
              <SeasonRow
                key={row.id}
                row={row}
                onRemove={() => setDeleteId(row.id)}
                onSaved={() => void refresh()}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#5B6B7C]">No seasons recorded yet.</p>
        )}
        <Link href="/admin/people?tab=years" className="text-sm font-semibold text-[#173B6C] hover:underline">
          All committee appointments
        </Link>
      </Section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push('/admin/people')}
          className="text-sm text-[#5B6B7C]"
        >
          Back to team
        </button>
      </div>

      {saveDialog}
      <ConfirmDialog
        open={removeOpen}
        title={person ? `Remove ${person.name}?` : 'Remove this person?'}
        description="They leave the team page. Their committee years are removed, their login stops, and their photo is deleted if nothing else uses it."
        confirmLabel="Remove"
        onCancel={() => setRemoveOpen(false)}
        onConfirm={() => {
          setRemoveOpen(false);
          void (async () => {
            await deleteItem('people', id);
            router.push('/admin/people');
            await refresh();
          })();
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Remove this appointment?"
        description="The season row is removed. The person’s current position on the site stays as it is."
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

function SeasonRow({
  row,
  onRemove,
  onSaved,
}: {
  row: RoleAssignment;
  onRemove: () => void;
  onSaved: () => void;
}) {
  const [year, setYear] = useState(row.year);
  const [role, setRole] = useState(row.role);
  const [saving, setSaving] = useState(false);
  const dirty = year.trim() !== row.year || role.trim() !== row.role;

  return (
    <li className="grid items-center gap-2 rounded-lg bg-[#F4F7FB] px-3 py-2 text-sm sm:grid-cols-[8rem_1fr_auto]">
      <input
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className={fieldClass}
        aria-label="Season"
      />
      <input
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className={fieldClass}
        aria-label="Position that season"
      />
      <div className="flex justify-end gap-3">
        {dirty ? (
          <button
            type="button"
            disabled={saving || !year.trim() || !role.trim()}
            onClick={() => {
              setSaving(true);
              void (async () => {
                await upsertRoleAssignment({
                  id: row.id,
                  personId: row.personId,
                  year,
                  role,
                });
                onSaved();
                setSaving(false);
              })();
            }}
            className="text-xs font-semibold text-[#173B6C] disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-semibold text-[#8A3B3B]"
        >
          Remove
        </button>
      </div>
    </li>
  );
}

function Section({
  title,
  help,
  children,
}: {
  title: string;
  help: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_2px_rgba(11,31,54,0.04)]">
      <h2 className="font-[family-name:var(--font-admin-display)] text-lg text-[#0B1F36]">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[#5B6B7C]">{help}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

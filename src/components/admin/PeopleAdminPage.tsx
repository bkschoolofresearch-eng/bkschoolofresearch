'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Mail, Pencil, Plus, Search, UserPlus } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { getPersonClaimStatus } from '@/lib/auth/permissions';
import {
  allSections,
  assignmentForPerson,
  sectionByKey,
} from '@/lib/content/team-sections';
import type { Person } from '@/types/content';
import {
  AdminLockedState,
  AdminPageHeader,
  AdminPanel,
  AdminPrimaryButton,
  AdminSecondaryButton,
} from './AdminUI';
import { StatusBadge } from './StatusBadge';
import { useCms } from './CmsProvider';

export function PeopleAdminPage({ embedded = false }: { embedded?: boolean }) {
  const { database, ready, apiAuthenticated, refresh, deleteItem } = useCms();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [removePerson, setRemovePerson] = useState<Person | null>(null);

  const sections = allSections(database?.siteSettings.teamSections);

  const people = useMemo(() => {
    if (!database) return [];
    return [...database.people]
      .filter((person) => {
        const sectionKey = assignmentForPerson(
          person,
          database.siteSettings.teamSections,
        ).key;
        if (category && sectionKey !== category) return false;
        if (!query.trim()) return true;
        const blob = [person.name, person.role, person.email, sectionKey]
          .join(' ')
          .toLowerCase();
        return blob.includes(query.trim().toLowerCase());
      })
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [database, query, category]);

  const grouped = useMemo(() => {
    if (!database) return [];
    return sections
      .map((section) => ({
        key: section.key,
        label: section.label,
        items: people.filter(
          (person) =>
            assignmentForPerson(person, database.siteSettings.teamSections).key ===
            section.key,
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [database, people, sections]);

  const sendInvite = async (person: Person) => {
    if (person.accountId) return;
    if (!person.email) {
      setLastInviteUrl(null);
      setInviteMessage('Add an email on the profile, then send the invite.');
      return;
    }
    setSendingId(person.id);
    setInviteMessage(null);
    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId: person.id }),
      });
      const data = (await res.json()) as {
        error?: string;
        inviteUrl?: string | null;
        emailSent?: boolean;
      };
      if (!res.ok) {
        setInviteMessage(data.error || 'Could not send the invite.');
        setLastInviteUrl(null);
        return;
      }
      setInviteMessage(
        data.emailSent
          ? `Invite sent to ${person.email}.`
          : `Invite ready for ${person.email}. Copy the link below if mail is not configured.`,
      );
      setLastInviteUrl(data.inviteUrl ?? null);
    } catch {
      setInviteMessage('Could not send the invite.');
    } finally {
      setSendingId(null);
    }
  };

  if (!ready) {
    return <p className="text-sm text-[#5B6B7C]">Loading team…</p>;
  }

  if (!apiAuthenticated || !database) {
    return <AdminLockedState noun="the team directory" />;
  }

  return (
    <div className="space-y-6">
      {embedded ? (
        <div className="flex justify-end">
          <AdminPrimaryButton onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add person
          </AdminPrimaryButton>
        </div>
      ) : (
        <AdminPageHeader
          eyebrow="Team"
          title="Team & people"
          description="Add someone to a section now. Send the invite when you want them to create an account and edit their own profile. You can still change any profile, including the photo."
          action={
            <AdminPrimaryButton onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Add person
            </AdminPrimaryButton>
          }
        />
      )}

      {inviteMessage ? (
        <AdminPanel className="space-y-2 border-[#C5D4E8] bg-[#F4F8FC] p-4 text-sm text-[#0B1F36]">
          <p className="font-semibold">{inviteMessage}</p>
          {lastInviteUrl ? (
            <p className="break-all text-xs text-[#5B6B7C]">
              Invite link (also emailed when mail is configured):{' '}
              <a href={lastInviteUrl} className="font-medium text-[#173B6C] underline">
                {lastInviteUrl}
              </a>
            </p>
          ) : null}
        </AdminPanel>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-[0_1px_2px_rgba(11,31,54,0.04)] sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A90A8]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, role…"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0B1F36] focus:bg-white"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm"
        >
          <option value="">All sections</option>
          {sections.map((section) => (
            <option key={section.key} value={section.key}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {people.length === 0 ? (
        <AdminPanel className="px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[#0B1F36]">No people yet</p>
          <p className="mt-1 text-sm text-[#5B6B7C]">
            Add a name and position. Email can wait.
          </p>
          <div className="mt-4 flex justify-center">
            <AdminPrimaryButton onClick={() => setInviteOpen(true)}>
              <Plus className="h-4 w-4" />
              Add person
            </AdminPrimaryButton>
          </div>
        </AdminPanel>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.key} className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <h2 className="font-[family-name:var(--font-admin-display)] text-xl text-[#0B1F36]">
                  {group.label}
                </h2>
                <p className="text-xs text-[#7A90A8]">
                  {group.items.length}{' '}
                  {group.items.length === 1 ? 'person' : 'people'}
                </p>
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(11,31,54,0.04)] md:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] uppercase tracking-[0.12em] text-[#7A90A8]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Member</th>
                      <th className="px-4 py-3 font-semibold">Position</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Account</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((person) => (
                      <PersonTableRow
                        key={person.id}
                        person={person}
                        sending={sendingId === person.id}
                        onSend={() => void sendInvite(person)}
                        onRemove={() => setRemovePerson(person)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile compact cards */}
              <ul className="grid gap-2 md:hidden">
                {group.items.map((person) => (
                  <PersonMobileCard
                    key={person.id}
                    person={person}
                    onRemove={() => setRemovePerson(person)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(removePerson)}
        title={removePerson ? `Remove ${removePerson.name}?` : 'Remove this person?'}
        description="They leave the team page. Their committee years are removed, their login stops, and their photo is deleted if nothing else uses it."
        confirmLabel="Remove"
        onCancel={() => setRemovePerson(null)}
        onConfirm={() => {
          const person = removePerson;
          setRemovePerson(null);
          if (!person) return;
          void (async () => {
            await deleteItem('people', person.id);
            await refresh();
          })();
        }}
      />

      {inviteOpen ? (
        <InvitePersonModal
          sections={sections}
          onClose={() => setInviteOpen(false)}
          onInvited={async (result) => {
            setInviteOpen(false);
            setInviteMessage(
              result.inviteUrl
                ? result.emailSent
                  ? `Invite sent to ${result.person.email}.`
                  : `Added ${result.person.name}. Copy the invite link below if mail is not configured.`
                : `Added ${result.person.name}. Send the invite whenever you are ready.`,
            );
            setLastInviteUrl(result.inviteUrl);
            await refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function claimLabel(person: Person) {
  const claim = getPersonClaimStatus(person);
  if (claim === 'claimed') return 'Account active';
  if (claim === 'unclaimed') return 'Invite pending';
  return 'No email';
}

function PersonTableRow({
  person,
  sending,
  onSend,
  onRemove,
}: {
  person: Person;
  sending: boolean;
  onSend: () => void;
  onRemove: () => void;
}) {
  return (
    <tr className="border-b border-[#EEF2F6] last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <PersonAvatar person={person} size={40} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#0B1F36]">{person.name}</p>
            <p className="text-xs text-[#7A90A8]">#{person.order ?? '—'}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-[#5B6B7C]">{person.role}</td>
      <td className="px-4 py-3">
        {person.email ? (
          <span className="inline-flex items-center gap-1 text-[#5B6B7C]">
            <Mail className="h-3.5 w-3.5" />
            {person.email}
          </span>
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3 text-[#5B6B7C]">{claimLabel(person)}</td>
      <td className="px-4 py-3">
        <StatusBadge status={person.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1">
          {!person.accountId ? (
            <button
              type="button"
              disabled={sending}
              onClick={onSend}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-[#173B6C] hover:bg-[#EEF2F6] disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send invite'}
            </button>
          ) : null}
          <Link
            href={`/admin/people/${person.id}`}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#173B6C] hover:bg-[#EEF2F6]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg px-2 py-1.5 text-xs font-semibold text-[#8A3B3B] hover:bg-[#F8F1F1]"
          >
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}

function PersonMobileCard({
  person,
  onRemove,
}: {
  person: Person;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3">
      <Link
        href={`/admin/people/${person.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <PersonAvatar person={person} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0B1F36]">
            {person.name}
          </p>
          <p className="truncate text-xs text-[#5B6B7C]">{person.role}</p>
          <p className="truncate text-[11px] text-[#7A90A8]">
            {person.email || 'No email'} · {claimLabel(person)}
          </p>
        </div>
        <StatusBadge status={person.status} />
      </Link>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-xs font-semibold text-[#8A3B3B]"
      >
        Remove
      </button>
    </li>
  );
}

function PersonAvatar({ person, size }: { person: Person; size: number }) {
  if (person.photoUrl) {
    return (
      <span
        className="relative shrink-0 overflow-hidden rounded-full bg-[#EEF2F6]"
        style={{ width: size, height: size }}
      >
        <Image
          src={person.photoUrl}
          alt=""
          fill
          className="object-cover"
          sizes={`${size}px`}
          unoptimized={person.photoUrl.startsWith('http')}
        />
      </span>
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#0B1F36] text-xs font-semibold text-white"
      style={{ width: size, height: size }}
    >
      {person.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function InvitePersonModal({
  sections,
  onClose,
  onInvited,
}: {
  sections: ReturnType<typeof allSections>;
  onClose: () => void;
  onInvited: (result: {
    person: Person;
    inviteUrl: string | null;
    emailSent: boolean;
  }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [sectionKey, setSectionKey] = useState('builtin:research-team');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B1F36]/45 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xl">
        <h2 className="font-[family-name:var(--font-admin-display)] text-xl text-[#0B1F36]">
          Add a team member
        </h2>
        <p className="mt-1 text-sm text-[#5B6B7C]">
          Name, position, and section are enough. The invite email is only so
          they can create an account and edit their own profile. You can send
          it now or later.
        </p>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const submitter = (e.nativeEvent as SubmitEvent).submitter;
            const sendInvite =
              submitter instanceof HTMLButtonElement && submitter.value === 'invite';
            const section = sectionByKey(sectionKey, undefined);
            const chosen = sections.find((item) => item.key === sectionKey) ?? section;
            if (sendInvite && !email.trim().includes('@')) {
              setError('Add an email to send the invite, or add them without sending.');
              return;
            }
            setBusy(true);
            setError(null);
            void (async () => {
              try {
                const res = await fetch('/api/auth/invite', {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name,
                    email,
                    role,
                    category: chosen.category,
                    sectionSlug: chosen.sectionSlug,
                    sendInvite,
                  }),
                });
                const data = (await res.json()) as {
                  error?: string;
                  person?: Person;
                  inviteUrl?: string | null;
                  emailSent?: boolean;
                };
                if (!res.ok || !data.person) {
                  setError(data.error || 'Could not add this person.');
                  return;
                }
                await onInvited({
                  person: data.person,
                  inviteUrl: data.inviteUrl ?? null,
                  emailSent: Boolean(data.emailSent),
                });
              } catch {
                setError('Could not add this person.');
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          <label className="block text-sm">
            <span className="font-medium text-[#0B1F36]">Full name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[#0B1F36]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Optional until you send an invite"
              className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[#0B1F36]">Position / role</span>
            <input
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Research Associate"
              className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[#0B1F36]">Team section</span>
            <select
              value={sectionKey}
              onChange={(e) => setSectionKey(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5"
            >
              {sections.map((section) => (
                <option key={section.key} value={section.key}>
                  {section.label}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <p className="rounded-xl border border-[#F0D4D4] bg-[#FFF8F8] px-3 py-2 text-sm text-[#8A3B3B]">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <AdminSecondaryButton type="button" onClick={onClose}>
              Cancel
            </AdminSecondaryButton>
            <AdminSecondaryButton type="submit" value="add" disabled={busy}>
              {busy ? 'Adding…' : 'Add without sending'}
            </AdminSecondaryButton>
            <AdminPrimaryButton type="submit" value="invite" disabled={busy}>
              {busy ? 'Adding…' : 'Add and send invite'}
            </AdminPrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

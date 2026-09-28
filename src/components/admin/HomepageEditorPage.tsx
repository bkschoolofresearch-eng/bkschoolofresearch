'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import type { HomepageConfig } from '@/types/content';
import {
  AdminLockedState,
  AdminPageHeader,
  AdminPrimaryButton,
} from './AdminUI';
import { hydrateHomepagePicks, type HomepageQuote } from '@/lib/content/homepage-live';
import { useCms } from './CmsProvider';

const fieldClass =
  'w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[15px] text-[#0B1F36] outline-none placeholder:text-[#7A90A8] focus:border-[#0B1F36] focus:bg-white focus:ring-2 focus:ring-[#0B1F36]/10';

type PickKey =
  | 'featuredResearchProjectIds'
  | 'featuredResearchAreaIds'
  | 'featuredNoticeIds'
  | 'featuredEventIds'
  | 'featuredMediaClippingIds'
  | 'featuredPersonIds'
  | 'featuredPublicationIds';

function withPickLists(home: HomepageConfig): HomepageConfig {
  return {
    ...home,
    featuredResearchAreaIds: home.featuredResearchAreaIds ?? [],
    featuredMediaClippingIds: home.featuredMediaClippingIds ?? [],
    featuredPersonIds: home.featuredPersonIds ?? [],
    featuredNoticeIds: home.featuredNoticeIds ?? [],
  };
}

export function HomepageEditorPage() {
  const { database, ready, saveHomepage, apiAuthenticated } = useCms();
  const [form, setForm] = useState<HomepageConfig | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!database) return;
    const home = structuredClone(database.homepage);
    setForm(
      hydrateHomepagePicks(home, {
        areas: database.researchAreas ?? [],
        projects: database.researchProjects ?? [],
        people: database.people ?? [],
        notices: database.notices ?? [],
        events: database.events ?? [],
        media: database.mediaClippings ?? [],
        opinions: database.publications ?? [],
      }),
    );
  }, [database]);

  const publishedPeople = useMemo(
    () => (database?.people ?? []).filter((p) => p.status === 'published'),
    [database],
  );
  const publishedResearch = useMemo(
    () =>
      (database?.researchProjects ?? []).filter((p) => p.status === 'published'),
    [database],
  );
  const publishedAreas = useMemo(
    () =>
      [...(database?.researchAreas ?? [])]
        .filter((p) => p.status === 'published')
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [database],
  );
  const publishedNotices = useMemo(
    () => (database?.notices ?? []).filter((p) => p.status === 'published'),
    [database],
  );
  const publishedEvents = useMemo(
    () => (database?.events ?? []).filter((p) => p.status === 'published'),
    [database],
  );
  const publishedMedia = useMemo(
    () => (database?.mediaClippings ?? []).filter((p) => p.status === 'published'),
    [database],
  );
  const publishedOpinions = useMemo(
    () =>
      (database?.publications ?? []).filter(
        (p) => p.status === 'published' && p.type === 'opinion',
      ),
    [database],
  );

  if (!ready) {
    return <p className="text-sm text-[#5B6B7C]">Loading homepage…</p>;
  }

  if (!apiAuthenticated || !database || !form) {
    return <AdminLockedState noun="homepage picks" />;
  }

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const next = withPickLists(form);
      await saveHomepage(next);
      setForm(next);
      setMessage('Saved — public homepage will refresh shortly');
      window.setTimeout(() => setMessage(null), 2500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleId = (key: PickKey, id: string) => {
    const current = form[key] ?? [];
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    setForm({ ...form, [key]: next });
  };

  const teamPeople = publishedPeople.filter(
    (person) => person.id !== form.directorPersonId,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Homepage"
        title="What the homepage shows"
        description="These are the library items the homepage is showing now. Search to add another, or remove one, then save."
        action={
          <>
            {message ? (
              <span className="text-xs font-semibold text-[#173B6C]">
                {message}
              </span>
            ) : null}
            <AdminPrimaryButton onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving…' : 'Save homepage'}
            </AdminPrimaryButton>
          </>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card
          className="lg:col-span-2"
          title="Message from the Executive Director"
          help="Name and photo come from Team. This is only the short message on the homepage."
          action={<LibraryLink href="/admin/people">Open team</LibraryLink>}
        >
          <div className="grid gap-3 lg:grid-cols-[18rem_1fr]">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[#0B1F36]">Person</span>
              <select
                value={form.directorPersonId}
                onChange={(e) =>
                  setForm({ ...form, directorPersonId: e.target.value })
                }
                className={fieldClass}
              >
                {publishedPeople.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.role}
                  </option>
                ))}
              </select>
            </label>
            <TextArea
              label="Homepage message"
              value={form.directorMessageExcerpt}
              onChange={(v) => setForm({ ...form, directorMessageExcerpt: v })}
              rows={4}
            />
          </div>
        </Card>

        <Picker
          title="Focus areas"
          help="Shown in this order. Search to add one. X takes one off."
          items={publishedAreas.map((area) => ({
            id: area.id,
            label: area.title,
          }))}
          selected={form.featuredResearchAreaIds ?? []}
          onToggle={(id) => toggleId('featuredResearchAreaIds', id)}
          manageHref="/admin/research-areas"
        />

        <Picker
          title="Our Research"
          help="1 and 2 are the large cards. 3, 4 and 5 sit beside them."
          items={publishedResearch.map((item) => ({
            id: item.id,
            label: item.title,
          }))}
          selected={form.featuredResearchProjectIds}
          onToggle={(id) => toggleId('featuredResearchProjectIds', id)}
          manageHref="/admin/research"
        />

        <Card
          title="Our Programs"
          help="These three cards always appear. The line under each is the programme that supplies the photo."
          action={
            <LibraryLink href="/admin/activities">Open programmes</LibraryLink>
          }
        >
          <ul className="space-y-1">
            {(
              [
                ['capacity-building', 'Capacity Building'],
                ['research-talk', 'Policy & Academic Engagement'],
                ['awareness-campaign', 'Community & Social Impact'],
              ] as const
            ).map(([type, title]) => {
              const activity = (database.activities ?? []).find(
                (item) => item.status === 'published' && item.type === type,
              );
              return (
                <li key={type} className="rounded-lg bg-[#F4F7FB] px-3 py-2">
                  <p className="text-sm font-medium text-[#0B1F36]">{title}</p>
                  <p className="truncate text-xs text-[#5B6B7C]">
                    {activity ? activity.title : 'No programme on site'}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>

        <Picker
          title="Notices"
          help="The first three in this list appear."
          items={publishedNotices.map((item) => ({
            id: item.id,
            label: item.title,
          }))}
          selected={form.featuredNoticeIds ?? []}
          onToggle={(id) => toggleId('featuredNoticeIds', id)}
          manageHref="/admin/notices"
        />

        <Picker
          title="Events"
          help="The first three in this list appear."
          items={publishedEvents.map((item) => ({
            id: item.id,
            label: item.title,
          }))}
          selected={form.featuredEventIds}
          onToggle={(id) => toggleId('featuredEventIds', id)}
          manageHref="/admin/events"
        />

        <Picker
          title="BKSR in Media"
          help="The first six in this list appear."
          items={publishedMedia.map((item) => ({
            id: item.id,
            label: item.venue ? `${item.title} — ${item.venue}` : item.title,
          }))}
          selected={form.featuredMediaClippingIds ?? []}
          onToggle={(id) => toggleId('featuredMediaClippingIds', id)}
          manageHref="/admin/bksr-in-media"
        />

        <Picker
          title="Meet our team"
          help="The first four appear under the director."
          items={teamPeople.map((person) => ({
            id: person.id,
            label: `${person.name} — ${person.role}`,
          }))}
          selected={form.featuredPersonIds ?? []}
          onToggle={(id) => toggleId('featuredPersonIds', id)}
          manageHref="/admin/people"
        />

        <ResearcherQuotesCard
          quotes={form.researcherQuotes ?? []}
          people={publishedPeople}
          onChange={(quotes) => setForm({ ...form, researcherQuotes: quotes })}
        />

        <Picker
          title="Opinions"
          help="The first three in this list appear."
          items={publishedOpinions.map((item) => ({
            id: item.id,
            label: item.title,
          }))}
          selected={form.featuredPublicationIds.filter((id) =>
            publishedOpinions.some((item) => item.id === id),
          )}
          onToggle={(id) => toggleId('featuredPublicationIds', id)}
          manageHref="/admin/publications"
        />

        <p className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#5B6B7C] lg:col-span-2">
          Who we are and Collaboration & Partnerships are part of the page design, not library records, so they are not listed here.
        </p>
      </div>
    </div>
  );
}

const SEARCH_MATCH_LIMIT = 8;

function Card({
  title,
  help,
  count,
  action,
  className = '',
  children,
}: {
  title: string;
  help: string;
  count?: number;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_2px_rgba(11,31,54,0.04)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-[family-name:var(--font-admin-display)] text-lg leading-tight text-[#0B1F36]">
              {title}
            </h2>
            {count != null ? (
              <span className="rounded-full bg-[#E8EEF6] px-2 py-0.5 text-[11px] font-semibold text-[#173B6C]">
                {count} showing
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-snug text-[#5B6B7C]">{help}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-2">{children}</div>
    </section>
  );
}

function LibraryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-semibold text-[#173B6C] hover:underline"
    >
      {children}
    </Link>
  );
}

function Picker({
  title,
  help,
  items,
  selected,
  onToggle,
  manageHref,
}: {
  title: string;
  help: string;
  items: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  manageHref: string;
}) {
  const [query, setQuery] = useState('');
  const order = new Map(selected.map((id, index) => [id, index + 1]));
  const byId = new Map(items.map((item) => [item.id, item]));
  const needle = query.trim().toLowerCase();
  const selectedItems = selected.map(
    (id) => byId.get(id) ?? { id, label: 'Saved item' },
  );
  const unmatched = needle
    ? items.filter(
        (item) =>
          !order.has(item.id) && item.label.toLowerCase().includes(needle),
      )
    : [];
  const matches = unmatched.slice(0, SEARCH_MATCH_LIMIT);
  const hiddenMatches = unmatched.length - matches.length;

  return (
    <Card
      title={title}
      help={help}
      count={selectedItems.length}
      action={<LibraryLink href={manageHref}>Open library</LibraryLink>}
    >
      {items.length === 0 ? (
        <p className="text-sm text-[#5B6B7C]">Nothing is on site yet.</p>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A90A8]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title"
            aria-label={`Search ${title} by title`}
            className={`${fieldClass} py-2 pl-9 text-sm`}
          />
        </div>
      )}

      {needle ? (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
          {matches.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[#5B6B7C]">
              No title matches that search.
            </p>
          ) : (
            <ul>
              {matches.map((item) => (
                <li key={item.id} className="border-b border-[#EEF2F6] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => {
                      onToggle(item.id);
                      setQuery('');
                    }}
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-[#F4F7FB]"
                  >
                    <span className="mt-0.5 shrink-0 text-xs font-semibold text-[#173B6C]">
                      Add
                    </span>
                    <span className="text-sm leading-snug text-[#0B1F36]">
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {hiddenMatches > 0 ? (
            <p className="border-t border-[#EEF2F6] px-3 py-2 text-xs text-[#7A90A8]">
              Keep typing to narrow the matches.
            </p>
          ) : null}
        </div>
      ) : null}

      {selectedItems.length ? (
        <ul className="max-h-52 space-y-1 overflow-y-auto pr-1">
          {selectedItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-lg bg-[#F4F7FB] px-2 py-1.5"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B1F36] text-[10px] font-semibold text-white">
                {order.get(item.id)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-[#0B1F36]">
                {item.label}
              </span>
              <button
                type="button"
                aria-label={`Remove ${item.label}`}
                onClick={() => onToggle(item.id)}
                className="rounded-full p-1 text-[#7A90A8] hover:bg-white hover:text-[#0B1F36]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : items.length > 0 && !needle ? (
        <p className="text-sm leading-relaxed text-[#5B6B7C]">
          Nothing from this library is on the homepage.
        </p>
      ) : null}
    </Card>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  help?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-sm font-medium text-[#0B1F36]">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={fieldClass}
      />
      {help ? (
        <span className="text-xs leading-snug text-[#7A90A8]">{help}</span>
      ) : null}
    </label>
  );
}

function ResearcherQuotesCard({
  quotes,
  people,
  onChange,
}: {
  quotes: HomepageQuote[];
  people: { id: string; name: string; role: string; photoUrl?: string | null }[];
  onChange: (quotes: HomepageQuote[]) => void;
}) {
  const [personId, setPersonId] = useState('');
  const [quote, setQuote] = useState('');

  const add = () => {
    const person = people.find((item) => item.id === personId);
    const text = quote.trim();
    if (!person || !text) return;
    onChange([
      ...quotes,
      {
        name: person.name,
        role: person.role,
        imageSrc: person.photoUrl ?? '',
        quote: text,
      },
    ]);
    setPersonId('');
    setQuote('');
  };

  return (
    <Card
      title="What our researchers say"
      help="These lines appear in that homepage section. Edit the words here."
      count={quotes.length}
      action={<LibraryLink href="/admin/people">Open team</LibraryLink>}
    >
      {quotes.length ? (
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {quotes.map((item, index) => (
            <li key={`${item.name}-${index}`} className="rounded-lg bg-[#F4F7FB] p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-[#0B1F36]">
                  {item.name}
                  <span className="font-normal text-[#5B6B7C]"> · {item.role}</span>
                </p>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() =>
                    onChange(quotes.filter((_, quoteIndex) => quoteIndex !== index))
                  }
                  className="rounded-full p-1 text-[#7A90A8] hover:bg-white hover:text-[#0B1F36]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea
                value={item.quote}
                rows={2}
                onChange={(event) => {
                  const next = quotes.map((entry, quoteIndex) =>
                    quoteIndex === index
                      ? { ...entry, quote: event.target.value }
                      : entry,
                  );
                  onChange(next);
                }}
                className={`${fieldClass} mt-2 py-2 text-sm`}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#5B6B7C]">No quotes are on the homepage.</p>
      )}
      <div className="grid gap-2 border-t border-[#EEF2F6] pt-3 sm:grid-cols-[1fr_1.4fr_auto]">
        <select
          value={personId}
          aria-label="Add a person"
          onChange={(event) => setPersonId(event.target.value)}
          className={`${fieldClass} py-2 text-sm`}
        >
          <option value="">Add from team</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <input
          value={quote}
          placeholder="Quote"
          onChange={(event) => setQuote(event.target.value)}
          className={`${fieldClass} py-2 text-sm`}
        />
        <button
          type="button"
          onClick={add}
          disabled={!personId || !quote.trim()}
          className="rounded-lg bg-[#0B1F36] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </Card>
  );
}

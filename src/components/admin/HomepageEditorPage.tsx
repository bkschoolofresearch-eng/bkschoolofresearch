'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { HomepageConfig } from '@/types/content';
import {
  AdminLockedState,
  AdminPageHeader,
  AdminPrimaryButton,
} from './AdminUI';
import { useCms } from './CmsProvider';

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
    if (database) setForm(withPickLists(structuredClone(database.homepage)));
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

  const clearIds = (key: PickKey) => {
    setForm({ ...form, [key]: [] });
  };

  const teamPeople = publishedPeople.filter(
    (person) => person.id !== form.directorPersonId,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Homepage"
        title="What the homepage shows"
        description="Choose which items already in the library appear on the homepage. Titles, bios, and images stay in their own sections. Leave a list unchecked to keep the automatic set."
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

      <div className="grid max-w-3xl gap-6">
        <section className="space-y-4 rounded-xl border border-[#D9DEE5] bg-[#F8F7F3] p-4 sm:p-5">
          <div>
            <p className="text-sm font-medium text-[#0D2745]">
              Message from the Executive Director
            </p>
            <p className="text-xs text-[#68727D]">
              The portrait and name come from Team. This page only chooses who
              appears, and the short message visitors read.
            </p>
          </div>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-[#0D2745]">Person</span>
            <select
              value={form.directorPersonId}
              onChange={(e) =>
                setForm({ ...form, directorPersonId: e.target.value })
              }
              className="w-full rounded-lg border border-[#D9DEE5] bg-white px-3 py-2"
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
            help="The paragraph on the homepage. The full profile stays on the person page."
            value={form.directorMessageExcerpt}
            onChange={(v) => setForm({ ...form, directorMessageExcerpt: v })}
            rows={6}
          />
          <Link
            href="/admin/people"
            className="text-xs font-medium text-[#173B6C] underline"
          >
            Manage team
          </Link>
        </section>

        <Picker
          title="Focus areas"
          help="Checked areas appear in this order. If none are checked, every on-site focus area appears in its display order."
          items={publishedAreas.map((area) => ({
            id: area.id,
            label: area.title,
          }))}
          selected={form.featuredResearchAreaIds ?? []}
          onToggle={(id) => toggleId('featuredResearchAreaIds', id)}
          onClear={() => clearIds('featuredResearchAreaIds')}
          manageHref="/admin/research-areas"
        />

        <Picker
          title="Our Research"
          help="The first two checked items are the main cards. The next three sit beside them. If none are checked, the homepage fills from the research library."
          items={publishedResearch.map((item) => ({
            id: item.id,
            label: item.title,
          }))}
          selected={form.featuredResearchProjectIds}
          onToggle={(id) => toggleId('featuredResearchProjectIds', id)}
          onClear={() => clearIds('featuredResearchProjectIds')}
          manageHref="/admin/research"
        />

        <section className="rounded-xl border border-[#D9DEE5] bg-[#F8F7F3] p-4 sm:p-5">
          <p className="text-sm font-medium text-[#0D2745]">Our Programs</p>
          <p className="mt-1 text-xs text-[#68727D]">
            The homepage shows the programmes that are on site. Photos come
            from each programme. Edit them in Programmes.
          </p>
          <Link
            href="/admin/activities"
            className="mt-3 inline-block text-xs font-medium text-[#173B6C] underline"
          >
            Manage programmes
          </Link>
        </section>

        <Picker
          title="Notices"
          help="The first three checked notices appear. If none are checked, the homepage uses the latest published notices."
          items={publishedNotices.map((item) => ({
            id: item.id,
            label: item.title,
          }))}
          selected={form.featuredNoticeIds ?? []}
          onToggle={(id) => toggleId('featuredNoticeIds', id)}
          onClear={() => clearIds('featuredNoticeIds')}
          manageHref="/admin/notices"
        />

        <Picker
          title="Events"
          help="The first three checked events appear. If none are checked, the homepage uses published events."
          items={publishedEvents.map((item) => ({
            id: item.id,
            label: item.title,
          }))}
          selected={form.featuredEventIds}
          onToggle={(id) => toggleId('featuredEventIds', id)}
          onClear={() => clearIds('featuredEventIds')}
          manageHref="/admin/events"
        />

        <Picker
          title="BKSR in Media"
          help="The first six checked clippings appear. If none are checked, published coverage appears."
          items={publishedMedia.map((item) => ({
            id: item.id,
            label: item.venue ? `${item.title} — ${item.venue}` : item.title,
          }))}
          selected={form.featuredMediaClippingIds ?? []}
          onToggle={(id) => toggleId('featuredMediaClippingIds', id)}
          onClear={() => clearIds('featuredMediaClippingIds')}
          manageHref="/admin/bksr-in-media"
        />

        <Picker
          title="Meet our team"
          help="The first four checked people appear under the director. If none are checked, the homepage uses the first published profiles."
          items={teamPeople.map((person) => ({
            id: person.id,
            label: `${person.name} — ${person.role}`,
          }))}
          selected={form.featuredPersonIds ?? []}
          onToggle={(id) => toggleId('featuredPersonIds', id)}
          onClear={() => clearIds('featuredPersonIds')}
          manageHref="/admin/people"
        />

        <Picker
          title="Opinions"
          help="The first three checked opinion pieces appear. If none are checked, the homepage uses the latest published opinions."
          items={publishedOpinions.map((item) => ({
            id: item.id,
            label: item.title,
          }))}
          selected={form.featuredPublicationIds.filter((id) =>
            publishedOpinions.some((item) => item.id === id),
          )}
          onToggle={(id) => toggleId('featuredPublicationIds', id)}
          onClear={() =>
            setForm({
              ...form,
              featuredPublicationIds: form.featuredPublicationIds.filter(
                (id) => !publishedOpinions.some((item) => item.id === id),
              ),
            })
          }
          manageHref="/admin/publications"
        />
      </div>
    </div>
  );
}

const SEARCH_MATCH_LIMIT = 8;

function Picker({
  title,
  help,
  items,
  selected,
  onToggle,
  onClear,
  manageHref,
}: {
  title: string;
  help: string;
  items: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  manageHref: string;
}) {
  const [query, setQuery] = useState('');
  const order = new Map(selected.map((id, index) => [id, index + 1]));
  const byId = new Map(items.map((item) => [item.id, item]));
  const needle = query.trim().toLowerCase();
  const selectedItems = selected.map(
    (id) => byId.get(id) ?? { id, label: 'Saved item' },
  );
  const matches = needle
    ? items
        .filter(
          (item) =>
            !order.has(item.id) && item.label.toLowerCase().includes(needle),
        )
        .slice(0, SEARCH_MATCH_LIMIT)
    : [];
  const hiddenMatches = needle
    ? items.filter(
        (item) =>
          !order.has(item.id) && item.label.toLowerCase().includes(needle),
      ).length - matches.length
    : 0;

  return (
    <section className="space-y-2 rounded-xl border border-[#D9DEE5] bg-[#F8F7F3] p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-[#0D2745]">{title}</p>
          <p className="text-xs text-[#68727D]">{help}</p>
        </div>
        <div className="flex items-center gap-3">
          {selected.length ? (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-[#68727D] underline"
            >
              Use automatic set
            </button>
          ) : null}
          <Link
            href={manageHref}
            className="text-xs font-medium text-[#173B6C] underline"
          >
            Manage library
          </Link>
        </div>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title"
        aria-label={`Search ${title} by title`}
        className="w-full rounded-lg border border-[#D9DEE5] bg-white px-3 py-2 text-sm outline-none focus:border-[#173B6C]"
      />
      <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-[#E8ECE8] bg-white p-2">
        {items.length === 0 ? (
          <p className="px-2 py-3 text-sm text-[#68727D]">
            Nothing is on site yet.
          </p>
        ) : (
          <>
            {selectedItems.map((item) => (
              <PickRow
                key={item.id}
                label={item.label}
                place={order.get(item.id)}
                onToggle={() => onToggle(item.id)}
              />
            ))}
            {needle && matches.length > 0 && selectedItems.length > 0 ? (
              <p className="px-2 pt-2 text-[11px] font-medium uppercase tracking-wide text-[#68727D]">
                Matches
              </p>
            ) : null}
            {matches.map((item) => (
              <PickRow
                key={item.id}
                label={item.label}
                onToggle={() => onToggle(item.id)}
              />
            ))}
            {!needle && selectedItems.length === 0 ? (
              <p className="px-2 py-3 text-sm text-[#68727D]">
                Search by title, then tick the item to put it on the homepage.
              </p>
            ) : null}
            {needle && matches.length === 0 ? (
              <p className="px-2 py-3 text-sm text-[#68727D]">
                No title matches that search.
              </p>
            ) : null}
            {hiddenMatches > 0 ? (
              <p className="px-2 py-2 text-xs text-[#68727D]">
                Keep typing to narrow the matches.
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

function PickRow({
  label,
  place,
  onToggle,
}: {
  label: string;
  place?: number;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[#F6F4EE]">
      <input
        type="checkbox"
        className="mt-1"
        checked={place !== undefined}
        onChange={onToggle}
      />
      {place ? (
        <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#173B6C] px-1.5 text-[11px] font-semibold text-white">
          {place}
        </span>
      ) : null}
      <span className="text-[#0D2745]">{label}</span>
    </label>
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
      <span className="font-medium text-[#0D2745]">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-[#D9DEE5] bg-white px-3 py-2 outline-none focus:border-[#173B6C]"
      />
      {help ? <span className="text-xs text-[#68727D]">{help}</span> : null}
    </label>
  );
}

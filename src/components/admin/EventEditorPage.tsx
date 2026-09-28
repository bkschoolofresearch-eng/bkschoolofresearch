'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type {
  ContentStatus,
  Event,
  EventStatus,
  Person,
  RegistrationForm,
} from '@/types/content';
import { cmsApi } from '@/lib/cms/client-api';
import { replaceEntityPersonLinks } from '@/lib/cms/client-ops';
import { slugify } from '@/lib/utils';
import { CloudinaryImageField } from '@/components/media/CloudinaryImageField';
import { AdminLoading } from './AdminLoading';
import { BodyEditor } from './BodyEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { AdminLockedState } from './AdminUI';
import { collectionConfigs } from './collections';
import { useCms } from './CmsProvider';
import {
  PersonLinksEditor,
  type PersonLinkDraft,
} from './PersonLinksEditor';

const CALENDAR: EventStatus[] = ['upcoming', 'past', 'cancelled'];

const CALENDAR_LABELS: Record<EventStatus, string> = {
  upcoming: 'Upcoming',
  past: 'Past',
  cancelled: 'Cancelled',
};

const inputClass =
  'w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[15px] font-normal text-[#0B1F36] outline-none placeholder:font-normal placeholder:text-[#7A90A8] focus:border-[#0B1F36] focus:bg-white focus:ring-2 focus:ring-[#0B1F36]/10';

function FormSection({
  step,
  title,
  blurb,
  children,
}: {
  step: number;
  title: string;
  blurb: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#DADCE0] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
      <header className="border-b border-[#E2E8F0] bg-[#EEF2F6] px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B1F36] text-sm font-bold text-white">
            {step}
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 className="font-[family-name:var(--font-admin-display)] text-xl leading-tight text-[#0B1F36]">
              {title}
            </h2>
            <p className="mt-1 text-[11px] leading-snug text-[#7A90A8]">
              {blurb}
            </p>
          </div>
        </div>
      </header>
      <div className="divide-y divide-[#EEF2F6]">{children}</div>
    </section>
  );
}

function FieldBlock({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="mb-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <label className="text-[13px] font-bold tracking-wide text-[#0B1F36]">
          {label}
          {required ? <span className="text-[#D93025]"> *</span> : null}
        </label>
        {hint ? (
          <span className="text-[11px] font-normal text-[#9AA8B8]">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function toDatetimeLocal(iso: unknown): string {
  if (typeof iso !== 'string' || !iso.trim()) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function emptyToNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function EventEditorPage({
  mode,
  id,
}: {
  mode: 'new' | 'edit';
  id?: string;
}) {
  const config = collectionConfigs.events;
  const router = useRouter();
  const { ready, createItem, updateItem, deleteItem, apiAuthenticated } =
    useCms();

  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [speakerText, setSpeakerText] = useState('');
  const [personLinks, setPersonLinks] = useState<PersonLinkDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !apiAuthenticated) return;

    let cancelled = false;

    const boot = async () => {
      setLoadError(null);
      setPeopleLoading(true);

      let loadedPeople: Person[] = [];
      try {
        const [peopleRes, formsRes] = await Promise.all([
          cmsApi.listCollection('people', { pageSize: 500 }),
          cmsApi.listCollection('registrationForms', { pageSize: 200 }),
        ]);
        if (cancelled) return;
        loadedPeople = peopleRes.items as Person[];
        setPeople(loadedPeople);
        setForms(
          (formsRes.items as RegistrationForm[]).filter(
            (form) =>
              form.entityType === 'event' && form.status !== 'archived',
          ),
        );
      } catch {
        /* roster and forms can load after the draft title */
      } finally {
        if (!cancelled) setPeopleLoading(false);
      }

      if (mode === 'new') {
        if (!cancelled) {
          setValues(config.defaults());
          setSpeakerText('');
          setPersonLinks([]);
        }
        return;
      }

      if (!id) return;

      try {
        const [itemRes, linksRes] = await Promise.all([
          fetch(`/api/cms/events/${id}`, { credentials: 'include' }),
          cmsApi.listCollection('personContentLinks', { pageSize: 10_000 }),
        ]);
        const data = (await itemRes.json()) as {
          item?: Event;
          error?: string;
        };
        if (!itemRes.ok || !data.item) {
          throw new Error(data.error || 'Event not found');
        }
        if (cancelled) return;
        setValues({ ...data.item });
        setSpeakerText((data.item.speakers ?? []).join(', '));
        setPersonLinks(
          (
            linksRes.items as Array<{
              entityType: string;
              entityId: string;
              personId: string;
              role: string;
            }>
          )
            .filter(
              (link) => link.entityType === 'event' && link.entityId === id,
            )
            .map((link) => ({
              personId: link.personId,
              role: link.role,
            })),
        );
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : 'Could not load item',
          );
        }
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [ready, apiAuthenticated, mode, id, config]);

  const flash = (text: string, ms = 4000) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), ms);
  };

  const setField = (name: string, value: unknown) => {
    setValues((prev) => {
      if (!prev) return prev;
      let next = { ...prev, [name]: value };
      if (name === 'title' && typeof value === 'string') {
        const currentSlug = String(prev.slug ?? '');
        const expectedFromOld = slugify(String(prev.title ?? ''));
        if (!currentSlug || currentSlug === expectedFromOld) {
          next = { ...next, slug: slugify(value) };
        }
      }
      return next;
    });
  };

  const save = async (nextStatus: ContentStatus) => {
    if (!values) return;
    setSaving(true);

    const payload: Record<string, unknown> = {
      ...values,
      status: nextStatus,
    };

    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    if (!title) {
      setSaving(false);
      flash('Event name is required.');
      return;
    }
    payload.title = title;

    const slug = slugify(String(payload.slug ?? '')) || slugify(title);
    if (!slug) {
      setSaving(false);
      flash('Page URL name is required.');
      return;
    }
    payload.slug = slug;

    if (!CALENDAR.includes(payload.eventStatus as EventStatus)) {
      payload.eventStatus = 'upcoming';
    }

    const startAt = fromDatetimeLocal(
      toDatetimeLocal(payload.startAt) ||
        (typeof payload.startAt === 'string' ? payload.startAt : ''),
    );
    if (!startAt) {
      setSaving(false);
      flash('A start date and time is required.');
      return;
    }
    payload.startAt = startAt;
    payload.endAt = fromDatetimeLocal(toDatetimeLocal(payload.endAt));

    payload.location =
      typeof payload.location === 'string' ? payload.location.trim() : '';
    payload.isOnline = Boolean(payload.isOnline);
    payload.summary =
      typeof payload.summary === 'string' ? payload.summary.trim() : '';
    payload.description =
      typeof payload.description === 'string' ? payload.description : '';
    payload.speakers = speakerText
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    const registrationUrl = emptyToNull(payload.registrationUrl);
    if (
      registrationUrl &&
      !/^https?:\/\//i.test(registrationUrl)
    ) {
      setSaving(false);
      flash('External registration link must start with https://');
      return;
    }
    payload.registrationUrl = registrationUrl;

    const recordingUrl = emptyToNull(payload.recordingUrl);
    if (recordingUrl && !/^https?:\/\//i.test(recordingUrl)) {
      setSaving(false);
      flash('Recording link must start with https://');
      return;
    }
    payload.recordingUrl = recordingUrl;

    payload.registrationFormId = emptyToNull(payload.registrationFormId);
    payload.featuredImageUrl = emptyToNull(payload.featuredImageUrl);

    if (nextStatus === 'published' && !payload.publishedAt) {
      payload.publishedAt = new Date().toISOString();
    }

    const links = personLinks.filter((row) => row.personId);

    try {
      if (mode === 'new') {
        const created = await createItem('events', payload as never);
        if (created?.id) {
          await replaceEntityPersonLinks('event', created.id, links);
        }
        router.push(`/admin/events/${created.id}`);
        return;
      }
      if (id) {
        await updateItem('events', id, payload as never);
        await replaceEntityPersonLinks('event', id, links);
        setValues((current) => (current ? { ...current, ...payload } : current));
        flash('Saved.');
      }
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return <AdminLoading label="Loading editor" />;
  }
  if (!apiAuthenticated) {
    return <AdminLockedState noun="events" />;
  }
  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <p className="text-sm text-[#D93025]">{loadError}</p>
        <Link href="/admin/events" className="text-sm text-[#174EA6]">
          Back to Events
        </Link>
      </div>
    );
  }
  if (!values) {
    return <AdminLoading label="Loading editor" />;
  }

  const calendar = (CALENDAR.includes(values.eventStatus as EventStatus)
    ? values.eventStatus
    : 'upcoming') as EventStatus;
  const status = String(values.status ?? 'draft');
  const onSite = status === 'published';
  const slug = String(values.slug ?? '');
  const previewHref = slug ? `/events/${slug}` : '';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-sm text-[#5F6368] hover:text-[#202124]"
        >
          <ArrowLeft className="h-4 w-4" />
          Events
        </Link>
        {message ? (
          <span className="rounded-full bg-[#E8F0FE] px-2.5 py-1 text-xs font-medium text-[#174EA6]">
            {message}
          </span>
        ) : null}
      </div>

      <section className="mb-4 overflow-hidden rounded-xl border border-[#DADCE0] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
        <div className="h-2.5 bg-[#0B1F36]" />
        <div className="px-5 py-5 sm:px-6">
          <h1 className="font-[family-name:var(--font-admin-display)] text-2xl text-[#202124]">
            {mode === 'new' ? 'Add event' : 'Edit event'}
          </h1>
          <p className="mt-1 text-[13px] text-[#7A90A8]">
            Fill the sections, then save at the bottom.
          </p>
          {mode === 'edit' && values.title ? (
            <p className="mt-3 truncate text-sm font-medium text-[#202124]">
              {String(values.title)}
            </p>
          ) : null}
        </div>
      </section>

      <div className="space-y-4">
        <FormSection
          step={1}
          title="Basics"
          blurb="Name, calendar place, and the short line on cards"
        >
          <FieldBlock label="Event name" required>
            <input
              value={String(values.title ?? '')}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Seminar, workshop, or talk"
              className={inputClass}
              autoFocus={mode === 'new'}
            />
          </FieldBlock>
          <FieldBlock label="Page URL name" hint={`/events/${slug || '…'}`}>
            <input
              value={slug}
              onChange={(e) => setField('slug', e.target.value)}
              placeholder="auto-fills from the name"
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock
            label="On the calendar as"
            hint="Upcoming, past, or cancelled on /events"
          >
            <div className="flex flex-wrap gap-2">
              {CALENDAR.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setField('eventStatus', key)}
                  className={
                    calendar === key
                      ? 'rounded-full bg-[#0B1F36] px-3.5 py-1.5 text-sm font-semibold text-white'
                      : 'rounded-full border border-[#DADCE0] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#0B1F36] hover:bg-[#F8F9FA]'
                  }
                >
                  {CALENDAR_LABELS[key]}
                </button>
              ))}
            </div>
          </FieldBlock>
          <FieldBlock label="Short summary" hint="Shown on event cards">
            <textarea
              rows={3}
              value={String(values.summary ?? '')}
              onChange={(e) => setField('summary', e.target.value)}
              placeholder="One or two sentences"
              className={`${inputClass} resize-y`}
            />
          </FieldBlock>
        </FormSection>

        <FormSection
          step={2}
          title="When and where"
          blurb="Start time is required. End time is optional."
        >
          <FieldBlock label="Starts" required>
            <input
              type="datetime-local"
              value={toDatetimeLocal(values.startAt)}
              onChange={(e) =>
                setField('startAt', fromDatetimeLocal(e.target.value))
              }
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock label="Ends">
            <input
              type="datetime-local"
              value={toDatetimeLocal(values.endAt)}
              onChange={(e) =>
                setField('endAt', fromDatetimeLocal(e.target.value))
              }
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock label="Venue / place">
            <input
              value={String(values.location ?? '')}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="Room, campus, or city"
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock label="Format">
            <label className="inline-flex items-center gap-2 text-sm text-[#0B1F36]">
              <input
                type="checkbox"
                checked={Boolean(values.isOnline)}
                onChange={(e) => setField('isOnline', e.target.checked)}
                className="h-4 w-4 rounded border-[#CBD5E1] text-[#0B1F36] focus:ring-[#0B1F36]/30"
              />
              This is an online gathering
            </label>
          </FieldBlock>
        </FormSection>

        <FormSection
          step={3}
          title="Details"
          blurb="Agenda, speakers intro, and practical notes on the event page"
        >
          <div className="px-5 py-5 sm:px-6">
            <BodyEditor
              label="Full details"
              value={String(values.description ?? '')}
              onChange={(next) => setField('description', next)}
              rows={12}
            />
          </div>
        </FormSection>

        <FormSection
          step={4}
          title="Registration and recording"
          blurb="In-site form, an external signup link, or a replay after the gathering"
        >
          <FieldBlock label="Registration form" hint="From Forms">
            <select
              className={inputClass}
              value={String(values.registrationFormId ?? '')}
              onChange={(e) =>
                setField('registrationFormId', e.target.value || null)
              }
            >
              <option value="">None</option>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.title}
                  {form.linkMode === 'shared' || form.entityId === 'shared'
                    ? ' (shared)'
                    : ''}
                </option>
              ))}
            </select>
          </FieldBlock>
          <FieldBlock label="External registration link" hint="https://…">
            <input
              type="url"
              value={String(values.registrationUrl ?? '')}
              onChange={(e) => setField('registrationUrl', e.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock label="Recording / replay" hint="YouTube or archive">
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={String(values.recordingUrl ?? '')}
                onChange={(e) => setField('recordingUrl', e.target.value)}
                placeholder="https://…"
                className={inputClass}
              />
              {typeof values.recordingUrl === 'string' &&
              /^https?:\/\//i.test(values.recordingUrl.trim()) ? (
                <a
                  href={values.recordingUrl.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#174EA6] hover:underline"
                >
                  Test
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </FieldBlock>
        </FormSection>

        <FormSection
          step={5}
          title="People"
          blurb="Names on the card, plus roster profiles that link to People"
        >
          <FieldBlock label="Speaker names" hint="Comma-separated">
            <input
              value={speakerText}
              onChange={(e) => setSpeakerText(e.target.value)}
              placeholder="Name, Name"
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock label="Linked profiles" hint={peopleLoading ? 'Loading roster…' : undefined}>
            <PersonLinksEditor
              entityType="event"
              people={people}
              value={personLinks}
              onChange={setPersonLinks}
              plain
            />
          </FieldBlock>
        </FormSection>

        <FormSection
          step={6}
          title="Card image"
          blurb="Photo on the events calendar and homepage cards"
        >
          <FieldBlock label="Featured image">
            <CloudinaryImageField
              label=""
              previewAspect="wide"
              value={String(values.featuredImageUrl ?? '')}
              onChange={(url) => setField('featuredImageUrl', url || null)}
            />
          </FieldBlock>
        </FormSection>

        <FormSection
          step={7}
          title="Save"
          blurb="Choose Draft or On site, then save once"
        >
          <FieldBlock label="Visibility">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setField('status', 'draft')}
                className={
                  !onSite
                    ? 'rounded-full bg-[#0B1F36] px-4 py-2 text-sm font-semibold text-white'
                    : 'rounded-full border border-[#DADCE0] bg-white px-4 py-2 text-sm font-semibold text-[#0B1F36] hover:bg-[#F8F9FA]'
                }
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setField('status', 'published')}
                className={
                  onSite
                    ? 'rounded-full bg-[#0B1F36] px-4 py-2 text-sm font-semibold text-white'
                    : 'rounded-full border border-[#DADCE0] bg-white px-4 py-2 text-sm font-semibold text-[#0B1F36] hover:bg-[#F8F9FA]'
                }
              >
                On site
              </button>
            </div>
            <p className="mt-2 text-xs text-[#5B6B7C]">
              {onSite
                ? 'Listed on the public events calendar.'
                : 'Saved in CMS only — visitors will not see it yet.'}
            </p>
          </FieldBlock>
          <FieldBlock label="Done">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={saving}
                onClick={() => void save(onSite ? 'published' : 'draft')}
                className="inline-flex items-center justify-center rounded-xl bg-[#0B1F36] px-5 py-3 text-sm font-semibold text-white hover:bg-[#173B6C] disabled:opacity-50"
              >
                {saving
                  ? 'Saving…'
                  : mode === 'new'
                    ? 'Save event'
                    : 'Save changes'}
              </button>
              {previewHref && mode === 'edit' ? (
                <a
                  href={previewHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1 text-sm font-medium text-[#174EA6] hover:underline"
                >
                  Open page
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
              <Link
                href="/admin/events"
                className="text-center text-sm font-medium text-[#5B6B7C] hover:text-[#0B1F36] sm:text-left"
              >
                Back to list
              </Link>
              {mode === 'edit' ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm font-medium text-[#8A3B3B] hover:underline sm:ml-auto"
                >
                  Delete this item
                </button>
              ) : null}
            </div>
          </FieldBlock>
        </FormSection>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this event?"
        description="It will be removed from the events calendar. This cannot be undone from here."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (id) {
            await deleteItem('events', id);
            router.push('/admin/events');
          }
        }}
      />
    </div>
  );
}

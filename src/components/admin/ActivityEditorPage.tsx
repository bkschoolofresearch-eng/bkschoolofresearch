'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink, X } from 'lucide-react';
import type {
  Activity,
  ActivityType,
  ContentStatus,
  Event,
  Person,
} from '@/types/content';
import { cmsApi } from '@/lib/cms/client-api';
import { replaceEntityPersonLinks } from '@/lib/cms/client-ops';
import { ACTIVITY_ROUTE_META } from '@/lib/public/labels';
import { slugify } from '@/lib/utils';
import { CloudinaryImageField } from '@/components/media/CloudinaryImageField';
import { AdminLoading } from './AdminLoading';
import { BodyEditor } from './BodyEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { useSaveConfirm } from './SaveAlert';
import { AdminLockedState } from './AdminUI';
import { collectionConfigs } from './collections';
import { useCms } from './CmsProvider';
import {
  PersonLinksEditor,
  type PersonLinkDraft,
} from './PersonLinksEditor';

const TYPES = ACTIVITY_ROUTE_META.map((item) => item.type);
const TYPE_LABELS = Object.fromEntries(
  ACTIVITY_ROUTE_META.map((item) => [item.type, item.label]),
) as Record<ActivityType, string>;

const inputClass =
  'w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[15px] text-[#0B1F36] outline-none placeholder:text-[#7A90A8] focus:border-[#0B1F36] focus:bg-white focus:ring-2 focus:ring-[#0B1F36]/10';

function programmePath(type: string): string {
  const meta = ACTIVITY_ROUTE_META.find((item) => item.type === type);
  return meta ? `/activities/${meta.routeSlug}` : '/activities';
}

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
          <div>
            <h2 className="font-[family-name:var(--font-admin-display)] text-xl text-[#0B1F36]">
              {title}
            </h2>
            <p className="mt-1 text-[11px] text-[#7A90A8]">{blurb}</p>
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
      <div className="mb-2.5 flex flex-wrap items-baseline gap-x-2">
        <label className="text-[13px] font-bold text-[#0B1F36]">
          {label}
          {required ? <span className="text-[#D93025]"> *</span> : null}
        </label>
        {hint ? <span className="text-[11px] text-[#9AA8B8]">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

export function ActivityEditorPage({
  mode,
  id,
}: {
  mode: 'new' | 'edit';
  id?: string;
}) {
  const config = collectionConfigs.activities;
  const router = useRouter();
  const { ready, createItem, updateItem, deleteItem, apiAuthenticated } = useCms();
  const { askSave, saveDialog } = useSaveConfirm();
  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [personLinks, setPersonLinks] = useState<PersonLinkDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !apiAuthenticated) return;
    let cancelled = false;

    const boot = async () => {
      setLoadError(null);
      try {
        const [eventsRes, peopleRes] = await Promise.all([
          cmsApi.listCollection('events', { pageSize: 200, sort: 'start_desc' }),
          cmsApi.listCollection('people', { pageSize: 500 }),
        ]);
        if (!cancelled) {
          setEvents(eventsRes.items as Event[]);
          setPeople(peopleRes.items as Person[]);
        }
      } catch {
        /* related picks can load later */
      }

      if (mode === 'new') {
        if (!cancelled) {
          setValues({ ...config.defaults(), imageUrl: null });
          setPersonLinks([]);
        }
        return;
      }
      if (!id) return;

      try {
        const [itemRes, linksRes] = await Promise.all([
          fetch(`/api/cms/activities/${id}`, { credentials: 'include' }),
          cmsApi.listCollection('personContentLinks', { pageSize: 10_000 }),
        ]);
        const data = (await itemRes.json()) as { item?: Activity; error?: string };
        if (!itemRes.ok || !data.item) {
          throw new Error(data.error || 'Programme not found');
        }
        if (cancelled) return;
        setValues({ ...data.item });
        setPersonLinks(
          (
            linksRes.items as Array<{
              entityType: string;
              entityId: string;
              personId: string;
              role: string;
            }>
          )
            .filter((link) => link.entityType === 'activity' && link.entityId === id)
            .map((link) => ({ personId: link.personId, role: link.role })),
        );
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Could not load item');
        }
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [ready, apiAuthenticated, mode, id, config]);

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 4000);
  };

  const setField = (name: string, value: unknown) => {
    setValues((prev) => {
      if (!prev) return prev;
      let next = { ...prev, [name]: value };
      if (name === 'title' && typeof value === 'string') {
        const currentSlug = String(prev.slug ?? '');
        const expected = slugify(String(prev.title ?? ''));
        if (!currentSlug || currentSlug === expected) {
          next = { ...next, slug: slugify(value) };
        }
      }
      return next;
    });
  };

  const save = async (nextStatus: ContentStatus) => {
    if (!values) return;
    if (!(await askSave())) return;
    setSaving(true);
    const payload: Record<string, unknown> = { ...values, status: nextStatus };
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    if (!title) {
      setSaving(false);
      flash('Programme name is required.');
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
    if (!TYPES.includes(payload.type as ActivityType)) {
      payload.type = 'capacity-building';
    }
    payload.summary = typeof payload.summary === 'string' ? payload.summary.trim() : '';
    payload.description = typeof payload.description === 'string' ? payload.description : '';
    const order = Number(payload.order);
    payload.order = Number.isFinite(order) ? order : 99;
    payload.relatedEventIds = Array.isArray(payload.relatedEventIds)
      ? payload.relatedEventIds
      : [];
    payload.imageUrl =
      typeof payload.imageUrl === 'string' && payload.imageUrl.trim()
        ? payload.imageUrl.trim()
        : null;
    if (nextStatus === 'published' && !payload.publishedAt) {
      payload.publishedAt = new Date().toISOString();
    }
    const links = personLinks.filter((row) => row.personId);
    try {
      if (mode === 'new') {
        const created = await createItem('activities', payload as never);
        if (created?.id) {
          await replaceEntityPersonLinks('activity', created.id, links);
        }
        router.push(`/admin/activities/${created.id}`);
        return;
      }
      if (id) {
        await updateItem('activities', id, payload as never);
        await replaceEntityPersonLinks('activity', id, links);
        setValues((current) => (current ? { ...current, ...payload } : current));
        flash('Saved.');
      }
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return <AdminLoading label="Loading editor" />;
  if (!apiAuthenticated) return <AdminLockedState noun="programmes" />;
  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <p className="text-sm text-[#D93025]">{loadError}</p>
        <Link href="/admin/activities" className="text-sm text-[#174EA6]">
          Back to Programmes
        </Link>
      </div>
    );
  }
  if (!values) return <AdminLoading label="Loading editor" />;

  const programmeType = (
    TYPES.includes(values.type as ActivityType) ? values.type : 'capacity-building'
  ) as ActivityType;
  const onSite = String(values.status ?? 'draft') === 'published';
  const related = Array.isArray(values.relatedEventIds)
    ? (values.relatedEventIds as string[])
    : [];
  const publicHref = programmePath(programmeType);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/activities"
          className="inline-flex items-center gap-1.5 text-sm text-[#5F6368] hover:text-[#202124]"
        >
          <ArrowLeft className="h-4 w-4" />
          Programmes
        </Link>
        {message ? (
          <span className="rounded-full bg-[#E8F0FE] px-2.5 py-1 text-xs font-medium text-[#174EA6]">
            {message}
          </span>
        ) : null}
      </div>

      <section className="mb-4 overflow-hidden rounded-xl border border-[#DADCE0] bg-white">
        <div className="h-2.5 bg-[#0B1F36]" />
        <div className="px-5 py-5 sm:px-6">
          <h1 className="font-[family-name:var(--font-admin-display)] text-2xl text-[#202124]">
            {mode === 'new' ? 'Add programme' : 'Edit programme'}
          </h1>
          <p className="mt-1 text-[13px] text-[#7A90A8]">
            Fill the sections, then save at the bottom.
          </p>
        </div>
      </section>

      <div className="space-y-4">
        <FormSection
          step={1}
          title="Basics"
          blurb="Name, programme type, and the short line on cards"
        >
          <FieldBlock label="Programme name" required>
            <input
              value={String(values.title ?? '')}
              onChange={(e) => setField('title', e.target.value)}
              className={inputClass}
              autoFocus={mode === 'new'}
            />
          </FieldBlock>
          <FieldBlock label="Page URL name" hint="Stored on the record">
            <input
              value={String(values.slug ?? '')}
              onChange={(e) => setField('slug', e.target.value)}
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock label="Programme" hint={`Public page ${publicHref}`}>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setField('type', key)}
                  className={
                    programmeType === key
                      ? 'rounded-full bg-[#0B1F36] px-3.5 py-1.5 text-sm font-semibold text-white'
                      : 'rounded-full border border-[#DADCE0] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#0B1F36]'
                  }
                >
                  {TYPE_LABELS[key]}
                </button>
              ))}
            </div>
          </FieldBlock>
          <FieldBlock label="Short summary">
            <textarea
              rows={3}
              value={String(values.summary ?? '')}
              onChange={(e) => setField('summary', e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </FieldBlock>
          <FieldBlock label="Display order" hint="Lower numbers appear first">
            <input
              type="number"
              value={values.order == null ? '' : String(values.order)}
              onChange={(e) =>
                setField('order', e.target.value === '' ? null : Number(e.target.value))
              }
              className={`${inputClass} sm:max-w-[8rem]`}
            />
          </FieldBlock>
        </FormSection>

        <FormSection step={2} title="Details" blurb="The programme page text">
          <div className="px-5 py-5 sm:px-6">
            <BodyEditor
              label="Description"
              value={String(values.description ?? '')}
              onChange={(next) => setField('description', next)}
              rows={10}
            />
          </div>
        </FormSection>

        <FormSection
          step={3}
          title="Related events"
          blurb="Gatherings listed with this programme"
        >
          <FieldBlock label="Events">
            <div className="space-y-3">
              {related.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {related.map((eventId) => {
                    const event = events.find((item) => item.id === eventId);
                    return (
                      <button
                        key={eventId}
                        type="button"
                        onClick={() =>
                          setField(
                            'relatedEventIds',
                            related.filter((value) => value !== eventId),
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-3 py-1 text-sm font-medium text-[#174EA6]"
                      >
                        {event?.title || eventId}
                        <X className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>
              ) : null}
              <select
                className={inputClass}
                value=""
                onChange={(e) => {
                  const nextId = e.target.value;
                  if (!nextId || related.includes(nextId)) return;
                  setField('relatedEventIds', [...related, nextId]);
                }}
              >
                <option value="">Add an event…</option>
                {events
                  .filter((event) => !related.includes(event.id))
                  .map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title || 'Untitled event'}
                    </option>
                  ))}
              </select>
            </div>
          </FieldBlock>
        </FormSection>

        <FormSection step={4} title="People" blurb="Roster profiles linked to this programme">
          <FieldBlock label="Linked profiles">
            <PersonLinksEditor
              entityType="activity"
              people={people}
              value={personLinks}
              onChange={setPersonLinks}
              plain
            />
          </FieldBlock>
        </FormSection>

        <FormSection
          step={5}
          title="Card image"
          blurb="Photo on the activities page and homepage programme cards"
        >
          <FieldBlock label="Image">
            <CloudinaryImageField
              label=""
              previewAspect="wide"
              value={String(values.imageUrl ?? '')}
              onChange={(url) => setField('imageUrl', url || null)}
            />
          </FieldBlock>
        </FormSection>

        <FormSection step={6} title="Save" blurb="Choose Draft or On site, then save once">
          <FieldBlock label="Visibility">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setField('status', 'draft')}
                className={
                  !onSite
                    ? 'rounded-full bg-[#0B1F36] px-4 py-2 text-sm font-semibold text-white'
                    : 'rounded-full border border-[#DADCE0] bg-white px-4 py-2 text-sm font-semibold text-[#0B1F36]'
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
                    : 'rounded-full border border-[#DADCE0] bg-white px-4 py-2 text-sm font-semibold text-[#0B1F36]'
                }
              >
                On site
              </button>
            </div>
          </FieldBlock>
          <FieldBlock label="Done">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={saving}
                onClick={() => void save(onSite ? 'published' : 'draft')}
                className="inline-flex items-center justify-center rounded-xl bg-[#0B1F36] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? 'Saving…' : mode === 'new' ? 'Save programme' : 'Save changes'}
              </button>
              {mode === 'edit' ? (
                <a
                  href={publicHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#174EA6]"
                >
                  Open page
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
              <Link href="/admin/activities" className="text-sm font-medium text-[#5B6B7C]">
                Back to list
              </Link>
              {mode === 'edit' ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm font-medium text-[#8A3B3B] sm:ml-auto"
                >
                  Delete this item
                </button>
              ) : null}
            </div>
          </FieldBlock>
        </FormSection>
      </div>

      {saveDialog}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this programme?"
        description="It will be removed from Activities. This cannot be undone from here."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (id) {
            await deleteItem('activities', id);
            router.push('/admin/activities');
          }
        }}
      />
    </div>
  );
}

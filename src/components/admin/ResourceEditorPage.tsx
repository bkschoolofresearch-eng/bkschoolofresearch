'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { ContentStatus, Resource, ResourceType } from '@/types/content';
import { slugify } from '@/lib/utils';
import { AdminLoading } from './AdminLoading';
import { BodyEditor } from './BodyEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { AdminLockedState } from './AdminUI';
import { collectionConfigs } from './collections';
import { useCms } from './CmsProvider';

const RESOURCE_TYPES: ResourceType[] = [
  'video-series',
  'tool-guide',
  'tutorial',
  'document',
  'archive',
  'other',
];

const TYPE_LABELS: Record<ResourceType, string> = {
  tutorial: 'Tutorial',
  'video-series': 'Video series',
  archive: 'Archive',
  'tool-guide': 'Tool guide',
  document: 'Document',
  other: 'Other',
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
            <p className="mt-1 text-[11px] leading-snug text-[#7A90A8]">{blurb}</p>
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

function tagsToString(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string') return value;
  return '';
}

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function emptyToNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function ResourceEditorPage({
  mode,
  id,
}: {
  mode: 'new' | 'edit';
  id?: string;
}) {
  const config = collectionConfigs.resources;
  const router = useRouter();
  const { ready, createItem, updateItem, deleteItem, apiAuthenticated } = useCms();

  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !apiAuthenticated) return;
    let cancelled = false;

    const boot = async () => {
      setLoadError(null);
      if (mode === 'new') {
        if (!cancelled) setValues(config.defaults());
        return;
      }
      if (!id) return;
      try {
        const itemRes = await fetch(`/api/cms/resources/${id}`, {
          credentials: 'include',
        });
        const data = (await itemRes.json()) as { item?: Resource; error?: string };
        if (!itemRes.ok || !data.item) {
          throw new Error(data.error || 'Resource not found');
        }
        if (!cancelled) setValues({ ...data.item });
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
    const payload: Record<string, unknown> = { ...values, status: nextStatus };
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    if (!title) {
      setSaving(false);
      flash('Resource title is required.');
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
    if (!RESOURCE_TYPES.includes(payload.resourceType as ResourceType)) {
      payload.resourceType = 'tutorial';
    }
    payload.summary = typeof payload.summary === 'string' ? payload.summary.trim() : '';
    payload.description =
      typeof payload.description === 'string' ? payload.description : '';
    payload.topics = Array.isArray(payload.topics)
      ? payload.topics.map((item) => String(item).trim()).filter(Boolean)
      : parseTags(String(payload.topics ?? ''));
    payload.software = Array.isArray(payload.software)
      ? payload.software.map((item) => String(item).trim()).filter(Boolean)
      : parseTags(String(payload.software ?? ''));
    const externalUrl = emptyToNull(payload.externalUrl);
    if (externalUrl && !/^https?:\/\//i.test(externalUrl)) {
      setSaving(false);
      flash('External link must start with https://');
      return;
    }
    payload.externalUrl = externalUrl;
    payload.notes = typeof payload.notes === 'string' ? payload.notes.trim() : '';
    if (nextStatus === 'published' && !payload.publishedAt) {
      payload.publishedAt = new Date().toISOString();
    }

    try {
      if (mode === 'new') {
        const created = await createItem('resources', payload as never);
        router.replace(`/admin/resources/${created.id}`);
        return;
      }
      if (id) {
        await updateItem('resources', id, payload as never);
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
  if (!apiAuthenticated) return <AdminLockedState noun="resources" />;
  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <p className="text-sm text-[#D93025]">{loadError}</p>
        <Link href="/admin/resources" className="text-sm text-[#174EA6]">
          Back to Resources
        </Link>
      </div>
    );
  }
  if (!values) return <AdminLoading label="Loading editor" />;

  const resourceType = (
    RESOURCE_TYPES.includes(values.resourceType as ResourceType)
      ? values.resourceType
      : 'tutorial'
  ) as ResourceType;
  const onSite = String(values.status ?? 'draft') === 'published';
  const publicHref = values.slug ? `/resources/${String(values.slug)}` : '/resources';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/resources"
          className="inline-flex items-center gap-1.5 text-sm text-[#5F6368] hover:text-[#202124]"
        >
          <ArrowLeft className="h-4 w-4" />
          Resources
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
            {mode === 'new' ? 'Add resource' : 'Edit resource'}
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
          blurb="Title, kind of guide, and the short line on the resources page"
        >
          <FieldBlock label="Title" required>
            <input
              value={String(values.title ?? '')}
              onChange={(e) => setField('title', e.target.value)}
              className={inputClass}
              autoFocus={mode === 'new'}
            />
          </FieldBlock>
          <FieldBlock label="Page URL name" hint={`/resources/${String(values.slug || '…')}`}>
            <input
              value={String(values.slug ?? '')}
              onChange={(e) => setField('slug', e.target.value)}
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock label="Kind">
            <div className="flex flex-wrap gap-2">
              {RESOURCE_TYPES.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setField('resourceType', key)}
                  className={
                    resourceType === key
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
        </FormSection>

        <FormSection step={2} title="Guide" blurb="The full write-up on the resource page">
          <FieldBlock label="Description">
            <BodyEditor
              label="Description"
              value={String(values.description ?? '')}
              onChange={(next) => setField('description', next)}
              rows={10}
            />
          </FieldBlock>
        </FormSection>

        <FormSection
          step={3}
          title="Topics and software"
          blurb="Shown as tags on the resource page. Separate names with commas."
        >
          <FieldBlock label="Software" hint="For example Stata, SPSS, MS Excel">
            <input
              value={tagsToString(values.software)}
              onChange={(e) => setField('software', parseTags(e.target.value))}
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock label="Topics" hint="For example regression, time-series">
            <input
              value={tagsToString(values.topics)}
              onChange={(e) => setField('topics', parseTags(e.target.value))}
              className={inputClass}
            />
          </FieldBlock>
        </FormSection>

        <FormSection
          step={4}
          title="External link"
          blurb="Optional. Opens from the resource page when a file or site lives elsewhere."
        >
          <FieldBlock label="Link" hint="https://">
            <input
              value={String(values.externalUrl ?? '')}
              onChange={(e) => setField('externalUrl', e.target.value)}
              placeholder="https://"
              className={inputClass}
            />
          </FieldBlock>
        </FormSection>

        <FormSection step={5} title="Notes" blurb="A short note under the guide, in italics">
          <FieldBlock label="Note">
            <textarea
              rows={3}
              value={String(values.notes ?? '')}
              onChange={(e) => setField('notes', e.target.value)}
              className={`${inputClass} resize-y`}
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
                {saving ? 'Saving…' : mode === 'new' ? 'Save resource' : 'Save changes'}
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
              <Link href="/admin/resources" className="text-sm font-medium text-[#5B6B7C]">
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

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this resource?"
        description="It will be removed from the Knowledge Hub. This cannot be undone from here."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (id) {
            await deleteItem('resources', id);
            router.push('/admin/resources');
          }
        }}
      />
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink, X } from 'lucide-react';
import type {
  ContentStatus,
  Person,
  Publication,
  PublicationType,
  ResearchProject,
} from '@/types/content';
import { cmsApi } from '@/lib/cms/client-api';
import { replaceEntityPersonLinks } from '@/lib/cms/client-ops';
import { slugify } from '@/lib/utils';
import { PUBLICATION_TYPE_LABELS } from '@/lib/public/labels';
import { publicationExternalUrl } from '@/lib/content/research-links';
import { CloudinaryImageField } from '@/components/media/CloudinaryImageField';
import { AdminLoading } from './AdminLoading';
import { ConfirmDialog } from './ConfirmDialog';
import {
  ResearchAuthorsField,
  authorsToLeadNames,
  authorsToPersonLinks,
  hydrateResearchAuthors,
  type ResearchAuthorEntry,
} from './ResearchAuthorsField';
import { AdminLockedState } from './AdminUI';
import { collectionConfigs } from './collections';
import { useCms } from './CmsProvider';

const PUBLICATION_TYPES = Object.keys(
  PUBLICATION_TYPE_LABELS,
) as PublicationType[];

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

function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const selected = options.filter((o) => value.includes(o.value));
  const available = options.filter((o) => !value.includes(o.value));

  return (
    <div className="space-y-3">
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(value.filter((id) => id !== opt.value))}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-3 py-1 text-sm font-medium text-[#174EA6]"
            >
              {opt.label}
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      ) : null}
      {available.length > 0 ? (
        <select
          className={inputClass}
          value=""
          onChange={(e) => {
            const nextId = e.target.value;
            if (!nextId) return;
            onChange([...value, nextId]);
          }}
        >
          <option value="">Choose…</option>
          {available.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : selected.length === 0 ? (
        <p className="text-sm text-[#9AA0A6]">No focus areas yet.</p>
      ) : null}
    </div>
  );
}

function emptyToNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function PublicationEditorPage({
  mode,
  id,
}: {
  mode: 'new' | 'edit';
  id?: string;
}) {
  const config = collectionConfigs.publications;
  const router = useRouter();
  const { ready, createItem, updateItem, deleteItem, apiAuthenticated } =
    useCms();

  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [areaOptions, setAreaOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [projectOptions, setProjectOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [authors, setAuthors] = useState<ResearchAuthorEntry[]>([]);
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
        const [areasRes, peopleRes, projectsRes] = await Promise.all([
          cmsApi.listCollection('researchAreas', { pageSize: 200 }),
          cmsApi.listCollection('people', { pageSize: 500 }),
          cmsApi.listCollection('researchProjects', { pageSize: 500 }),
        ]);
        if (cancelled) return;
        loadedPeople = peopleRes.items as Person[];
        setPeople(loadedPeople);
        setAreaOptions(
          areasRes.items
            .filter((a) => a.status !== 'archived')
            .sort(
              (a, b) =>
                ((a as { order?: number }).order ?? 999) -
                  ((b as { order?: number }).order ?? 999) ||
                a.title.localeCompare(b.title),
            )
            .map((a) => ({ value: a.id, label: a.title })),
        );
        setProjectOptions(
          (projectsRes.items as ResearchProject[])
            .filter((p) => p.status !== 'archived')
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((p) => ({ value: p.id, label: p.title || 'Untitled research' })),
        );
      } catch {
        /* areas/people/projects optional for drafting title first */
      } finally {
        if (!cancelled) setPeopleLoading(false);
      }

      if (mode === 'new') {
        if (!cancelled) {
          setValues(config.defaults());
          setAuthors([]);
        }
        return;
      }

      if (!id) return;

      try {
        const [itemRes, linksRes] = await Promise.all([
          fetch(`/api/cms/publications/${id}`, {
            credentials: 'include',
          }),
          cmsApi.listCollection('personContentLinks', { pageSize: 10_000 }),
        ]);
        const data = (await itemRes.json()) as {
          item?: Publication;
          error?: string;
        };
        if (!itemRes.ok || !data.item) {
          throw new Error(data.error || 'Publication not found');
        }
        if (cancelled) return;
        setValues({ ...data.item });
        const links = (
          linksRes.items as Array<{
            entityType: string;
            entityId: string;
            personId: string;
            role: string;
            order?: number;
          }>
        )
          .filter(
            (link) =>
              link.entityType === 'publication' && link.entityId === id,
          )
          .map((link) => ({
            personId: link.personId,
            role: link.role,
            order: link.order,
          }));
        setAuthors(
          hydrateResearchAuthors(
            data.item.authors ?? [],
            links,
            loadedPeople,
          ),
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

    const title =
      typeof payload.title === 'string' ? payload.title.trim() : '';
    if (!title) {
      setSaving(false);
      flash('Title is required.');
      return;
    }
    payload.title = title;

    if (!payload.type) payload.type = 'journal';
    payload.authors = authorsToLeadNames(authors);
    if (!Array.isArray(payload.areaIds)) payload.areaIds = [];

    const personLinks = authorsToPersonLinks(authors);

    const urlRaw =
      typeof payload.url === 'string' ? payload.url.trim() : '';
    if (!urlRaw) {
      payload.url = null;
    } else if (!/^https?:\/\//i.test(urlRaw)) {
      setSaving(false);
      flash('Link must start with https://');
      return;
    } else {
      payload.url = urlRaw;
    }

    payload.doi = emptyToNull(payload.doi);
    payload.coverImageUrl = emptyToNull(payload.coverImageUrl);
    for (const key of [
      'venue',
      'volume',
      'issue',
      'pages',
      'publisher',
      'abstract',
      'citation',
      'language',
    ] as const) {
      if (typeof payload[key] === 'string' && !String(payload[key]).trim()) {
        payload[key] = key === 'citation' || key === 'abstract' ? '' : null;
      }
    }

    if (typeof payload.projectId === 'string' && !payload.projectId.trim()) {
      payload.projectId = null;
    }

    const openHref = publicationExternalUrl({
      url: (payload.url as string | null) ?? null,
      doi: (payload.doi as string | null) ?? null,
      citation: String(payload.citation ?? ''),
    });

    if (nextStatus === 'published') {
      if (!openHref) {
        setSaving(false);
        flash('Add a URL or DOI that opens before showing on the site.');
        return;
      }
      if (!payload.publishedAt) {
        payload.publishedAt = new Date().toISOString();
      }
    }

    try {
      if (mode === 'new') {
        const created = await createItem('publications', payload as never);
        if (created?.id) {
          await replaceEntityPersonLinks(
            'publication',
            created.id,
            personLinks,
          );
        }
        router.push(`/admin/publications/${created.id}`);
        return;
      }
      if (id) {
        await updateItem('publications', id, payload as never);
        await replaceEntityPersonLinks('publication', id, personLinks);
        setValues((v) => (v ? { ...v, ...payload } : v));
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
    return <AdminLockedState noun="publications" />;
  }
  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <p className="text-sm text-[#D93025]">{loadError}</p>
        <Link href="/admin/publications" className="text-sm text-[#174EA6]">
          Back to Publications
        </Link>
      </div>
    );
  }
  if (!values) {
    return <AdminLoading label="Loading editor" />;
  }

  const pubType = String(values.type ?? 'journal') as PublicationType;
  const status = String(values.status ?? 'draft');
  const areaIds = Array.isArray(values.areaIds)
    ? (values.areaIds as string[])
    : [];
  const onSite = status === 'published';
  const previewHref = publicationExternalUrl({
    url: (typeof values.url === 'string' ? values.url : null) || null,
    doi: (typeof values.doi === 'string' ? values.doi : null) || null,
    citation: String(values.citation ?? ''),
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/publications"
          className="inline-flex items-center gap-1.5 text-sm text-[#5F6368] hover:text-[#202124]"
        >
          <ArrowLeft className="h-4 w-4" />
          Publications
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
            {mode === 'new' ? 'Add publication' : 'Edit publication'}
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
          blurb="Title, publication type, and year"
        >
          <FieldBlock label="Title" required>
            <input
              value={String(values.title ?? '')}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Publication title"
              className={inputClass}
              autoFocus={mode === 'new'}
            />
          </FieldBlock>
          <FieldBlock label="Type & year">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {PUBLICATION_TYPES.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setField('type', key)}
                    className={
                      pubType === key
                        ? 'rounded-full bg-[#0B1F36] px-3.5 py-1.5 text-sm font-semibold text-white'
                        : 'rounded-full border border-[#DADCE0] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#0B1F36] hover:bg-[#F8F9FA]'
                    }
                  >
                    {PUBLICATION_TYPE_LABELS[key]}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={
                  values.year == null || values.year === undefined
                    ? ''
                    : String(values.year)
                }
                onChange={(e) =>
                  setField(
                    'year',
                    e.target.value === '' ? null : Number(e.target.value),
                  )
                }
                placeholder="Year"
                className={`${inputClass} sm:max-w-[7.5rem]`}
                aria-label="Year"
              />
            </div>
          </FieldBlock>
        </FormSection>

        <FormSection
          step={2}
          title="Authors"
          blurb="Order on the card · roster pick links their profile"
        >
          <FieldBlock label="Author list" hint="↑↓ to reorder">
            <ResearchAuthorsField
              people={people}
              value={authors}
              onChange={setAuthors}
              peopleLoading={peopleLoading}
            />
          </FieldBlock>
        </FormSection>

        <FormSection
          step={3}
          title="Where to open"
          blurb="The link visitors open when they click the card"
        >
          <FieldBlock label="URL" hint="https://…">
            <input
              type="url"
              value={String(values.url ?? '')}
              onChange={(e) => setField('url', e.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock label="DOI" hint="Optional if URL is set">
            <div className="flex items-center gap-3">
              <input
                value={String(values.doi ?? '')}
                onChange={(e) => setField('doi', e.target.value)}
                placeholder="10.xxxx/…"
                className={inputClass}
              />
              {previewHref ? (
                <a
                  href={previewHref}
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
          step={4}
          title="Library details"
          blurb="Citation and bibliographic fields for the library record"
        >
          <FieldBlock label="Citation">
            <textarea
              rows={3}
              value={String(values.citation ?? '')}
              onChange={(e) => setField('citation', e.target.value)}
              placeholder="Full citation"
              className={`${inputClass} resize-y`}
            />
          </FieldBlock>
          <FieldBlock label="Abstract">
            <textarea
              rows={4}
              value={String(values.abstract ?? '')}
              onChange={(e) => setField('abstract', e.target.value)}
              placeholder="Abstract (optional)"
              className={`${inputClass} resize-y`}
            />
          </FieldBlock>
          <FieldBlock label="Venue / journal">
            <input
              value={String(values.venue ?? '')}
              onChange={(e) => setField('venue', e.target.value)}
              placeholder="Journal or venue name"
              className={inputClass}
            />
          </FieldBlock>
          <div className="grid gap-0 sm:grid-cols-3">
            <FieldBlock label="Volume">
              <input
                value={String(values.volume ?? '')}
                onChange={(e) => setField('volume', e.target.value)}
                className={inputClass}
              />
            </FieldBlock>
            <FieldBlock label="Issue">
              <input
                value={String(values.issue ?? '')}
                onChange={(e) => setField('issue', e.target.value)}
                className={inputClass}
              />
            </FieldBlock>
            <FieldBlock label="Pages">
              <input
                value={String(values.pages ?? '')}
                onChange={(e) => setField('pages', e.target.value)}
                className={inputClass}
              />
            </FieldBlock>
          </div>
          <FieldBlock label="Publisher">
            <input
              value={String(values.publisher ?? '')}
              onChange={(e) => setField('publisher', e.target.value)}
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock label="Language">
            <input
              value={String(values.language ?? '')}
              onChange={(e) => setField('language', e.target.value)}
              placeholder="e.g. English"
              className={inputClass}
            />
          </FieldBlock>
        </FormSection>

        <FormSection
          step={5}
          title="Card & relations"
          blurb="Cover image, focus areas, and optional related research"
        >
          <FieldBlock label="Cover image">
            <CloudinaryImageField
              label=""
              previewAspect="portrait"
              value={String(values.coverImageUrl ?? '')}
              onChange={(url) => setField('coverImageUrl', url || null)}
            />
          </FieldBlock>
          <FieldBlock label="Focus areas">
            <ChipSelect
              options={areaOptions}
              value={areaIds}
              onChange={(next) => setField('areaIds', next)}
            />
          </FieldBlock>
          <FieldBlock label="Related research" hint="Optional">
            <select
              className={inputClass}
              value={String(values.projectId ?? '')}
              onChange={(e) =>
                setField('projectId', e.target.value || null)
              }
            >
              <option value="">None</option>
              {projectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FieldBlock>
        </FormSection>

        <FormSection
          step={6}
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
                ? 'Listed on the public Publications pages.'
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
                    ? 'Save publication'
                    : 'Save changes'}
              </button>
              <Link
                href="/admin/publications"
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
        title="Delete this publication?"
        description="It will be removed from the Publications library. This cannot be undone from here."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (id) {
            await deleteItem('publications', id);
            router.push('/admin/publications');
          }
        }}
      />
    </div>
  );
}

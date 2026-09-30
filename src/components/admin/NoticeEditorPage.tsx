'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type {
  ContentStatus,
  Notice,
  NoticeType,
  RegistrationForm,
} from '@/types/content';
import { cmsApi } from '@/lib/cms/client-api';
import { slugify } from '@/lib/utils';
import { CloudinaryImageField } from '@/components/media/CloudinaryImageField';
import { AdminLoading } from './AdminLoading';
import { BodyEditor } from './BodyEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { useSaveConfirm } from './SaveAlert';
import { AdminLockedState } from './AdminUI';
import { collectionConfigs } from './collections';
import { useCms } from './CmsProvider';

const NOTICE_TYPES: NoticeType[] = [
  'vacancy',
  'announcement',
  'deadline',
  'general',
];

const TYPE_LABELS: Record<NoticeType, string> = {
  vacancy: 'Vacancy',
  announcement: 'Announcement',
  deadline: 'Deadline',
  general: 'General',
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

export function NoticeEditorPage({
  mode,
  id,
}: {
  mode: 'new' | 'edit';
  id?: string;
}) {
  const config = collectionConfigs.notices;
  const router = useRouter();
  const { ready, createItem, updateItem, deleteItem, apiAuthenticated } = useCms();
  const { askSave, saveDialog } = useSaveConfirm();

  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !apiAuthenticated) return;
    let cancelled = false;

    const boot = async () => {
      setLoadError(null);
      try {
        const formsRes = await cmsApi.listCollection('registrationForms', {
          pageSize: 200,
        });
        if (!cancelled) {
          setForms(
            (formsRes.items as RegistrationForm[]).filter(
              (form) =>
                form.entityType === 'vacancy' && form.status !== 'archived',
            ),
          );
        }
      } catch {
        /* forms can be attached later */
      }

      if (mode === 'new') {
        if (!cancelled) setValues(config.defaults());
        return;
      }
      if (!id) return;

      try {
        const itemRes = await fetch(`/api/cms/notices/${id}`, {
          credentials: 'include',
        });
        const data = (await itemRes.json()) as { item?: Notice; error?: string };
        if (!itemRes.ok || !data.item) {
          throw new Error(data.error || 'Notice not found');
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
    if (!(await askSave())) return;
    setSaving(true);
    const payload: Record<string, unknown> = { ...values, status: nextStatus };

    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    if (!title) {
      setSaving(false);
      flash('Notice title is required.');
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

    if (!NOTICE_TYPES.includes(payload.noticeType as NoticeType)) {
      payload.noticeType = 'announcement';
    }

    payload.summary = typeof payload.summary === 'string' ? payload.summary.trim() : '';
    payload.body = typeof payload.body === 'string' ? payload.body : '';
    payload.language = emptyToNull(payload.language) ?? '';
    payload.deadlineAt = fromDatetimeLocal(toDatetimeLocal(payload.deadlineAt));
    payload.applicationFormId = emptyToNull(payload.applicationFormId);
    const applicationUrl = emptyToNull(payload.applicationUrl);
    if (applicationUrl && !/^https?:\/\//i.test(applicationUrl)) {
      setSaving(false);
      flash('External application link must start with https://');
      return;
    }
    payload.applicationUrl = applicationUrl;
    payload.featuredImageUrl = emptyToNull(payload.featuredImageUrl);

    if (nextStatus === 'published' && !payload.publishedAt) {
      payload.publishedAt = new Date().toISOString();
    }

    try {
      if (mode === 'new') {
        const created = await createItem('notices', payload as never);
        router.push(`/admin/notices/${created.id}`);
        return;
      }
      if (id) {
        await updateItem('notices', id, payload as never);
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
  if (!apiAuthenticated) return <AdminLockedState noun="notices" />;
  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <p className="text-sm text-[#D93025]">{loadError}</p>
        <Link href="/admin/notices" className="text-sm text-[#174EA6]">
          Back to Notices
        </Link>
      </div>
    );
  }
  if (!values) return <AdminLoading label="Loading editor" />;

  const noticeType = (
    NOTICE_TYPES.includes(values.noticeType as NoticeType)
      ? values.noticeType
      : 'announcement'
  ) as NoticeType;
  const onSite = String(values.status ?? 'draft') === 'published';
  const slug = String(values.slug ?? '');
  const previewHref = slug ? `/notices/${slug}` : '';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/notices"
          className="inline-flex items-center gap-1.5 text-sm text-[#5F6368] hover:text-[#202124]"
        >
          <ArrowLeft className="h-4 w-4" />
          Notices
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
            {mode === 'new' ? 'Add notice' : 'Edit notice'}
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
          blurb="Title, notice type, and the short line on cards"
        >
          <FieldBlock label="Notice title" required>
            <input
              value={String(values.title ?? '')}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Announcement, vacancy, or deadline"
              className={inputClass}
              autoFocus={mode === 'new'}
            />
          </FieldBlock>
          <FieldBlock label="Page URL name" hint={`/notices/${slug || '…'}`}>
            <input
              value={slug}
              onChange={(e) => setField('slug', e.target.value)}
              placeholder="auto-fills from the title"
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock label="Type" hint="Vacancies, announcements, deadlines, or general">
            <div className="flex flex-wrap gap-2">
              {NOTICE_TYPES.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setField('noticeType', key)}
                  className={
                    noticeType === key
                      ? 'rounded-full bg-[#0B1F36] px-3.5 py-1.5 text-sm font-semibold text-white'
                      : 'rounded-full border border-[#DADCE0] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#0B1F36] hover:bg-[#F8F9FA]'
                  }
                >
                  {TYPE_LABELS[key]}
                </button>
              ))}
            </div>
          </FieldBlock>
          <FieldBlock label="Short summary" hint="Shown on notice cards">
            <textarea
              rows={3}
              value={String(values.summary ?? '')}
              onChange={(e) => setField('summary', e.target.value)}
              placeholder="One or two sentences"
              className={`${inputClass} resize-y`}
            />
          </FieldBlock>
          <FieldBlock label="Language" hint="Optional">
            <input
              value={String(values.language ?? '')}
              onChange={(e) => setField('language', e.target.value)}
              placeholder="English"
              className={inputClass}
            />
          </FieldBlock>
        </FormSection>

        <FormSection
          step={2}
          title="Full notice"
          blurb="The reading page under /notices"
        >
          <div className="px-5 py-5 sm:px-6">
            <BodyEditor
              label="Notice text"
              value={String(values.body ?? '')}
              onChange={(next) => setField('body', next)}
              rows={12}
            />
          </div>
        </FormSection>

        <FormSection
          step={3}
          title="Deadline and apply"
          blurb="A date on the card. Apply uses a Career form when one is attached, otherwise the external link."
        >
          <FieldBlock label="Deadline">
            <input
              type="datetime-local"
              value={toDatetimeLocal(values.deadlineAt)}
              onChange={(e) => setField('deadlineAt', fromDatetimeLocal(e.target.value))}
              className={inputClass}
            />
          </FieldBlock>
          <FieldBlock
            label="Application form"
            hint="Career forms. Used when this notice is a vacancy."
          >
            <select
              className={inputClass}
              value={String(values.applicationFormId ?? '')}
              onChange={(e) => setField('applicationFormId', e.target.value || null)}
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
          <FieldBlock
            label="External application link"
            hint="Google Form or other https link. Used when no Career form is attached."
          >
            <input
              type="url"
              value={String(values.applicationUrl ?? '')}
              onChange={(e) => setField('applicationUrl', e.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
          </FieldBlock>
        </FormSection>

        <FormSection
          step={4}
          title="Card image"
          blurb="Photo on the notices list and homepage cards"
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

        <FormSection step={5} title="Save" blurb="Choose Draft or On site, then save once">
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
                ? 'Listed on the public Notices page.'
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
                {saving ? 'Saving…' : mode === 'new' ? 'Save notice' : 'Save changes'}
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
                href="/admin/notices"
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

      {saveDialog}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this notice?"
        description="It will be removed from Notices. This cannot be undone from here."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (id) {
            await deleteItem('notices', id);
            router.push('/admin/notices');
          }
        }}
      />
    </div>
  );
}

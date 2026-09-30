'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useCms } from '@/components/admin/CmsProvider';
import { CloudinaryImageField } from '@/components/media/CloudinaryImageField';
import {
  DEFAULT_JOIN_FORM_FIELDS,
  DEFAULT_REGISTRATION_FIELDS,
  JOIN_FORM_ENTITY_ID,
  JOIN_FORM_SLUG,
  SHARED_FORM_ENTITY_ID,
  fieldKeyFromLabel,
  getFormById,
  getJoinForm,
  resolveLinkMode,
} from '@/lib/content/registration-forms';
import { saveRegistrationForm } from '@/lib/cms/client-ops';
import type {
  RegistrationFieldType,
  RegistrationFormField,
  RegistrationFormLinkMode,
} from '@/types/content';
import { slugify } from '@/lib/utils';
import { useSaveConfirm } from './SaveAlert';

const FIELD_TYPES: { value: RegistrationFieldType; label: string }[] = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'radio', label: 'Multiple choice' },
  { value: 'checkbox', label: 'Checkbox' },
];

const inputClass =
  'mt-1 w-full rounded-lg border border-[#D9DEE5] bg-white px-3 py-2 text-sm outline-none focus:border-[#173B6C]';

type FormPurpose = 'event' | 'join' | 'vacancy';

export function RegistrationFormEditorPage({
  mode,
  id,
  purpose: purposeProp = 'event',
}: {
  mode: 'new' | 'edit';
  id?: string;
  /** `join` edits the sitewide /join application form */
  purpose?: FormPurpose;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { database, ready, refresh } = useCms();
  const { askSave, saveDialog } = useSaveConfirm();

  const initialPurpose: FormPurpose =
    purposeProp === 'join'
      ? 'join'
      : searchParams.get('type') === 'vacancy'
        ? 'vacancy'
        : purposeProp;

  const [purpose, setPurpose] = useState<FormPurpose>(initialPurpose);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [linkMode, setLinkMode] =
    useState<RegistrationFormLinkMode>('dedicated');
  const [entityId, setEntityId] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [maxSubmissions, setMaxSubmissions] = useState<string>('');
  const [closedMessage, setClosedMessage] = useState(
    'Registration is currently closed.',
  );
  const [successMessage, setSuccessMessage] = useState(
    'Thank you. Your registration was received.',
  );
  const [fields, setFields] = useState<RegistrationFormField[]>(
    DEFAULT_REGISTRATION_FIELDS,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const events = database?.events ?? [];
  const vacancies = useMemo(
    () =>
      (database?.notices ?? []).filter(
        (n) => n.noticeType === 'vacancy',
      ),
    [database],
  );

  const existing = useMemo(() => {
    if (!database) return null;
    if (purposeProp === 'join') {
      const join = getJoinForm(database);
      return join.id.startsWith('form-join-bksr-fallback') ? null : join;
    }
    if (mode !== 'edit' || !id) return null;
    return getFormById(database, id) ?? null;
  }, [database, mode, id, purposeProp]);

  useEffect(() => {
    if (!ready) return;
    if (purposeProp === 'join') {
      setPurpose('join');
      if (existing) {
        setTitle(existing.title);
        setSlug(existing.slug);
        setDescription(existing.description ?? '');
        setBannerImageUrl(existing.bannerImageUrl ?? '');
        setEntityId(JOIN_FORM_ENTITY_ID);
        setLinkMode('dedicated');
        setIsOpen(existing.isOpen);
        setRequiresApproval(existing.requiresApproval);
        setMaxSubmissions(
          existing.maxSubmissions != null
            ? String(existing.maxSubmissions)
            : '',
        );
        setClosedMessage(
          existing.closedMessage ?? 'Applications are currently closed.',
        );
        setSuccessMessage(
          existing.successMessage ??
            'Thank you. BKSR administrators will review your application.',
        );
        setFields(existing.fields.map((f) => ({ ...f })));
      } else {
        setTitle('Join BKSR');
        setSlug(JOIN_FORM_SLUG);
        setDescription(
          'Apply to the research community or organisational team. No account needed until you are approved.',
        );
        setBannerImageUrl('/media/prototype/bksr-hero-slide-seminar.png');
        setEntityId(JOIN_FORM_ENTITY_ID);
        setLinkMode('dedicated');
        setIsOpen(true);
        setRequiresApproval(true);
        setFields(DEFAULT_JOIN_FORM_FIELDS.map((f) => ({ ...f })));
        setClosedMessage('Applications are currently closed.');
        setSuccessMessage(
          'Thank you. BKSR administrators will review your application.',
        );
      }
      return;
    }

    if (mode === 'new') {
      setPurpose(initialPurpose);
      setTitle('');
      setSlug('');
      setDescription('');
      setLinkMode('dedicated');
      setEntityId(
        initialPurpose === 'vacancy'
          ? (vacancies[0]?.id ?? '')
          : (events[0]?.id ?? ''),
      );
      setFields(DEFAULT_REGISTRATION_FIELDS.map((f) => ({ ...f })));
      setRequiresApproval(initialPurpose === 'vacancy');
      setClosedMessage(
        initialPurpose === 'vacancy'
          ? 'Applications are currently closed.'
          : 'Registration is currently closed.',
      );
      setSuccessMessage(
        initialPurpose === 'vacancy'
          ? 'Thank you. Your application was received.'
          : 'Thank you. Your registration was received.',
      );
      return;
    }

    if (existing) {
      const modeResolved = resolveLinkMode(existing);
      setPurpose(
        existing.entityType === 'vacancy'
          ? 'vacancy'
          : existing.entityType === 'join'
            ? 'join'
            : 'event',
      );
      setTitle(existing.title);
      setSlug(existing.slug);
      setDescription(existing.description ?? '');
      setBannerImageUrl(existing.bannerImageUrl ?? '');
      setLinkMode(modeResolved);
      setEntityId(
        modeResolved === 'shared' ? '' : existing.entityId,
      );
      setIsOpen(existing.isOpen);
      setRequiresApproval(existing.requiresApproval);
      setMaxSubmissions(
        existing.maxSubmissions != null
          ? String(existing.maxSubmissions)
          : '',
      );
      setClosedMessage(
        existing.closedMessage ??
          (existing.entityType === 'vacancy'
            ? 'Applications are currently closed.'
            : 'Registration is currently closed.'),
      );
      setSuccessMessage(
        existing.successMessage ??
          'Thank you. Your registration was received.',
      );
      setFields(existing.fields.map((f) => ({ ...f })));
    }
  }, [
    ready,
    mode,
    existing,
    events,
    vacancies,
    purposeProp,
    initialPurpose,
  ]);

  if (!ready || !database) {
    return <p className="text-sm text-[#68727D]">Loading editor…</p>;
  }

  if (purposeProp !== 'join' && mode === 'edit' && !existing) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[#8A3B3B]">Form not found.</p>
        <Link href="/admin/registration-forms" className="text-sm text-[#173B6C]">
          Back to forms
        </Link>
      </div>
    );
  }

  const backHref =
    purposeProp === 'join'
      ? '/admin/join-applications'
      : '/admin/registration-forms';

  const save = async () => {
    if (!(await askSave())) return;
    setSaving(true);
    setError(null);
    try {
      if (!title.trim()) throw new Error('Title is required.');
      if (purpose === 'join') {
        // ok
      } else if (linkMode === 'dedicated' && !entityId) {
        throw new Error(
          purpose === 'vacancy'
            ? 'Select a vacancy to link, or switch to a shared form.'
            : 'Select an event to link, or switch to a shared form.',
        );
      }
      if (!fields.length) throw new Error('Add at least one field.');

      const entityType =
        purpose === 'join'
          ? 'join'
          : purpose === 'vacancy'
            ? 'vacancy'
            : 'event';

      const saved = await saveRegistrationForm({
        id: existing?.id,
        createdAt: existing?.createdAt,
        title: title.trim(),
        slug:
          purpose === 'join'
            ? JOIN_FORM_SLUG
            : slug.trim() || slugify(title),
        description: description.trim() || undefined,
        bannerImageUrl: bannerImageUrl.trim() || null,
        entityType,
        entityId:
          purpose === 'join'
            ? JOIN_FORM_ENTITY_ID
            : linkMode === 'shared'
              ? SHARED_FORM_ENTITY_ID
              : entityId,
        linkMode: purpose === 'join' ? 'dedicated' : linkMode,
        fields: fields.map((field, index) => ({ ...field, order: index })),
        isOpen,
        requiresApproval: purpose === 'join' ? true : requiresApproval,
        maxSubmissions: maxSubmissions ? Number(maxSubmissions) : null,
        closedMessage: closedMessage.trim() || undefined,
        successMessage: successMessage.trim() || undefined,
        status: 'published',
      });
      await refresh();
      setMessage('Saved');
      if (purposeProp !== 'join' && mode === 'new') {
        router.replace(`/admin/registration-forms/${saved.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save form.');
    } finally {
      setSaving(false);
      window.setTimeout(() => setMessage(null), 2000);
    }
  };

  const addField = () => {
    const used = new Set(fields.map((f) => f.key));
    const label = `Question ${fields.length + 1}`;
    setFields([
      ...fields,
      {
        key: fieldKeyFromLabel(label, used),
        label,
        type: 'text',
        required: false,
        order: fields.length,
      },
    ]);
  };

  const heading =
    purposeProp === 'join'
      ? 'Join application form'
      : mode === 'new'
        ? 'Add form'
        : 'Edit form';

  const helpText =
    purposeProp === 'join'
      ? 'Google Forms–style editor for /join. Add, reorder, and remove fields.'
      : 'Create a dedicated form for one event/vacancy, or a shared form you attach to many from Events or Notices.';

  return (
    <div className="space-y-5">
      {saveDialog}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-[#68727D] hover:text-[#0D2745]"
        >
          <ArrowLeft className="h-4 w-4" />
          {purposeProp === 'join' ? 'Join applications' : 'Forms'}
        </Link>
        {message ? (
          <span className="rounded-md bg-[#E4F0EB] px-2 py-1 text-xs font-medium text-[#173B6C]">
            {message}
          </span>
        ) : null}
        {mode === 'edit' && id ? (
          <Link
            href={`/admin/registration-forms/${id}/entries`}
            className="text-sm font-medium text-[#173B6C] hover:underline"
          >
            View entries
          </Link>
        ) : null}
      </div>

      <div>
        <h1 className="font-[family-name:var(--font-admin-display)] text-2xl text-[#0D2745]">
          {heading}
        </h1>
        <p className="mt-1 text-sm text-[#68727D]">{helpText}</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-[#E8C4C4] bg-[#FBF0F0] px-3 py-2 text-sm text-[#8A3B3B]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-5 rounded-xl border border-[#D9DEE5] bg-[#F8F7F3] p-4 sm:p-5">
          {purposeProp !== 'join' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[#0D2745]">
                Form for
                <select
                  className={inputClass}
                  value={purpose}
                  disabled={mode === 'edit'}
                  onChange={(e) => {
                    const next = e.target.value as FormPurpose;
                    setPurpose(next);
                    setEntityId(
                      next === 'vacancy'
                        ? (vacancies[0]?.id ?? '')
                        : (events[0]?.id ?? ''),
                    );
                  }}
                >
                  <option value="event">Event registration</option>
                  <option value="vacancy">Career vacancy</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-[#0D2745]">
                Link mode
                <select
                  className={inputClass}
                  value={linkMode}
                  onChange={(e) =>
                    setLinkMode(e.target.value as RegistrationFormLinkMode)
                  }
                >
                  <option value="dedicated">
                    Dedicated (one {purpose === 'vacancy' ? 'vacancy' : 'event'})
                  </option>
                  <option value="shared">
                    Shared (attach to many from admin)
                  </option>
                </select>
              </label>
            </div>
          ) : null}

          <label className="block text-sm font-medium text-[#0D2745]">
            Title
            <input
              className={inputClass}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (mode === 'new' && (!slug || slug === slugify(title))) {
                  setSlug(slugify(e.target.value));
                }
              }}
            />
          </label>
          <label className="block text-sm font-medium text-[#0D2745]">
            Slug
            <input
              className={inputClass}
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              disabled={purposeProp === 'join'}
            />
          </label>
          <label className="block text-sm font-medium text-[#0D2745]">
            Description
            <textarea
              className={inputClass}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <CloudinaryImageField
            id="form-banner"
            label="Form banner / poster"
            value={bannerImageUrl}
            onChange={setBannerImageUrl}
            help="Shown at the top of the public form (Google Forms–style). Upload a wide image, or paste a URL."
          />

          {purposeProp !== 'join' && linkMode === 'dedicated' ? (
            <label className="block text-sm font-medium text-[#0D2745]">
              {purpose === 'vacancy' ? 'Linked vacancy' : 'Linked event'}
              <select
                className={inputClass}
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
              >
                <option value="">
                  {purpose === 'vacancy'
                    ? 'Select vacancy…'
                    : 'Select event…'}
                </option>
                {purpose === 'vacancy'
                  ? vacancies.map((notice) => (
                      <option key={notice.id} value={notice.id}>
                        {notice.title}
                      </option>
                    ))
                  : events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} ({event.eventStatus})
                      </option>
                    ))}
              </select>
              <span className="mt-1 block text-xs font-normal text-[#68727D]">
                Or create a shared form and attach it on the{' '}
                {purpose === 'vacancy' ? 'notice' : 'event'} editor.
              </span>
            </label>
          ) : null}

          {purposeProp !== 'join' && linkMode === 'shared' ? (
            <p className="rounded-lg border border-[#D9DEE5] bg-white px-3 py-2 text-sm text-[#68727D]">
              This shared form can be attached to multiple{' '}
              {purpose === 'vacancy' ? 'vacancies (Notices → Career)' : 'events'}{' '}
              using the “Application form” / “Registration form” field in their
              admin editors.
            </p>
          ) : null}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-[#0D2745]">Fields</p>
              <button
                type="button"
                onClick={addField}
                className="inline-flex items-center gap-1 rounded-md border border-[#D9DEE5] px-2 py-1 text-xs font-medium text-[#173B6C] hover:bg-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Add field
              </button>
            </div>
            <ul className="space-y-3">
              {fields.map((field, index) => (
                <li
                  key={`${field.key}-${index}`}
                  className="rounded-lg border border-[#D9DEE5] bg-white p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-xs font-medium text-[#0D2745]">
                      Label
                      <input
                        className={inputClass}
                        value={field.label}
                        onChange={(e) => {
                          const next = [...fields];
                          const used = new Set(
                            fields
                              .filter((_, i) => i !== index)
                              .map((f) => f.key),
                          );
                          next[index] = {
                            ...field,
                            label: e.target.value,
                            key: fieldKeyFromLabel(e.target.value, used),
                          };
                          setFields(next);
                        }}
                      />
                    </label>
                    <label className="block text-xs font-medium text-[#0D2745]">
                      Type
                      <select
                        className={inputClass}
                        value={field.type}
                        onChange={(e) => {
                          const next = [...fields];
                          next[index] = {
                            ...field,
                            type: e.target.value as RegistrationFieldType,
                          };
                          setFields(next);
                        }}
                      >
                        {FIELD_TYPES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {field.type === 'dropdown' || field.type === 'radio' ? (
                    <label className="mt-2 block text-xs font-medium text-[#0D2745]">
                      Options (comma-separated)
                      <input
                        className={inputClass}
                        value={(field.options ?? []).join(', ')}
                        onChange={(e) => {
                          const next = [...fields];
                          next[index] = {
                            ...field,
                            options: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          };
                          setFields(next);
                        }}
                      />
                    </label>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-xs text-[#0D2745]">
                      <input
                        type="checkbox"
                        checked={Boolean(field.required)}
                        onChange={(e) => {
                          const next = [...fields];
                          next[index] = {
                            ...field,
                            required: e.target.checked,
                          };
                          setFields(next);
                        }}
                      />
                      Required
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFields(fields.filter((_, i) => i !== index))
                      }
                      className="rounded-md p-1.5 text-[#68727D] hover:bg-[#FBF0F0] hover:text-[#8A3B3B]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-4 rounded-xl border border-[#D9DEE5] bg-[#F8F7F3] p-4">
          <label className="flex items-center gap-2 text-sm text-[#0D2745]">
            <input
              type="checkbox"
              checked={isOpen}
              onChange={(e) => setIsOpen(e.target.checked)}
            />
            Form open for submissions
          </label>
          <label className="flex items-center gap-2 text-sm text-[#0D2745]">
            <input
              type="checkbox"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
            />
            Requires approval review
          </label>
          <label className="block text-sm font-medium text-[#0D2745]">
            Max submissions
            <input
              type="number"
              min={0}
              className={inputClass}
              value={maxSubmissions}
              onChange={(e) => setMaxSubmissions(e.target.value)}
              placeholder="Unlimited"
            />
          </label>
          <label className="block text-sm font-medium text-[#0D2745]">
            Closed message
            <textarea
              className={inputClass}
              rows={2}
              value={closedMessage}
              onChange={(e) => setClosedMessage(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-[#0D2745]">
            Success message
            <textarea
              className={inputClass}
              rows={2}
              value={successMessage}
              onChange={(e) => setSuccessMessage(e.target.value)}
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="w-full rounded-lg bg-[#173B6C] px-3 py-2 text-sm font-medium text-white hover:bg-[#0D2745] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save form'}
          </button>
          {slug ? (
            <Link
              href={`/forms/${slug}`}
              target="_blank"
              className="block text-center text-xs font-medium text-[#173B6C] hover:underline"
            >
              Preview /forms/{slug}
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

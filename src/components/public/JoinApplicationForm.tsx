'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import type { RegistrationForm, RegistrationFormField } from '@/types/content';
import { cn } from '@/lib/utils';

const inputClass =
  'mt-2 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-sm text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10';

const selectClass = `${inputClass} appearance-none bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat pr-10`;

const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230b233f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`;

function FieldCard({
  field,
  value,
  onChange,
}: {
  field: RegistrationFormField;
  value: string | boolean;
  onChange: (next: string | boolean) => void;
}) {
  const label = (
    <span className="font-sans text-[0.9375rem] font-medium text-ink">
      {field.label}
      {field.required ? (
        <span className="ml-1 text-brand-red" aria-hidden>
          *
        </span>
      ) : null}
    </span>
  );

  let control: React.ReactNode;

  if (field.type === 'checkbox') {
    control = (
      <label className="flex items-start gap-3 text-[0.9375rem] text-ink">
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-border accent-ink"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>
          {field.label}
          {field.required ? (
            <span className="ml-1 text-brand-red" aria-hidden>
              *
            </span>
          ) : null}
        </span>
      </label>
    );
  } else if (field.type === 'radio') {
    control = (
      <fieldset>
        <legend className="mb-3">{label}</legend>
        <div className="space-y-2.5">
          {(field.options ?? []).map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2.5 text-sm text-ink"
            >
              <input
                type="radio"
                name={field.key}
                required={field.required}
                checked={String(value) === opt}
                onChange={() => onChange(opt)}
                className="accent-ink"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>
    );
  } else if (field.type === 'textarea') {
    control = (
      <label className="block">
        {label}
        <textarea
          className={inputClass}
          rows={field.key === 'message' ? 5 : 3}
          required={field.required}
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  } else if (field.type === 'dropdown') {
    control = (
      <label className="block">
        {label}
        <select
          className={selectClass}
          style={{ backgroundImage: chevron }}
          required={field.required}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  } else {
    control = (
      <label className="block">
        {label}
        <input
          className={inputClass}
          required={field.required}
          type={
            field.type === 'email'
              ? 'email'
              : field.type === 'number'
                ? 'number'
                : field.type === 'phone'
                  ? 'tel'
                  : 'text'
          }
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-white px-5 py-5 shadow-sm sm:px-6 sm:py-6">
      {control}
    </div>
  );
}

function StatusCard({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-white px-6 py-10 text-center shadow-sm sm:px-8">
      {eyebrow ? (
        <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
          {eyebrow}
        </p>
      ) : null}
      <p
        className={cn(
          'font-display text-2xl text-ink sm:text-3xl',
          eyebrow && 'mt-3',
        )}
      >
        {title}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-body sm:text-base">
        {body}
      </p>
      {action ? <div className="mt-7 flex justify-center">{action}</div> : null}
    </div>
  );
}

/**
 * Google Forms–inspired join application: banner → title/description → question cards.
 */
export function JoinApplicationForm({
  form,
}: {
  form: RegistrationForm;
}) {
  const fields = useMemo(
    () => [...form.fields].sort((a, b) => a.order - b.order),
    [form.fields],
  );
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const bannerSrc =
    form.bannerImageUrl?.trim() ||
    '/media/prototype/bksr-hero-slide-seminar.png';

  return (
    <div className="bg-[linear-gradient(180deg,#f7f1e6_0%,#ffffff_48%)]">
      <Container narrow className="pb-16 pt-24 sm:pb-20 sm:pt-28">
        <div className="mx-auto max-w-2xl space-y-3 sm:space-y-3.5">
          {/* Header card: banner + title + description */}
          <article className="overflow-hidden rounded-xl border border-border/80 bg-white shadow-sm">
            <div className="relative aspect-3/1 w-full bg-ink sm:aspect-16/5">
              <Image
                src={bannerSrc}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 42rem"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink/35 via-transparent to-transparent" />
            </div>
            <div className="border-t-[6px] border-ink px-5 py-5 sm:px-7 sm:py-6">
              <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                Application
              </p>
              <h1 className="mt-2 font-display text-[1.75rem] leading-tight tracking-tight text-ink sm:text-[2.125rem]">
                {form.title}
              </h1>
              {form.description ? (
                <p className="mt-3 text-sm leading-relaxed text-body sm:text-[0.9375rem] sm:leading-7">
                  {form.description}
                </p>
              ) : null}
              <p className="mt-4 text-xs text-muted">
                * Indicates required question
              </p>
            </div>
          </article>

          {!form.isOpen ? (
            <StatusCard
              title="Applications closed"
              body={
                form.closedMessage ||
                'This form is not accepting submissions.'
              }
              action={
                <Button href="/contact" variant="secondary">
                  Contact BKSR
                </Button>
              }
            />
          ) : done ? (
            <StatusCard
              eyebrow="Received"
              title="Application received"
              body={
                form.successMessage ||
                'Thank you. BKSR administrators will review your application.'
              }
              action={
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setDone(false)}
                >
                  Submit another application
                </Button>
              }
            />
          ) : (
            <form
              id="join-application-form"
              className="space-y-3 sm:space-y-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                setSubmitting(true);
                void (async () => {
                  try {
                    const res = await fetch('/api/public/join', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ data: values }),
                    });
                    const data = (await res.json()) as { error?: string };
                    if (!res.ok) {
                      setError(data.error || 'Could not submit application.');
                      return;
                    }
                    setDone(true);
                  } catch {
                    setError('Could not submit application.');
                  } finally {
                    setSubmitting(false);
                  }
                })();
              }}
            >
              {fields.map((field) => (
                <FieldCard
                  key={field.key}
                  field={field}
                  value={
                    values[field.key] ??
                    (field.type === 'checkbox' ? false : '')
                  }
                  onChange={(next) =>
                    setValues((prev) => ({ ...prev, [field.key]: next }))
                  }
                />
              ))}

              {error ? (
                <p className="rounded-xl border border-brand-red/25 bg-white px-5 py-3 text-sm text-brand-red shadow-sm">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-xs leading-relaxed text-muted sm:max-w-xs">
                  No account required. After approval you receive an email
                  invite.
                </p>
                <Button
                  type="submit"
                  variant="ink"
                  size="lg"
                  disabled={submitting}
                  withArrow
                  className="w-full sm:w-auto"
                >
                  {submitting ? 'Submitting…' : 'Submit'}
                </Button>
              </div>
            </form>
          )}

          <p className="pt-4 text-center text-xs text-muted sm:text-sm">
            Already invited?{' '}
            <Link
              href="/register"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              Create your account
            </Link>
            {' · '}
            <Link
              href="/people/career"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              Career vacancies
            </Link>
            {' · '}
            <Link
              href="/contact"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              Contact
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}

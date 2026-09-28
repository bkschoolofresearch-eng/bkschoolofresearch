import { v4 as uuidv4 } from 'uuid';
import { contentRepository } from '@/lib/cms/repository';
import { slugify } from '@/lib/utils';
import type {
  ContentDatabase,
  Event,
  Notice,
  RegistrationEntry,
  RegistrationEntryStatus,
  RegistrationForm,
  RegistrationFormEntityType,
  RegistrationFormField,
  RegistrationFormLinkMode,
} from '@/types/content';

export const JOIN_FORM_SLUG = 'join-bksr';
export const JOIN_FORM_ENTITY_ID = 'site';
/** entityId for reusable shared forms (events or vacancies) */
export const SHARED_FORM_ENTITY_ID = 'shared';

export function resolveLinkMode(
  form: Pick<RegistrationForm, 'linkMode' | 'entityId' | 'entityType'>,
): RegistrationFormLinkMode {
  if (form.entityType === 'join') return 'dedicated';
  if (form.linkMode === 'shared' || form.entityId === SHARED_FORM_ENTITY_ID) {
    return 'shared';
  }
  return 'dedicated';
}

export function isSharedForm(
  form: Pick<RegistrationForm, 'linkMode' | 'entityId' | 'entityType'>,
): boolean {
  return resolveLinkMode(form) === 'shared';
}

export const DEFAULT_REGISTRATION_FIELDS: RegistrationFormField[] = [
  {
    key: 'name',
    label: 'Full name',
    type: 'text',
    required: true,
    order: 0,
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    order: 1,
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'phone',
    required: false,
    order: 2,
  },
];

/** Default /join fields — admin can add/remove/reorder via the join form editor. */
export const DEFAULT_JOIN_FORM_FIELDS: RegistrationFormField[] = [
  {
    key: 'interestTrack',
    label: 'How would you like to join?',
    type: 'dropdown',
    required: true,
    order: 0,
    options: [
      'Research team',
      'Distinguished fellow',
      'Administrative / secretariat',
      'Other collaboration',
    ],
  },
  {
    key: 'name',
    label: 'Full name',
    type: 'text',
    required: true,
    order: 1,
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    order: 2,
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'phone',
    required: false,
    order: 3,
  },
  {
    key: 'currentRole',
    label: 'Current role / title',
    type: 'text',
    required: true,
    order: 4,
    placeholder: 'e.g. Graduate researcher',
  },
  {
    key: 'affiliation',
    label: 'Affiliation / organisation',
    type: 'text',
    required: true,
    order: 5,
    placeholder: 'University, institute, or organisation',
  },
  {
    key: 'city',
    label: 'City / country',
    type: 'text',
    required: false,
    order: 6,
  },
  {
    key: 'researchInterests',
    label: 'Research interests / focus areas',
    type: 'textarea',
    required: true,
    order: 7,
    placeholder: 'Topics you work on or want to contribute to at BKSR',
  },
  {
    key: 'portfolioUrl',
    label: 'Portfolio, CV, or LinkedIn URL',
    type: 'text',
    required: false,
    order: 8,
    placeholder: 'https://',
  },
  {
    key: 'message',
    label: 'Why do you want to join BK School of Research?',
    type: 'textarea',
    required: true,
    order: 9,
    placeholder: 'Background, motivation, and how you hope to contribute.',
  },
];

export function getJoinForm(db: ContentDatabase): RegistrationForm {
  const existing = db.registrationForms.find(
    (form) =>
      form.entityType === 'join' &&
      form.status !== 'archived' &&
      (form.slug === JOIN_FORM_SLUG || form.entityId === JOIN_FORM_ENTITY_ID),
  );
  if (existing) return existing;

  const now = new Date().toISOString();
  return {
    id: 'form-join-bksr-fallback',
    slug: JOIN_FORM_SLUG,
    title: 'Join BKSR',
    description:
      'Apply to the research community or organisational team. No account needed until you are approved. Choose your path below, share your details, and we will email you if approved.',
    bannerImageUrl: '/media/prototype/bksr-hero-slide-seminar.png',
    entityType: 'join',
    entityId: JOIN_FORM_ENTITY_ID,
    fields: DEFAULT_JOIN_FORM_FIELDS.map((f) => ({ ...f })),
    isOpen: true,
    requiresApproval: true,
    maxSubmissions: null,
    successMessage:
      'Thank you. BKSR administrators will review your application. If approved, you will receive an email invite.',
    closedMessage: 'Applications are currently closed.',
    status: 'published',
    createdAt: now,
    updatedAt: now,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function getFormBySlug(
  db: ContentDatabase,
  slug: string,
): RegistrationForm | undefined {
  return db.registrationForms.find((form) => form.slug === slug);
}

export function getFormById(
  db: ContentDatabase,
  id: string,
): RegistrationForm | undefined {
  return db.registrationForms.find((form) => form.id === id);
}

/** Dedicated form only (legacy entityId match). Prefer resolveFormForEvent / Vacancy. */
export function getFormForEntity(
  db: ContentDatabase,
  entityType: RegistrationFormEntityType,
  entityId: string,
): RegistrationForm | undefined {
  return db.registrationForms.find(
    (form) =>
      form.entityType === entityType &&
      form.entityId === entityId &&
      !isSharedForm(form) &&
      form.status !== 'archived',
  );
}

export function resolveFormForEvent(
  db: ContentDatabase,
  event: Pick<Event, 'id' | 'registrationFormId'>,
): RegistrationForm | undefined {
  if (event.registrationFormId) {
    const byId = getFormById(db, event.registrationFormId);
    if (
      byId &&
      byId.entityType === 'event' &&
      byId.status !== 'archived'
    ) {
      return byId;
    }
  }
  return getFormForEntity(db, 'event', event.id);
}

/** In-site form when one is attached and published; otherwise the external apply link. */
export function noticeApplyHref(
  notice: Pick<Notice, 'applicationUrl'>,
  form: RegistrationForm | undefined,
  options?: { requireOpen?: boolean },
): string | null {
  if (
    form &&
    form.status === 'published' &&
    (!options?.requireOpen || form.isOpen)
  ) {
    return `/forms/${form.slug}`;
  }
  const url = notice.applicationUrl?.trim() ?? '';
  if (/^https?:\/\//i.test(url)) return url;
  return null;
}

export function resolveFormForVacancy(
  db: ContentDatabase,
  notice: Pick<Notice, 'id' | 'applicationFormId'>,
): RegistrationForm | undefined {
  if (notice.applicationFormId) {
    const byId = getFormById(db, notice.applicationFormId);
    if (
      byId &&
      byId.entityType === 'vacancy' &&
      byId.status !== 'archived'
    ) {
      return byId;
    }
  }
  return getFormForEntity(db, 'vacancy', notice.id);
}

export function listAttachableForms(
  db: ContentDatabase,
  entityType: 'event' | 'vacancy',
): RegistrationForm[] {
  return db.registrationForms
    .filter(
      (form) =>
        form.entityType === entityType && form.status !== 'archived',
    )
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getEntriesForForm(
  db: ContentDatabase,
  formId: string,
): RegistrationEntry[] {
  return db.registrationEntries
    .filter((entry) => entry.formId === formId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function countEntriesForForm(db: ContentDatabase, formId: string): number {
  return db.registrationEntries.filter((entry) => entry.formId === formId)
    .length;
}

export function isFormFull(db: ContentDatabase, form: RegistrationForm): boolean {
  if (form.maxSubmissions == null || form.maxSubmissions <= 0) return false;
  return countEntriesForForm(db, form.id) >= form.maxSubmissions;
}

export function getEntityTitle(
  db: ContentDatabase,
  form: RegistrationForm,
): string | null {
  if (form.entityType === 'join') return 'Join BKSR';
  if (isSharedForm(form)) {
    if (form.entityType === 'event') return 'Shared (multiple events)';
    if (form.entityType === 'vacancy') return 'Shared (multiple vacancies)';
    return 'Shared form';
  }
  if (form.entityType === 'event') {
    return db.events.find((e) => e.id === form.entityId)?.title ?? null;
  }
  if (form.entityType === 'vacancy') {
    return db.notices.find((n) => n.id === form.entityId)?.title ?? null;
  }
  return db.activities.find((a) => a.id === form.entityId)?.title ?? null;
}

export function getEntityPublicHref(
  db: ContentDatabase,
  form: RegistrationForm,
): string | null {
  if (form.entityType === 'join') return '/join';
  if (isSharedForm(form)) {
    if (form.entityType === 'vacancy') return '/people/career';
    if (form.entityType === 'event') return '/events';
    return `/forms/${form.slug}`;
  }
  if (form.entityType === 'event') {
    const event = db.events.find((e) => e.id === form.entityId);
    return event ? `/events/${event.slug}` : null;
  }
  if (form.entityType === 'vacancy') {
    const notice = db.notices.find((n) => n.id === form.entityId);
    return notice ? `/notices/${notice.slug}` : '/people/career';
  }
  return '/activities';
}

export function formPurposeLabel(form: RegistrationForm): string {
  if (form.entityType === 'join') return 'Join BKSR';
  if (form.entityType === 'vacancy') {
    return isSharedForm(form) ? 'Career · shared' : 'Career · vacancy';
  }
  if (form.entityType === 'event') {
    return isSharedForm(form) ? 'Event · shared' : 'Event · dedicated';
  }
  return form.entityType;
}

export type SubmitRegistrationResult =
  | { ok: true; entry: RegistrationEntry }
  | { ok: false; error: string };

export function validateAndSubmitRegistration(
  formSlug: string,
  data: Record<string, string | number | boolean>,
): SubmitRegistrationResult {
  const db = contentRepository.getDatabase();
  const form = getFormBySlug(db, formSlug);
  if (!form || form.status === 'draft' || form.status === 'archived') {
    return { ok: false, error: 'This registration form is not available.' };
  }
  if (!form.isOpen) {
    return {
      ok: false,
      error: form.closedMessage || 'Registration is closed.',
    };
  }
  if (isFormFull(db, form)) {
    return { ok: false, error: 'This form has reached capacity.' };
  }

  const cleaned: Record<string, string | number | boolean> = {};
  for (const field of [...form.fields].sort((a, b) => a.order - b.order)) {
    const raw = data[field.key];
    if (field.type === 'checkbox') {
      cleaned[field.key] = Boolean(raw);
      if (field.required && !cleaned[field.key]) {
        return { ok: false, error: `${field.label} is required.` };
      }
      continue;
    }
    const text =
      raw == null ? '' : typeof raw === 'string' ? raw.trim() : String(raw);
    if (field.required && !text) {
      return { ok: false, error: `${field.label} is required.` };
    }
    if (field.type === 'email' && text && !text.includes('@')) {
      return { ok: false, error: 'Enter a valid email address.' };
    }
    if (field.type === 'number' && text) {
      const n = Number(text);
      if (Number.isNaN(n)) {
        return { ok: false, error: `${field.label} must be a number.` };
      }
      cleaned[field.key] = n;
    } else if (text) {
      cleaned[field.key] = text;
    }
  }

  const emailField = form.fields.find((f) => f.type === 'email');
  const email =
    emailField && typeof cleaned[emailField.key] === 'string'
      ? normalizeEmail(String(cleaned[emailField.key]))
      : null;

  if (email) {
    const duplicate = db.registrationEntries.find(
      (entry) =>
        entry.formId === form.id &&
        entry.email &&
        normalizeEmail(entry.email) === email,
    );
    if (duplicate) {
      return {
        ok: false,
        error: 'This email has already been used to register for this form.',
      };
    }
  }

  const stamp = nowIso();
  const entry: RegistrationEntry = {
    id: uuidv4(),
    formId: form.id,
    formSlug: form.slug,
    data: cleaned,
    status: 'submitted',
    email,
    createdAt: stamp,
    updatedAt: stamp,
    reviewedAt: null,
    reviewedBy: null,
  };

  contentRepository.saveDatabase({
    ...db,
    registrationEntries: [...db.registrationEntries, entry],
  });

  return { ok: true, entry };
}

export function saveRegistrationForm(
  input: Omit<RegistrationForm, 'id' | 'createdAt' | 'updatedAt'> &
    Partial<Pick<RegistrationForm, 'id' | 'createdAt' | 'updatedAt'>>,
): RegistrationForm {
  const db = contentRepository.getDatabase();
  const stamp = nowIso();
  const slug = slugify(input.slug || input.title) || `form-${Date.now()}`;

  if (input.id) {
    const index = db.registrationForms.findIndex((f) => f.id === input.id);
    if (index === -1) {
      throw new Error('Form not found');
    }
    const linkMode = resolveLinkMode({
      linkMode: input.linkMode,
      entityId: input.entityId,
      entityType: input.entityType,
    });
    const entityId =
      linkMode === 'shared' ? SHARED_FORM_ENTITY_ID : input.entityId;

    if (linkMode === 'dedicated' && input.entityType !== 'join') {
      const conflict = db.registrationForms.find(
        (f) =>
          f.entityType === input.entityType &&
          f.entityId === entityId &&
          !isSharedForm(f) &&
          f.id !== input.id,
      );
      if (conflict) {
        throw new Error(
          input.entityType === 'vacancy'
            ? 'Another dedicated form is already linked to this vacancy. Edit that form instead.'
            : 'Another dedicated form is already linked to this event. Edit that form instead.',
        );
      }
    }

    const updated: RegistrationForm = {
      ...db.registrationForms[index],
      ...input,
      slug,
      entityId,
      linkMode,
      updatedAt: stamp,
    };
    const next = [...db.registrationForms];
    next[index] = updated;
    contentRepository.saveDatabase({ ...db, registrationForms: next });
    return updated;
  }

  const linkMode = resolveLinkMode({
    linkMode: input.linkMode,
    entityId: input.entityId,
    entityType: input.entityType,
  });
  const entityId =
    linkMode === 'shared' ? SHARED_FORM_ENTITY_ID : input.entityId;

  if (linkMode === 'dedicated' && input.entityType !== 'join') {
    const conflict = db.registrationForms.find(
      (f) =>
        f.entityType === input.entityType &&
        f.entityId === entityId &&
        !isSharedForm(f) &&
        f.id !== input.id,
    );
    if (conflict) {
      throw new Error(
        input.entityType === 'vacancy'
          ? 'Another dedicated form is already linked to this vacancy. Edit that form, or use a shared form and attach it on the notice.'
          : 'Another dedicated form is already linked to this event. Edit that form, or use a shared form and attach it on the event.',
      );
    }
  }

  const created: RegistrationForm = {
    id: uuidv4(),
    slug,
    title: input.title,
    description: input.description,
    bannerImageUrl: input.bannerImageUrl ?? null,
    entityType: input.entityType,
    entityId,
    linkMode,
    fields: input.fields?.length
      ? input.fields
      : DEFAULT_REGISTRATION_FIELDS,
    isOpen: input.isOpen ?? true,
    requiresApproval: input.requiresApproval ?? false,
    maxSubmissions: input.maxSubmissions ?? null,
    closedMessage: input.closedMessage,
    successMessage: input.successMessage,
    status: input.status ?? 'published',
    createdAt: stamp,
    updatedAt: stamp,
  };

  contentRepository.saveDatabase({
    ...db,
    registrationForms: [...db.registrationForms, created],
  });
  return created;
}

export function deleteRegistrationForm(id: string): void {
  const db = contentRepository.getDatabase();
  contentRepository.saveDatabase({
    ...db,
    registrationForms: db.registrationForms.filter((f) => f.id !== id),
    registrationEntries: db.registrationEntries.filter((e) => e.formId !== id),
  });
}

export function updateEntryStatus(
  entryId: string,
  status: RegistrationEntryStatus,
  reviewedBy = 'admin-demo',
): RegistrationEntry | undefined {
  const db = contentRepository.getDatabase();
  const index = db.registrationEntries.findIndex((e) => e.id === entryId);
  if (index === -1) return undefined;
  const stamp = nowIso();
  const updated: RegistrationEntry = {
    ...db.registrationEntries[index],
    status,
    reviewedAt: stamp,
    reviewedBy,
    updatedAt: stamp,
  };
  const next = [...db.registrationEntries];
  next[index] = updated;
  contentRepository.saveDatabase({ ...db, registrationEntries: next });
  return updated;
}

export function deleteRegistrationEntry(entryId: string): void {
  const db = contentRepository.getDatabase();
  contentRepository.saveDatabase({
    ...db,
    registrationEntries: db.registrationEntries.filter((e) => e.id !== entryId),
  });
}

export function fieldKeyFromLabel(label: string, used: Set<string>): string {
  let base = slugify(label).replace(/-/g, '_') || 'field';
  base = base.replace(/[^a-z0-9_]/gi, '').toLowerCase() || 'field';
  let key = base;
  let i = 2;
  while (used.has(key)) {
    key = `${base}_${i}`;
    i += 1;
  }
  used.add(key);
  return key;
}

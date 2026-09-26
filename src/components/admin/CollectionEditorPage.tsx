'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { ContentStatus, Publication } from '@/types/content';
import { ConfirmDialog } from './ConfirmDialog';
import { EditorTabs, type EditorTabId } from './EditorTabs';
import { FieldRenderer } from './FormFields';
import { PublishPanel } from './PublishPanel';
import { AdminLockedState } from './AdminUI';
import { useCms } from './CmsProvider';
import {
  collectionConfigs,
  type AdminCollectionSlug,
} from './collections';
import { isReservedPeopleSlug } from '@/lib/content/people-slugs';
import { researchProjectExternalUrl } from '@/lib/content/research-links';
import { replaceEntityPersonLinks } from '@/lib/cms/client-ops';
import {
  PersonLinksEditor,
  type PersonLinkDraft,
} from './PersonLinksEditor';
import type { Person } from '@/types/content';

const RESEARCH_FEATURED_LIMIT = 4;

export function CollectionEditorPage({
  collectionSlug,
  mode,
  id,
}: {
  collectionSlug: AdminCollectionSlug;
  mode: 'new' | 'edit';
  id?: string;
}) {
  const config = collectionConfigs[collectionSlug];
  const router = useRouter();
  const { database, ready, createItem, updateItem, deleteItem, apiAuthenticated } =
    useCms();
  const [tab, setTab] = useState<EditorTabId>('content');
  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [personLinks, setPersonLinks] = useState<PersonLinkDraft[]>([]);

  const existing = useMemo(() => {
    if (!database || mode !== 'edit' || !id) return null;
    const list = database[config.key] as unknown as Record<string, unknown>[];
    return list.find((item) => item.id === id) ?? null;
  }, [database, config.key, mode, id]);

  useEffect(() => {
    if (!ready) return;
    if (mode === 'new') {
      setValues(config.defaults());
      setPersonLinks([]);
      return;
    }
    if (existing) {
      setValues({ ...existing });
    }
  }, [ready, mode, existing, config]);

  useEffect(() => {
    if (!database || !config.personLink || mode !== 'edit' || !id) {
      return;
    }
    setPersonLinks(
      database.personContentLinks
        .filter(
          (link) =>
            link.entityType === config.personLink?.entityType &&
            link.entityId === id,
        )
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
        .map((link) => ({ personId: link.personId, role: link.role })),
    );
  }, [database, config.personLink, mode, id]);

  const availableTabs = useMemo(() => {
    const tabs = new Set<EditorTabId>();
    for (const field of config.fields) {
      if (field.name === 'status') continue;
      tabs.add(field.tab ?? 'content');
    }
    if (config.personLink) tabs.add('relations');
    return Array.from(tabs);
  }, [config.fields, config.personLink]);

  if (!ready) {
    return <p className="text-sm text-[#5B6B7C]">Loading editor…</p>;
  }

  if (!apiAuthenticated) {
    return <AdminLockedState noun="this content" />;
  }

  if (!values) {
    return <p className="text-sm text-[#5B6B7C]">Loading editor…</p>;
  }

  if (mode === 'edit' && !existing) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[#8A3B3B]">This item was not found.</p>
        <Link href={`/admin/${config.slug}`} className="text-sm text-[#173B6C]">
          Back to {config.plural}
        </Link>
      </div>
    );
  }

  const autoSlugFrom = config.fields.some((f) => f.name === 'name')
    ? 'name'
    : 'title';

  const visibleFields = config.fields
    .filter(
      (field) =>
        (field.tab ?? 'content') === tab && field.name !== 'status',
    )
    .map((field) => {
      if (!database) return field;
      if (field.name === 'registrationFormId') {
        const forms = database.registrationForms.filter(
          (f) => f.entityType === 'event' && f.status !== 'archived',
        );
        return {
          ...field,
          options: [
            { value: '', label: 'None — use dedicated form or external link' },
            ...forms.map((f) => ({
              value: f.id,
              label: `${f.title}${f.linkMode === 'shared' || f.entityId === 'shared' ? ' (shared)' : ''}`,
            })),
          ],
        };
      }
      if (field.name === 'applicationFormId') {
        const forms = database.registrationForms.filter(
          (f) => f.entityType === 'vacancy' && f.status !== 'archived',
        );
        return {
          ...field,
          options: [
            {
              value: '',
              label: 'None — create under Forms → Career form',
            },
            ...forms.map((f) => ({
              value: f.id,
              label: `${f.title}${f.linkMode === 'shared' || f.entityId === 'shared' ? ' (shared)' : ''}`,
            })),
          ],
        };
      }
      if (field.name === 'areaIds') {
        const areas = [...database.researchAreas]
          .filter((area) => area.status !== 'archived')
          .sort(
            (a, b) =>
              (a.order ?? 999) - (b.order ?? 999) ||
              a.title.localeCompare(b.title),
          );
        return {
          ...field,
          options: areas.map((area) => ({
            value: area.id,
            label: area.title,
          })),
        };
      }
      if (field.name === 'publicationIds') {
        const pubs = [...database.publications]
          .filter((pub) => pub.status !== 'archived')
          .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
        return {
          ...field,
          options: pubs.map((pub) => ({
            value: pub.id,
            label: `${pub.year} · ${pub.title}`.slice(0, 120),
          })),
        };
      }
      return field;
    });

  const previewHref =
    config.previewPath?.(
      values as {
        slug?: string;
        status?: ContentStatus;
        researchStatus?: string;
      },
    ) ?? null;

  const save = async (statusOverride?: ContentStatus) => {
    setSaving(true);
    const payload = {
      ...values,
      ...(statusOverride ? { status: statusOverride } : {}),
    } as Record<string, unknown>;

    if (statusOverride === 'published' && !payload.publishedAt) {
      payload.publishedAt = new Date().toISOString();
    }

    if (typeof payload.url === 'string' && !payload.url.trim()) {
      payload.url = null;
    }
    if (typeof payload.featuredImageUrl === 'string' && !payload.featuredImageUrl.trim()) {
      payload.featuredImageUrl = null;
    }
    if (typeof payload.venue === 'string' && !payload.venue.trim()) {
      payload.venue = null;
    }

    if (collectionSlug === 'research') {
      const title =
        typeof payload.title === 'string' ? payload.title.trim() : '';
      if (!title) {
        setSaving(false);
        setMessage('Add a title before saving.');
        window.setTimeout(() => setMessage(null), 4000);
        return;
      }
      payload.title = title;
      if (!payload.researchStatus) {
        payload.researchStatus = 'ongoing';
      }
      if (!Array.isArray(payload.leadAuthorNames)) {
        payload.leadAuthorNames = [];
      }
      if (!Array.isArray(payload.areaIds)) {
        payload.areaIds = [];
      }
      if (!Array.isArray(payload.publicationIds)) {
        payload.publicationIds = [];
      }
      if (
        (statusOverride === 'published' || payload.status === 'published') &&
        typeof payload.url === 'string' &&
        payload.url &&
        !/^https?:\/\//i.test(payload.url.trim())
      ) {
        setSaving(false);
        setMessage(
          'External link must start with https:// (or leave it blank).',
        );
        window.setTimeout(() => setMessage(null), 4000);
        return;
      }

      const pubsById = new Map(
        (database?.publications ?? []).map((pub) => [pub.id, pub as Publication]),
      );
      const resolvedHref = researchProjectExternalUrl(
        {
          url: (payload.url as string | null) ?? null,
          publicationIds: payload.publicationIds as string[] | undefined,
          description: payload.description as string | undefined,
          summary: (payload.summary as string | undefined) ?? '',
        },
        pubsById,
      );
      const nextStatus = (statusOverride ?? payload.status) as ContentStatus;
      const becomingPublished =
        nextStatus === 'published' && existing?.status !== 'published';
      if (becomingPublished && !resolvedHref) {
        setSaving(false);
        setMessage(
          'Before publishing, add an openable link: journal/DOI URL, or a Publication that has a URL/DOI.',
        );
        window.setTimeout(() => setMessage(null), 5000);
        return;
      }

      if (payload.featuredOnResearchPage) {
        const others = (database?.researchProjects ?? []).filter(
          (p) =>
            p.featuredOnResearchPage &&
            p.id !== id &&
            p.status !== 'archived',
        );
        if (others.length >= RESEARCH_FEATURED_LIMIT) {
          setSaving(false);
          setMessage(
            `Only ${RESEARCH_FEATURED_LIMIT} featured cards show on /research. Unfeature another item first (currently ${others.length} others flagged).`,
          );
          window.setTimeout(() => setMessage(null), 5500);
          return;
        }
      }
    }

    if (
      collectionSlug === 'people' &&
      typeof payload.slug === 'string' &&
      isReservedPeopleSlug(payload.slug)
    ) {
      setSaving(false);
      setMessage(
        'That URL slug is reserved for a People category page. Choose another slug.',
      );
      window.setTimeout(() => setMessage(null), 4000);
      return;
    }

    if (collectionSlug === 'people') {
      const claimed = Boolean(existing?.accountId || values.accountId);
      const nextEmail =
        typeof payload.email === 'string' ? payload.email.trim() : '';
      if (claimed && !nextEmail) {
        setSaving(false);
        setMessage(
          'Cannot clear email on a claimed profile. Unlink the account first (Phase 2).',
        );
        window.setTimeout(() => setMessage(null), 4000);
        return;
      }
      if (nextEmail) {
        payload.email = nextEmail.toLowerCase();
        if (!payload.accountId && !existing?.accountId) {
          payload.claimStatus = 'unclaimed';
        }
      }
    }

    try {
      if (mode === 'new') {
        const created = await createItem(config.key, payload as never);
        if (config.personLink) {
          await replaceEntityPersonLinks(
            config.personLink.entityType,
            created.id,
            personLinks,
          );
        }
        setMessage('Created');
        router.replace(`/admin/${config.slug}/${created.id}`);
      } else if (id) {
        await updateItem(config.key, id, payload as never);
        if (config.personLink) {
          await replaceEntityPersonLinks(
            config.personLink.entityType,
            id,
            personLinks,
          );
        }
        setValues({ ...payload, id, updatedAt: new Date().toISOString() });
        setMessage('Saved');
      }
    } finally {
      setSaving(false);
      window.setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/admin/${config.slug}`}
          className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-sm text-[#5B6B7C] hover:bg-white hover:text-[#0B1F36]"
        >
          <ArrowLeft className="h-4 w-4" />
          All {config.plural.toLowerCase()}
        </Link>
        {message ? (
          <span className="rounded-xl bg-[#EEF2F6] px-2.5 py-1 text-xs font-semibold text-[#173B6C]">
            {message}
          </span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(11,31,54,0.04)] sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
          {mode === 'new' ? 'Creating' : 'Editing'} · {config.singular}
          {config.publicHint ? ` · ${config.publicHint}` : ''}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-admin-display)] text-2xl text-[#0B1F36]">
          {mode === 'new' ? config.addLabel : config.getTitle(values)}
        </h1>
        {config.helpText ? (
          <p className="mt-1 max-w-2xl text-sm text-[#5B6B7C]">{config.helpText}</p>
        ) : null}
        {collectionSlug === 'people' ? (
          <p className="mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs leading-relaxed text-[#5B6B7C]">
            {values.accountId ? (
              <>
                <span className="font-semibold text-[#173B6C]">Claimed profile.</span>{' '}
                Email is locked as the login key.
              </>
            ) : values.email ? (
              <>
                <span className="font-semibold text-[#8A6B2F]">Not claimed yet.</span>{' '}
                They can register at <code className="text-[#0D2745]">/register</code>{' '}
                with this email.
              </>
            ) : (
              <>
                Add an invite email so this person can claim their profile at{' '}
                <code className="text-[#0D2745]">/register</code>.
              </>
            )}
          </p>
        ) : null}
        {collectionSlug === 'research' ? (
          <div className="mt-3 space-y-2">
            <p className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs leading-relaxed text-[#5B6B7C]">
              <span className="font-semibold text-[#173B6C]">
                How this appears:
              </span>{' '}
              Category (Ongoing / Completed) controls the Research page filters.
              Venue, authors, year, and summary fill the card. Focus areas power
              the area filter. The external link is what visitors open on click —
              there is no separate detail page.
            </p>
            {typeof values.url === 'string' && values.url.trim() ? (
              <p className="rounded-xl border border-[#DCE8F5] bg-[#F3F7FB] px-3 py-2 text-xs text-[#173B6C]">
                Link attached:{' '}
                <a
                  href={values.url.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all font-medium underline-offset-2 hover:underline"
                >
                  {values.url.trim()}
                </a>
              </p>
            ) : (
              <p className="rounded-xl border border-[#F0E6D8] bg-[#FFFBF5] px-3 py-2 text-xs text-[#8A6B2F]">
                No external link yet — the card still lists on /research, but
                clicks will not open a journal page until you attach one.
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4 rounded-2xl border border-[#D9DEE5] bg-white p-4 shadow-sm sm:p-5">
          <EditorTabs
            active={tab}
            onChange={setTab}
            available={availableTabs}
          />
          <div className="grid gap-4 pt-1 sm:grid-cols-2">
            {visibleFields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === 'body' ||
                  field.type === 'textarea' ||
                  field.type === 'multiselect' ||
                  field.name === 'title' ||
                  field.name === 'name' ||
                  field.name === 'citation' ||
                  field.name === 'summary' ||
                  field.name === 'excerpt' ||
                  field.name === 'description' ||
                  field.name === 'venue' ||
                  field.name === 'url' ||
                  field.name === 'leadAuthorNames'
                    ? 'sm:col-span-2'
                    : undefined
                }
              >
                <FieldRenderer
                  field={field}
                  values={values}
                  onChange={setValues}
                  autoSlugFrom={autoSlugFrom}
                  disabled={
                    collectionSlug === 'people' &&
                    field.name === 'email' &&
                    Boolean(values.accountId)
                  }
                />
              </div>
            ))}
            {visibleFields.length === 0 &&
            !(
              config.personLink &&
              (availableTabs.includes('relations')
                ? tab === 'relations'
                : tab === 'content')
            ) ? (
              <p className="sm:col-span-2 text-sm text-[#68727D]">
                Nothing on this tab — try another tab above.
              </p>
            ) : null}
            {config.personLink &&
            (availableTabs.includes('relations')
              ? tab === 'relations'
              : tab === 'content') ? (
              <div className="sm:col-span-2">
                <PersonLinksEditor
                  entityType={config.personLink.entityType}
                  people={(database?.people ?? []) as Person[]}
                  value={personLinks}
                  onChange={setPersonLinks}
                />
              </div>
            ) : null}
          </div>
        </div>

        <PublishPanel
          status={String(values.status ?? 'draft')}
          singularLabel={config.singular}
          updatedAt={
            typeof values.updatedAt === 'string' ? values.updatedAt : undefined
          }
          createdAt={
            typeof values.createdAt === 'string' ? values.createdAt : undefined
          }
          previewHref={previewHref}
          saving={saving}
          onStatusChange={(status) => setValues((v) => ({ ...v!, status }))}
          onSave={(statusOverride) => save(statusOverride)}
          onDelete={mode === 'edit' ? () => setConfirmDelete(true) : undefined}
        />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete this ${config.singular.toLowerCase()}?`}
        description="It will be removed from the website. You can restore starter content from System & data if needed."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (id) {
            await deleteItem(config.key, id);
            router.push(`/admin/${config.slug}`);
          }
        }}
      />
    </div>
  );
}

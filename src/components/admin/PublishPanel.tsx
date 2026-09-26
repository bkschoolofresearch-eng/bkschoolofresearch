'use client';

import Link from 'next/link';
import { ExternalLink, Trash2 } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';
import { SITE_VISIBILITY_LABELS, StatusBadge } from './StatusBadge';
import type { ContentStatus } from '@/types/content';

export function PublishPanel({
  status,
  updatedAt,
  createdAt,
  previewHref,
  onStatusChange,
  onSave,
  onDelete,
  saving,
  singularLabel = 'item',
  variant = 'default',
}: {
  status: ContentStatus | string;
  updatedAt?: string;
  createdAt?: string;
  previewHref?: string | null;
  onStatusChange: (status: ContentStatus) => void;
  onSave: (statusOverride?: ContentStatus) => void;
  onDelete?: () => void;
  saving?: boolean;
  singularLabel?: string;
  /** `site` uses “On site” language (research and similar listings). */
  variant?: 'default' | 'site';
}) {
  const siteMode = variant === 'site';

  return (
    <aside className="space-y-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_2px_rgba(11,31,54,0.04)] lg:sticky lg:top-20">
      <div>
        <h3 className="text-sm font-semibold text-[#0B1F36]">
          {siteMode ? 'Save & show on site' : 'Save & publish'}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[#5B6B7C]">
          {siteMode
            ? 'Draft stays in the CMS only. On site lists this on /research. That is not the same as a journal publication.'
            : `Drafts stay private. Publish makes this ${singularLabel.toLowerCase()} visible on the website.`}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2">
        <span className="text-sm text-[#5B6B7C]">Now</span>
        <StatusBadge
          status={status}
          label={
            siteMode ? SITE_VISIBILITY_LABELS[status] ?? status : undefined
          }
        />
      </div>

      <div className="grid gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            onStatusChange('published');
            onSave('published');
          }}
          className="rounded-xl bg-[#0B1F36] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#173B6C] disabled:opacity-60"
        >
          {saving
            ? 'Working…'
            : siteMode
              ? 'Show on website'
              : 'Publish to website'}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            onStatusChange('draft');
            onSave('draft');
          }}
          className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm font-medium text-[#0B1F36] hover:bg-white disabled:opacity-60"
        >
          Save as draft
        </button>
        <button
          type="button"
          onClick={() => onSave()}
          disabled={saving}
          className="rounded-xl border border-[#0B1F36]/20 bg-[#E8EEF5] px-3 py-2.5 text-sm font-medium text-[#0B1F36] hover:bg-[#DCE6F0] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {previewHref ? (
        <Link
          href={previewHref}
          target="_blank"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm font-medium text-[#0B1F36] hover:bg-[#F8FAFC]"
        >
          <ExternalLink className="h-4 w-4" />
          {siteMode ? 'Open /research' : 'Open on website'}
        </Link>
      ) : (
        <p className="text-xs text-[#7A90A8]">Add a title to enable preview.</p>
      )}

      <div className="space-y-1 border-t border-[#E2E8F0] pt-3 text-xs text-[#5B6B7C]">
        {updatedAt ? <p>Last saved {formatDateShort(updatedAt)}</p> : null}
        {createdAt ? <p>Created {formatDateShort(createdAt)}</p> : null}
      </div>

      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#F5D0D0] px-3 py-2.5 text-sm text-[#8A3B3B] hover:bg-[#FFF8F8]"
        >
          <Trash2 className="h-4 w-4" />
          Delete {singularLabel.toLowerCase()}
        </button>
      ) : null}
    </aside>
  );
}

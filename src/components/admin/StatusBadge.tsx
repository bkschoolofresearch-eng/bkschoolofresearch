'use client';

import { cn } from '@/lib/utils';
import type { ContentStatus } from '@/types/content';

const styles: Record<ContentStatus | string, string> = {
  draft: 'bg-[#F3E8D8] text-[#7A5428] ring-[#E4D2B5]',
  published: 'bg-[#E4F0EB] text-[#173B6C] ring-[#C5DCD4]',
  archived: 'bg-[#E8EBEC] text-[#68727D] ring-[#D5DADB]',
  upcoming: 'bg-[#E7EEF5] text-[#2A4A6A] ring-[#C8D7E6]',
  past: 'bg-[#E8EBEC] text-[#68727D] ring-[#D5DADB]',
  cancelled: 'bg-[#F7E4E4] text-[#8A3B3B] ring-[#E8C4C4]',
  ongoing: 'bg-[#E4F0EB] text-[#173B6C] ring-[#C5DCD4]',
  completed: 'bg-[#E7EEF5] text-[#2A4A6A] ring-[#C8D7E6]',
};

/** Site listing visibility — avoids “Published” sounding like a journal article. */
export const SITE_VISIBILITY_LABELS: Record<string, string> = {
  published: 'On site',
  draft: 'Draft',
  archived: 'Hidden',
};

export function StatusBadge({
  status,
  className,
  label: labelOverride,
}: {
  status: string;
  className?: string;
  /** Override the default auto-capitalized status string. */
  label?: string;
}) {
  const label =
    labelOverride ?? SITE_VISIBILITY_LABELS[status] ?? status.replace(/-/g, ' ');
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        !labelOverride && !SITE_VISIBILITY_LABELS[status] ? 'capitalize' : '',
        styles[status] ?? styles.archived,
        className,
      )}
    >
      {label}
    </span>
  );
}

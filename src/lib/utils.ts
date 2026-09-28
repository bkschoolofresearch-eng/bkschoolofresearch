import { clsx, type ClassValue } from 'clsx';
import { format, isValid, parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function toDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  const parsed = parseISO(value);
  if (isValid(parsed)) return parsed;
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
}

/** Long form, e.g. "24 June 2023" */
export function formatDate(value: string | Date, pattern = 'd MMMM yyyy'): string {
  const date = toDate(value);
  if (!date) return '';
  return format(date, pattern);
}

/** Short form, e.g. "24 Jun 2023" */
export function formatDateShort(value: string | Date): string {
  return formatDate(value, 'd MMM yyyy');
}

/** Turn kebab/snake enums into readable labels for CMS lists */
export function humanizeLabel(value: string): string {
  const known: Record<string, string> = {
    journal: 'Journal',
    'book-chapter': 'Book chapter',
    conference: 'Conference',
    opinion: 'Opinion',
    report: 'Report',
    newsletter: 'Newsletter',
    'annual-report': 'Annual report',
    'policy-brief': 'Policy brief',
    'working-paper': 'Working paper',
    ongoing: 'Ongoing',
    completed: 'Completed',
    planned: 'Planned',
    archived: 'Archived',
    'capacity-building': 'Capacity Building',
    'awareness-campaign': 'Community & Social Impact',
    'research-talk': 'Policy & Academic Engagement',
    'innovation-showcasing': 'Innovation Showcasing',
    'executive-director': 'Executive Director',
    'distinguished-fellow': 'Distinguished Fellow',
    'research-team': 'Research Team',
    'administrative-team': 'Administrative Team',
    draft: 'Draft',
    published: 'Published',
    vacancy: 'Vacancy',
    announcement: 'Announcement',
    deadline: 'Deadline',
    general: 'General',
    tutorial: 'Tutorial',
    'video-series': 'Video series',
    archive: 'Archive',
    'tool-guide': 'Tool guide',
    document: 'Document',
    other: 'Other',
    upcoming: 'Upcoming',
    past: 'Past',
    cancelled: 'Cancelled',
  };
  if (known[value]) return known[value];
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}


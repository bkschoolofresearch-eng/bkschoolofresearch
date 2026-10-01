'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { humanizeLinkRole } from '@/lib/content/person-links';

export type PersonResearchCard = {
  linkId: string;
  role: string;
  title: string;
  href: string | null;
  summary?: string | null;
};

type PersonResearchListProps = {
  personId: string;
  initialItems: PersonResearchCard[];
  total: number;
};

function clipSummary(text: string, max = 160) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, '').trim()}…`;
}

function ResearchRow({ item }: { item: PersonResearchCard }) {
  const inner = (
    <>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-[0.95rem] bg-ink text-paper">
        <BookOpen className="size-4" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
          {humanizeLinkRole(item.role)}
        </p>
        <p className="mt-0.5 font-sans text-[0.95rem] font-semibold leading-snug break-words text-ink sm:text-base">
          {item.title}
        </p>
        {item.summary ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
            {clipSummary(item.summary)}
          </p>
        ) : null}
      </div>
      {item.href ? (
        <ArrowRight
          className="mt-1 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
          aria-hidden
        />
      ) : null}
    </>
  );

  return item.href ? (
    <Link
      href={item.href}
      className="group flex w-full min-w-0 items-start gap-3.5 rounded-[1.25rem] border border-border/90 bg-surface-subtle/70 p-3.5 transition-[border-color,background-color,box-shadow] hover:border-ink/20 hover:bg-white hover:shadow-[0_14px_30px_-24px_rgba(13,39,69,0.4)] sm:gap-4 sm:p-4"
    >
      {inner}
    </Link>
  ) : (
    <div className="flex w-full min-w-0 items-start gap-3.5 rounded-[1.25rem] border border-border/90 bg-surface-subtle/70 p-3.5 sm:gap-4 sm:p-4">
      {inner}
    </div>
  );
}

export function PersonResearchList({
  personId,
  initialItems,
  total,
}: PersonResearchListProps) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasMore = items.length < total;

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/public/people/${encodeURIComponent(personId)}/research?offset=${items.length}`,
      );
      if (!response.ok) {
        setError('Could not load more research. Try again.');
        return;
      }
      const body = (await response.json()) as {
        items?: PersonResearchCard[];
      };
      const next = Array.isArray(body.items) ? body.items : [];
      if (next.length === 0) {
        setError('Could not load more research. Try again.');
        return;
      }
      setItems((current) => {
        const seen = new Set(current.map((item) => item.linkId));
        return [...current, ...next.filter((item) => !seen.has(item.linkId))];
      });
    } catch {
      setError('Could not load more research. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-[1.75rem] border border-ink/12 bg-white shadow-[0_18px_40px_-34px_rgba(13,39,69,0.35)] sm:rounded-[2rem]">
      <div className="flex items-center justify-between gap-4 border-b border-border/80 px-5 py-4 sm:px-7 sm:py-5">
        <h2 className="font-display text-[1.45rem] leading-tight text-ink sm:text-[1.7rem]">
          Research
        </h2>
        <span className="font-sans text-xs text-muted">
          {total} {total === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="px-5 py-5 sm:px-7 sm:py-6">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.linkId}>
              <ResearchRow item={item} />
            </li>
          ))}
        </ul>
        {hasMore ? (
          <div className="mt-5 flex flex-col items-center gap-2">
            <Button
              type="button"
              variant="ink"
              size="md"
              disabled={loading}
              onClick={loadMore}
            >
              {loading ? 'Loading…' : 'View more'}
            </Button>
            <p className="font-sans text-xs text-muted">
              Showing {items.length} of {total}
            </p>
            {error ? (
              <p className="font-sans text-sm text-brand-red" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

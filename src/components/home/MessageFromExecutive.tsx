'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { PersonPortrait } from '@/components/home/PersonPortrait';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type MessageFromExecutiveProps = {
  name: string;
  role: string;
  message: string;
  photoSrc?: string | null;
  profileHref: string;
  className?: string;
};

/** Keep the card near the previous short-excerpt height. */
const PREVIEW_CHARS = 280;

function rawParagraphs(message: string) {
  return message
    .trim()
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^[“"]|[”"]$/g, ''));
}

function previewText(paragraphs: string[]) {
  if (!paragraphs.length) return '';
  const joined = paragraphs.join(' ');
  if (joined.length <= PREVIEW_CHARS) return joined;
  const cut = joined.slice(0, PREVIEW_CHARS);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 160 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function MessageFromExecutive({
  name,
  role,
  message,
  photoSrc,
  profileHref,
  className,
}: MessageFromExecutiveProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const paragraphs = rawParagraphs(message);
  const preview = previewText(paragraphs);
  const needsMore = paragraphs.join(' ').length > PREVIEW_CHARS;

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <article
        className={cn(
          'flex flex-col gap-2 rounded-[1.5rem] bg-ink p-1.5 sm:gap-2 sm:rounded-[2.5rem] sm:p-2.5 md:flex-row md:items-stretch md:gap-2.5 md:rounded-[3rem] md:p-3',
          className,
        )}
      >
        {/*
          Phone: full-width portrait, capped width so 4/5 isn’t viewport-tall.
          Desktop: photo stretches to the text column height — frame hugs content.
        */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[17.5rem] shrink-0 overflow-hidden rounded-[1.25rem] bg-surface sm:max-w-[19rem] sm:rounded-[2.125rem] md:mx-0 md:aspect-auto md:max-w-none md:w-[min(34%,16rem)] md:self-stretch md:rounded-[2.5rem] lg:w-[min(30%,18rem)] xl:w-[min(28%,20rem)]">
          <PersonPortrait
            src={photoSrc}
            alt={`Portrait of ${name}`}
            sizes="(max-width: 768px) 19rem, (max-width: 1024px) 34vw, 20rem"
            className="object-[center_18%]"
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 rounded-[1.25rem] bg-white p-4 sm:gap-6 sm:rounded-[2.125rem] sm:p-6 md:gap-6 md:rounded-[2.5rem] md:p-6 lg:p-7">
          <div className="flex min-w-0 flex-col gap-3 text-ink sm:gap-4">
            <div className="max-w-xs">
              <h3 className="font-display text-[1.35rem] leading-tight tracking-[-0.02em] text-ink sm:text-[2rem] md:text-[2.25rem] md:leading-[1.15]">
                {name}
              </h3>
              <ul className="mt-1.5 list-disc pl-5 text-sm leading-6 text-muted sm:mt-2 sm:text-base">
                <li>{role}</li>
              </ul>
            </div>
            <div className="max-w-3xl text-sm leading-6 text-body sm:text-base sm:leading-7 md:text-lg md:leading-8">
              <p>
                “{preview.replace(/^“|”$/g, '')}”
                {needsMore ? (
                  <>
                    {' '}
                    <button
                      type="button"
                      onClick={() => setOpen(true)}
                      className="inline font-sans text-sm font-medium text-ink underline decoration-ink/35 underline-offset-[0.2em] transition-colors hover:text-accent hover:decoration-accent sm:text-base"
                    >
                      Read more
                    </button>
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <div className="mt-auto flex justify-end">
            <Button
              href={profileHref}
              variant="ink"
              size="md"
              className="px-4 py-2.5 font-normal tracking-normal"
            >
              View Profile
            </Button>
          </div>
        </div>
      </article>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-[#0b233f]/55 backdrop-blur-[2px]"
            aria-label="Close message"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              'relative z-10 flex max-h-[92svh] w-full flex-col overflow-hidden',
              'rounded-t-[1.75rem] bg-paper shadow-2xl sm:max-w-2xl sm:rounded-[2rem]',
              'md:max-w-3xl',
            )}
          >
            <div className="flex items-start gap-4 border-b border-border px-5 py-4 sm:px-7 sm:py-5">
              <div className="relative hidden size-16 shrink-0 overflow-hidden rounded-2xl bg-surface sm:block">
                <PersonPortrait
                  src={photoSrc}
                  alt=""
                  sizes="64px"
                  className="object-[center_18%]"
                  iconClassName="size-8"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Message from the Executive Director
                </p>
                <h3
                  id={titleId}
                  className="mt-1 font-display text-xl leading-tight text-ink sm:text-2xl"
                >
                  {name}
                </h3>
                <p className="mt-0.5 text-sm text-muted">{role}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-white text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                aria-label="Close"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <div className="space-y-4 text-sm leading-7 text-body sm:text-base sm:leading-8">
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>
                    {index === 0 ? `“${paragraph}` : paragraph}
                    {index === paragraphs.length - 1 ? '”' : null}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-5 py-4 sm:px-7">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
              <Button href={profileHref} variant="ink" size="md">
                View Profile
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

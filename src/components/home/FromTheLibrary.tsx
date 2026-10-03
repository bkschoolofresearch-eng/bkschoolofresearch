import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImageFrame } from '@/components/ui/ImageFrame';
import { PUBLICATION_TYPE_LABELS } from '@/lib/public/labels';
import { getPublicationCoverUrl } from '@/lib/content/prototype-media';
import { cn } from '@/lib/utils';

export type LibraryPublication = {
  id: string;
  slug: string;
  title: string;
  type: keyof typeof PUBLICATION_TYPE_LABELS;
  year?: number | null;
  venue?: string | null;
  authors: string[];
  abstract?: string | null;
  citation: string;
  coverImageUrl?: string | null;
};

type FromTheLibraryProps = {
  featured: LibraryPublication[];
  sidebar: LibraryPublication[];
};

function metaLine(publication: LibraryPublication) {
  return [PUBLICATION_TYPE_LABELS[publication.type], publication.year, publication.venue]
    .filter(Boolean)
    .join(' · ');
}

function blurb(publication: LibraryPublication) {
  const text = publication.abstract?.trim() || publication.citation;
  return text.length > 160 ? `${text.slice(0, 157).trim()}…` : text;
}

function coverSrc(publication: LibraryPublication) {
  return getPublicationCoverUrl(publication);
}

function ViewLink({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 border-b border-ink pb-0.5',
        'font-instrument text-sm font-medium leading-6 text-ink transition-colors hover:border-accent hover:text-accent',
        className,
      )}
    >
      View
      <ArrowRight className="size-5" strokeWidth={1.5} aria-hidden />
    </Link>
  );
}

/**
 * Figma Pharmacinta 206:131 — From the library
 * Left: stacked horizontal featured rows · Right: “In case you missed it”
 * Mobile: compact horizontal rows (no full-bleed square covers); 2-col from md.
 */
export function FromTheLibrary({
  featured,
  sidebar,
}: FromTheLibraryProps) {
  if (!featured.length) return null;

  return (
    <div className="mt-8 grid min-w-0 items-start gap-10 md:mt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,17.5rem)] md:gap-8 lg:mt-14 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,22rem)] lg:gap-10 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,24rem)] xl:gap-12">
      {/* Left column — featured rows */}
      <ul className="flex min-w-0 flex-col">
        {featured.map((publication, index) => (
          <li key={publication.id} className="min-w-0">
            {index > 0 ? (
              <div
                className="my-6 h-px w-full bg-border sm:my-8 lg:my-10"
                aria-hidden
              />
            ) : null}
            <article className="flex min-w-0 flex-row items-stretch gap-3.5 sm:gap-5 md:gap-6">
              <div className="w-[6.75rem] shrink-0 sm:w-[11.5rem] md:w-[13rem] lg:w-[16rem] xl:w-[18.9rem]">
                {coverSrc(publication) ? (
                  <ImageFrame
                    src={coverSrc(publication)!}
                    alt=""
                    aspect="square"
                    sizes="(max-width: 640px) 108px, (max-width: 1024px) 208px, 303px"
                    frameClassName="border-0 bg-[#d9d9d9]"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex aspect-square flex-col justify-between rounded-sm bg-surface-subtle p-3">
                    <span className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted">
                      {PUBLICATION_TYPE_LABELS[publication.type]}
                    </span>
                    <span className="font-display text-xl leading-none tabular-nums text-ink/25 sm:text-3xl lg:text-4xl">
                      {publication.year ? String(publication.year).slice(2) : '—'}
                    </span>
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:gap-6 lg:gap-8">
                <div className="min-w-0">
                  <p className="font-instrument text-xs leading-5 text-ink sm:text-sm sm:leading-6">
                    {metaLine(publication)}
                  </p>
                  <h3 className="mt-1.5 font-instrument text-base font-medium leading-snug text-ink sm:mt-2.5 sm:text-xl sm:leading-8 md:text-[1.5rem] md:leading-9">
                    <Link
                      href={`/publications/${publication.slug}`}
                      className="transition-colors hover:text-accent"
                    >
                      {publication.title}
                    </Link>
                  </h3>
                  <p className="mt-1.5 line-clamp-2 font-instrument text-xs leading-5 text-ink/80 sm:mt-2.5 sm:line-clamp-3 sm:text-sm sm:leading-6">
                    {blurb(publication)}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                  <p className="min-w-0 font-instrument text-xs leading-5 text-ink sm:text-sm sm:leading-6">
                    <span className="font-semibold">Author:</span>{' '}
                    {publication.authors.join(', ')}
                  </p>
                  <ViewLink href={`/publications/${publication.slug}`} />
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      {/* Right column — same top edge as left on md+; stacks below on phone */}
      <aside className="flex min-w-0 flex-col self-start border-t border-border pt-8 md:border-t-0 md:pt-0">
        <h3 className="font-display text-[1.5rem] leading-none text-ink sm:text-[1.75rem] lg:text-[2.25rem]">
          In case you missed it
        </h3>

        <ul className="mt-6 flex flex-col sm:mt-8">
          {sidebar.map((publication, index) => (
            <li key={publication.id} className="min-w-0">
              {index > 0 ? (
                <div className="my-3.5 h-px w-full bg-border sm:my-4" aria-hidden />
              ) : null}
              <div className="flex min-w-0 flex-col gap-2.5 sm:gap-3">
                <div className="flex min-w-0 gap-3 sm:gap-4">
                  <div className="size-[4.5rem] shrink-0 sm:size-[7.5rem] lg:size-[9.375rem]">
                    {coverSrc(publication) ? (
                      <ImageFrame
                        src={coverSrc(publication)!}
                        alt=""
                        aspect="square"
                        sizes="(max-width: 640px) 72px, 150px"
                        frameClassName="border-0 size-full bg-[#d9d9d9]"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex size-full aspect-square flex-col justify-between bg-surface-subtle p-2">
                        <span className="font-sans text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-muted">
                          {PUBLICATION_TYPE_LABELS[publication.type]}
                        </span>
                        <span className="font-display text-base leading-none tabular-nums text-ink/25 sm:text-xl lg:text-2xl">
                          {publication.year ? String(publication.year).slice(2) : '—'}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5 sm:gap-2.5">
                    <p className="font-instrument text-[0.75rem] leading-4 text-ink sm:text-[0.8125rem] sm:leading-[1.125rem]">
                      {[
                        PUBLICATION_TYPE_LABELS[publication.type],
                        publication.year,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <p className="line-clamp-3 font-instrument text-sm leading-5 text-ink sm:text-base sm:leading-6">
                      <Link
                        href={`/publications/${publication.slug}`}
                        className="transition-colors hover:text-accent"
                      >
                        {publication.title}
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center justify-between gap-3">
                  <p className="min-w-0 truncate font-instrument text-xs leading-5 text-ink sm:text-sm sm:leading-6">
                    {publication.authors.join(', ')}
                  </p>
                  <ViewLink href={`/publications/${publication.slug}`} />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-stretch sm:mt-10 sm:justify-center md:justify-start">
          <Button
            href="/publications"
            variant="ink"
            size="md"
            className="w-full px-4 py-2.5 font-normal tracking-normal sm:w-auto"
          >
            Read Publications
          </Button>
        </div>
      </aside>
    </div>
  );
}

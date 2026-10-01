'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PersonPortrait } from '@/components/home/PersonPortrait';
import { cn } from '@/lib/utils';

type TeamMemberCardProps = {
  href: string;
  name: string;
  role: string;
  imageSrc?: string | null;
  imageAlt?: string;
  /** Flip-face bio — long-form professional paragraph (Figma 168:94). */
  description: string;
  ctaLabel?: string;
  className?: string;
};

export function TeamMemberCard({
  href,
  name,
  role,
  imageSrc,
  imageAlt,
  description,
  ctaLabel = 'View Profile',
  className,
}: TeamMemberCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={cn(
        'relative aspect-[412/500] w-full [perspective:1400px] sm:aspect-[412/593]',
        className,
      )}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className={cn(
          'relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none',
          flipped && '[transform:rotateY(180deg)]',
          'motion-reduce:transform-none',
        )}
      >
        {/* Front — portrait + name / role */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col rounded-[1.35rem] bg-ink p-1 sm:rounded-[2.625rem] sm:p-2',
            '[backface-visibility:hidden]',
            'motion-reduce:static motion-reduce:h-full',
            flipped && 'motion-reduce:hidden',
          )}
        >
          <button
            type="button"
            className="flex h-full min-h-0 w-full flex-col gap-1 text-left sm:gap-2"
            onClick={() => setFlipped(true)}
            aria-expanded={flipped}
            aria-label={`Show details for ${name}`}
          >
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.1rem] bg-surface sm:rounded-[2rem]">
              <PersonPortrait
                src={imageSrc}
                alt={imageAlt ?? `Portrait of ${name}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <div className="relative shrink-0 overflow-hidden rounded-[1.1rem] bg-white px-2.5 pb-2.5 pt-2.5 sm:rounded-[2rem] sm:px-6 sm:pb-6 sm:pt-6">
              <p className="font-sans text-[0.8125rem] leading-snug text-ink sm:text-2xl">
                {name}
              </p>
              <p className="mt-0.5 font-sans text-[0.6875rem] font-light leading-snug text-muted sm:mt-1 sm:text-base">
                {role}
              </p>
            </div>
          </button>
        </div>

        {/* Back — bio paragraph + View Profile (Figma flip) */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col justify-between rounded-[1.35rem] bg-ink p-3.5 sm:rounded-[2.625rem] sm:p-6',
            '[backface-visibility:hidden] [transform:rotateY(180deg)]',
            'motion-reduce:static motion-reduce:mt-0 motion-reduce:h-full motion-reduce:transform-none',
            !flipped && 'motion-reduce:hidden',
          )}
        >
          <p className="line-clamp-[10] font-sans text-xs leading-relaxed text-paper sm:line-clamp-[12] sm:text-[0.9375rem] sm:leading-[1.55]">
            {description}
          </p>
          <div className="flex justify-end pt-3 sm:pt-4">
            <Link
              href={href}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-sans text-[0.6875rem] font-medium text-ink transition-colors hover:bg-paper sm:px-3 sm:py-1.5 sm:text-sm"
              onClick={(event) => event.stopPropagation()}
            >
              {ctaLabel}
              <ArrowRight className="size-3 sm:size-3.5" strokeWidth={2} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

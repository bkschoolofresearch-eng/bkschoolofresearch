'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type PeopleSectionNavLink = {
  href: string;
  label: string;
};

type PeopleSectionNavProps = {
  links: PeopleSectionNavLink[];
  className?: string;
};

export function PeopleSectionNav({ links, className }: PeopleSectionNavProps) {
  const [activeHref, setActiveHref] = useState(links[0]?.href ?? '');

  useEffect(() => {
    if (!links.length) return;

    const sections = links
      .map((link) => {
        const id = link.href.replace('#', '');
        const el = document.getElementById(id);
        return el ? { href: link.href, el } : null;
      })
      .filter((item): item is { href: string; el: HTMLElement } => Boolean(item));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (!top?.target.id) return;
        setActiveHref(`#${top.target.id}`);
      },
      {
        rootMargin: '-28% 0px -55% 0px',
        threshold: [0.05, 0.15, 0.3],
      },
    );

    sections.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
  }, [links]);

  if (links.length < 2) return null;

  return (
    <nav
      aria-label="Team sections"
      className={cn(
        'mt-5 w-full overflow-x-auto sm:mt-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      <ul className="mx-auto flex w-max max-w-none flex-nowrap items-center justify-center gap-1.5 sm:gap-2">
        {links.map((link) => {
          const active = activeHref === link.href;
          return (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={active ? 'true' : undefined}
                onClick={() => setActiveHref(link.href)}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-1 font-sans text-[0.7rem] leading-none transition-[background-color,border-color,color,box-shadow] duration-200 sm:px-3 sm:py-1.5 sm:text-xs',
                  active
                    ? 'border-ink bg-ink text-paper shadow-[0_10px_28px_-18px_rgba(13,39,69,0.55)]'
                    : 'border-ink/15 bg-white text-ink/75 hover:border-ink/35 hover:text-ink',
                )}
              >
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

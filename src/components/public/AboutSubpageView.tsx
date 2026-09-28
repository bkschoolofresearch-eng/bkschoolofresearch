import Link from 'next/link';
import { ArticleReading } from '@/components/editorial/ArticleReading';
import { PageHero } from '@/components/layout/PageHero';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { EmptyState } from '@/components/ui/EmptyState';
import type { AboutPageSlug, AboutStaticPage } from '@/content/about-pages';
import { pageHeroMedia } from '@/lib/content/page-heroes';

const ABOUT_LINKS = [
  { href: '/about/who-we-are', label: 'Who We Are', slug: 'who-we-are' },
  { href: '/about/what-we-do', label: 'What We Do', slug: 'what-we-do' },
  { href: '/about/governance', label: 'Governance', slug: 'governance' },
  { href: '/about/policies', label: 'Our Policies', slug: 'policies' },
] as const satisfies ReadonlyArray<{
  href: string;
  label: string;
  slug: AboutPageSlug;
}>;

type AboutSubpageViewProps = {
  page: AboutStaticPage;
  slug: AboutPageSlug;
  bodySlot?: React.ReactNode;
};

export function AboutSubpageView({ page, slug, bodySlot }: AboutSubpageViewProps) {
  const siblings = ABOUT_LINKS.filter((item) => item.slug !== slug);

  return (
    <>
      <PageHero
        eyebrow="Institution"
        title={page.title}
        description={page.comingSoon?.excerpt ?? page.excerpt}
        imageSrc={pageHeroMedia.about}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: page.title },
        ]}
      />
      <ArticleReading
        body={page.comingSoon || bodySlot ? '' : page.body}
        bodySlot={
          bodySlot ??
          (page.comingSoon ? (
            <EmptyState
              className="rounded-[1.35rem] sm:rounded-[1.75rem]"
              title={page.comingSoon.title}
              description={page.comingSoon.description}
            />
          ) : undefined)
        }
        backHref="/about"
        backLabel="Back to About"
        aside={
          <div className="space-y-6">
            <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
              In this section
            </p>
            <ul className="space-y-4">
              {siblings.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 border-b border-ink pb-0.5 font-instrument text-base font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-5">
              <ArrowLink href="/people">Meet our people</ArrowLink>
            </div>
          </div>
        }
      />
    </>
  );
}

import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { Section } from '@/components/ui/Section';
import { getContentDatabase } from '@/lib/cms/get-content-database';
import { pageHeroMedia } from '@/lib/content/page-heroes';
import {
  noticeApplyHref,
  resolveFormForVacancy,
} from '@/lib/content/registration-forms';
import { getNotices } from '@/lib/content/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { formatDate } from '@/lib/utils';

export const metadata = buildPageMetadata(
  'Vacancy at BKSR',
  'Vacancies and opportunities to work with BK School of Research.',
  '/people/career',
);

export default async function CareerPage() {
  const [notices, db] = await Promise.all([
    getNotices(),
    getContentDatabase(),
  ]);
  const vacancies = notices.filter((item) => item.noticeType === 'vacancy');

  return (
    <>
      <PageHero
        eyebrow="People"
        title="Vacancy at BKSR"
        description="Open calls and vacancy notices for research and programme roles at BK School of Research."
        imageSrc={pageHeroMedia.people}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'People', href: '/people' },
          { label: 'Vacancy at BKSR' },
        ]}
      />
      <Section tone="white">
        <Container>
          {vacancies.length ? (
            <ul className="grid gap-5 md:grid-cols-2">
              {vacancies.map((item) => {
                const form = resolveFormForVacancy(db, item);
                const applyHref = noticeApplyHref(item, form, {
                  requireOpen: true,
                });

                return (
                  <li key={item.id}>
                    <article className="flex h-full flex-col border border-border bg-white p-6 md:p-8">
                      <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent">
                        {[
                          'Vacancy',
                          item.publishedAt
                            ? formatDate(item.publishedAt, 'd MMM yyyy')
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <h2 className="mt-3 font-display text-2xl text-ink">
                        <Link
                          href={`/notices/${item.slug}`}
                          className="transition-colors hover:text-accent"
                        >
                          {item.title}
                        </Link>
                      </h2>
                      {item.summary ? (
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                          {item.summary}
                        </p>
                      ) : null}
                      <div className="mt-6 flex flex-wrap items-center gap-4">
                        {applyHref ? (
                          <Link
                            href={applyHref}
                            {...(/^https?:\/\//i.test(applyHref)
                              ? { target: '_blank', rel: 'noopener noreferrer' }
                              : {})}
                            className="inline-flex rounded-full bg-ink px-4 py-2 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-accent"
                          >
                            Apply
                          </Link>
                        ) : null}
                        <Link
                          href={`/notices/${item.slug}`}
                          className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent"
                        >
                          View notice →
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="No open vacancies right now"
              description="When BKSR posts roles, they will appear here and under Notices."
              action={<ArrowLink href="/notices">Browse notices</ArrowLink>}
            />
          )}
        </Container>
      </Section>
    </>
  );
}

import { notFound } from 'next/navigation';
import { PageHero } from '@/components/layout/PageHero';
import {
  ArticleReading,
  VacancyAside,
} from '@/components/editorial/ArticleReading';
import { getContentDatabase } from '@/lib/cms/get-content-database';
import {
  noticeApplyHref,
  resolveFormForVacancy,
} from '@/lib/content/registration-forms';
import { getNoticeBySlug, getNotices } from '@/lib/content/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { formatDate } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

const NOTICE_TYPE_LABELS: Record<string, string> = {
  vacancy: 'Vacancy',
  announcement: 'Announcement',
  general: 'Notice',
};

export async function generateStaticParams() {
  return (await getNotices({ includeDrafts: true })).map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = await getNoticeBySlug(slug, { includeDrafts: true });
  if (!item) return {};
  return buildPageMetadata(
    item.title,
    item.summary ?? item.title,
    `/notices/${item.slug}`,
  );
}

export default async function DetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getNoticeBySlug(slug);
  if (!item) notFound();

  const isVacancy = item.noticeType === 'vacancy';
  const db = await getContentDatabase();
  const form = isVacancy ? resolveFormForVacancy(db, item) : undefined;
  const applyHref = isVacancy ? noticeApplyHref(item, form) : null;

  const deadlineLabel = item.deadlineAt
    ? formatDate(item.deadlineAt, 'd MMMM yyyy')
    : item.slug === 'job-vacancy'
      ? '20 July 2023 (extended)'
      : item.slug === 'vacancy-announcement'
        ? '25 July 2020'
        : item.slug === 'bk-school-of-research-is-looking-for'
          ? '15 October 2020'
          : null;

  return (
    <>
      <PageHero
        eyebrow={NOTICE_TYPE_LABELS[item.noticeType] ?? 'Notice'}
        title={item.title}
        description={item.summary}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'News and Events', href: '/news-events' },
          { label: 'Notices', href: '/notices' },
          { label: item.title },
        ]}
      />
      <ArticleReading
        body={item.body}
        imageUrl={item.featuredImageUrl}
        imageAlt={`Notice graphic for ${item.title}`}
        imageAspect="square"
        meta={
          item.publishedAt ? (
            <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
              Published {formatDate(item.publishedAt, 'd MMMM yyyy')}
            </p>
          ) : null
        }
        aside={
          isVacancy ? (
            <VacancyAside
              applyHref={applyHref}
              email="bksr.bd2015@gmail.com"
              whatsapp="+8801747256047"
              deadline={deadlineLabel}
            />
          ) : null
        }
        legacyUrl={item.originalLegacyUrl}
        backHref="/notices"
        backLabel="All notices"
      />
    </>
  );
}

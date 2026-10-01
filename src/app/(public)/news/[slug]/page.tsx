import { notFound } from 'next/navigation';
import { PageHero } from '@/components/layout/PageHero';
import { ArticleReading } from '@/components/editorial/ArticleReading';
import { getNewsBySlug, getNews } from '@/lib/content/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { formatDate } from '@/lib/utils';
import { isProductionBuild } from '@/lib/cms/build-phase';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  if (isProductionBuild()) return [];
  return (await getNews({ includeDrafts: true })).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug, { includeDrafts: true });
  if (!item) return {};
  return buildPageMetadata(
    item.title,
    item.excerpt ?? item.title,
    `/news/${item.slug}`,
  );
}

export default async function DetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  return (
    <>
      <PageHero
        eyebrow={item.categoryLabels?.[0] ?? 'News'}
        title={item.title}
        description={item.excerpt}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'News', href: '/news' },
          { label: item.title },
        ]}
      />
      <ArticleReading
        body={item.body}
        imageUrl={item.featuredImageUrl}
        imageAlt=""
        imageAspect="video"
        meta={
          <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
            {[
              item.publishedAt
                ? formatDate(item.publishedAt, 'd MMMM yyyy')
                : null,
              item.author,
              item.categoryLabels?.join(' · '),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        }
        legacyUrl={item.originalLegacyUrl}
        backHref="/news"
        backLabel="All news"
      />
    </>
  );
}

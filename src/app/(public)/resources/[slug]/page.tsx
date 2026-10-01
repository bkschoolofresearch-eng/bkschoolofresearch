import { notFound } from 'next/navigation';
import { ArticleReading } from '@/components/editorial/ArticleReading';
import { PageHero } from '@/components/layout/PageHero';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Tag } from '@/components/ui/Tag';
import { pageHeroMedia } from '@/lib/content/page-heroes';
import { getResourceBySlug, getResources } from '@/lib/content/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { isProductionBuild } from '@/lib/cms/build-phase';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  if (isProductionBuild()) return [];
  return (await getResources({ includeDrafts: true })).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = await getResourceBySlug(slug, { includeDrafts: true });
  if (!item) return {};
  return buildPageMetadata(item.title, item.summary, `/resources/${item.slug}`);
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params;
  const item = await getResourceBySlug(slug);
  if (!item) notFound();

  const bodyParts = [
    item.description,
    item.notes ? `<p><em>${item.notes}</em></p>` : '',
  ].filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow="Knowledge hub"
        title={item.title}
        description={item.summary}
        imageSrc={pageHeroMedia.resources}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Resources', href: '/resources' },
          { label: item.title },
        ]}
        actions={
          item.externalUrl ? (
            <ArrowLink href={item.externalUrl} external>
              Open external resource
            </ArrowLink>
          ) : undefined
        }
      />
      <ArticleReading
        body={bodyParts.join('\n')}
        backHref="/resources"
        backLabel="Back to resources"
        meta={
          item.topics?.length || item.software?.length ? (
            <div className="flex flex-wrap gap-2">
              {(item.software ?? []).map((soft) => (
                <Tag key={soft}>{soft}</Tag>
              ))}
              {(item.topics ?? []).map((topic) => (
                <Tag key={topic} tone="sage">
                  {topic}
                </Tag>
              ))}
            </div>
          ) : undefined
        }
        aside={
          <div className="space-y-5">
            <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
              Resource
            </p>
            {item.software?.length ? (
              <div>
                <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Software
                </p>
                <p className="mt-1 text-sm text-ink">{item.software.join(', ')}</p>
              </div>
            ) : null}
            {item.externalUrl ? (
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center bg-accent px-6 font-sans text-sm font-semibold tracking-[0.04em] text-white transition-colors hover:bg-ink"
              >
                Open external link
              </a>
            ) : (
              <p className="text-sm text-muted">
                This guide is archived on the BKSR site.
              </p>
            )}
          </div>
        }
      />
    </>
  );
}

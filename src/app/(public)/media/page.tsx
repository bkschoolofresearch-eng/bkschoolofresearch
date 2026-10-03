import { PageHero } from '@/components/layout/PageHero';
import { PublicationFilters } from '@/components/public/PublicationFilters';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { Section } from '@/components/ui/Section';
import { getMediaClippings } from '@/lib/content/queries';
import { brandPhotos } from '@/lib/content/prototype-media';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata(
  'BKSR in Media',
  'Where BK School of Research appears across newspapers, television, and digital outlets.',
  '/media',
);

export default async function Page() {
  const clippings = await getMediaClippings();

  return (
    <>
      <PageHero
        eyebrow="Press"
        title="BKSR in Media"
        description="Where BK School of Research appears across newspapers, television, and digital outlets."
        imageSrc={brandPhotos.pressCoverage}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'BKSR in Media' }]}
      />
      <Section tone="white">
        <Container>
          {clippings.length ? (
            <PublicationFilters
              publications={clippings}
              areas={[]}
              external
            />
          ) : (
            <EmptyState
              title="No press coverage listed yet"
              description="Media clippings and broadcast features will appear here when published."
            />
          )}
        </Container>
      </Section>
    </>
  );
}

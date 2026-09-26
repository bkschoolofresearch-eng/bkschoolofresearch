import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { EditorialHeading } from '@/components/ui/EditorialHeading';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { pageHeroMedia } from '@/lib/content/page-heroes';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata(
  'Research Grants',
  'How BKSR intends to structure research grant opportunities — open calls, review, and reporting.',
  '/research/grants',
);

const PROGRAMME = [
  {
    title: 'Open calls',
    body: 'Tied to education, policy, social development, and related themes.',
  },
  {
    title: 'Eligibility',
    body: 'Oriented to early-career researchers and collaborative teams.',
  },
  {
    title: 'Review',
    body: 'Criteria emphasising research design, ethics, and public value.',
  },
  {
    title: 'Reporting',
    body: 'Expectations that feed publication and knowledge-hub pipelines.',
  },
] as const;

export default function ResearchGrantsPage() {
  return (
    <>
      <PageHero
        eyebrow="Research"
        title="Research grants"
        description="Programme architecture for future grant opportunities. Live calls will appear here and in Notices when announced."
        imageSrc={pageHeroMedia.research}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Research', href: '/research' },
          { label: 'Grants' },
        ]}
      />

      <Section tone="white" className="py-14 md:py-20">
        <Container>
          <EmptyState
            title="No active grant calls published"
            description="BKSR anticipates structuring research grants around open calls, thematic priorities aligned with our focus fields, and transparent review. Individual awards are not listed yet — none are in the verified archive."
            action={
              <>
                <ArrowLink href="/research/areas">Explore research areas</ArrowLink>
                <ArrowLink href="/notices">Check notices</ArrowLink>
                <ArrowLink href="/contact">Contact BKSR</ArrowLink>
              </>
            }
          />
        </Container>
      </Section>

      <Section className="bg-[#F7F1E6] py-14 md:py-20">
        <Container>
          <div className="mb-10 max-w-2xl">
            <Eyebrow>Programme shape</Eyebrow>
            <EditorialHeading as="h2" size="md" className="mt-3">
              How calls will be structured
            </EditorialHeading>
            <p className="mt-4 text-[0.975rem] leading-[1.7] text-muted">
              When opportunities open, they will follow this frame — then list on
              this page with clear eligibility and deadlines.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMME.map((item) => (
              <article
                key={item.title}
                className="border border-border bg-white p-6"
              >
                <Eyebrow>{item.title}</Eyebrow>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-10 text-sm text-muted">
            Prefer working through a focus field first?{' '}
            <Link
              href="/research"
              className="font-semibold text-accent hover:underline"
            >
              Browse the research portfolio
            </Link>
            .
          </p>
        </Container>
      </Section>
    </>
  );
}

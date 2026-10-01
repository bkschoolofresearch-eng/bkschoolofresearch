'use client';

import Link from 'next/link';
import { TeamMemberCard } from '@/components/home/TeamMemberCard';
import { Reveal } from '@/components/motion/Reveal';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { EditorialHeading } from '@/components/ui/EditorialHeading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Section } from '@/components/ui/Section';

export type PeopleHubMember = {
  id: string;
  href: string;
  name: string;
  role: string;
  imageSrc: string | null;
  description: string;
};

type PeopleCategoryHubProps = {
  title: string;
  description: string;
  members: PeopleHubMember[];
};

/**
 * Category hubs share the /people directory language:
 * centered masthead + flip cards — not a separate CMS list template.
 */
export function PeopleCategoryHub({
  title,
  description,
  members,
}: PeopleCategoryHubProps) {
  return (
    <>
      <Section
        tone="white"
        spaced={false}
        className="pt-28 pb-6 md:pt-32 md:pb-8"
      >
        <Container>
          <div className="flex justify-center">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'People', href: '/people' },
                { label: title },
              ]}
            />
          </div>
          <header className="mx-auto max-w-3xl text-center">
            <EditorialHeading as="h1" size="xl" className="text-balance">
              {title}
            </EditorialHeading>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg md:text-xl">
              {description}
            </p>
            <p className="mt-3 font-sans text-xs tracking-wide text-muted/80">
              {members.length
                ? `${members.length} ${members.length === 1 ? 'profile' : 'profiles'}`
                : 'No profiles yet'}
            </p>
            <ArrowLink href="/people" className="mt-6 justify-center">
              View full directory
            </ArrowLink>
          </header>
        </Container>
      </Section>

      <Section
        tone="surface"
        spaced={false}
        className="border-y border-border py-12 sm:py-14 md:py-16"
      >
        <Container>
          {members.length ? (
            <ul className="grid w-full grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {members.map((member, index) => (
                <li key={member.id} className="min-w-0">
                  <Reveal delay={Math.min(index * 0.04, 0.12)}>
                    <TeamMemberCard
                      href={member.href}
                      name={member.name}
                      role={member.role}
                      imageSrc={member.imageSrc}
                      description={member.description}
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No profiles published yet"
              description="This category is reserved for future listings."
              action={<ArrowLink href="/people">View full directory</ArrowLink>}
            />
          )}
        </Container>
      </Section>

      <Section tone="white" spaced={false} className="pb-16 md:pb-24">
        <Container>
          <div className="border border-ink bg-ink px-6 py-10 text-center text-paper sm:px-10 sm:py-12">
            <EditorialHeading
              as="h2"
              className="text-3xl text-paper sm:text-4xl"
            >
              Meet the full team
            </EditorialHeading>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-paper/75 sm:text-base">
              Browse every category in one directory — leadership, fellows,
              research, and administration.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/people" variant="onInk" size="lg">
                People directory
              </Button>
              <Button href="/people/career" variant="onInkSecondary" size="lg">
                Career at BKSR
              </Button>
            </div>
            <Link
              href="/about"
              className="mt-6 inline-flex font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-paper/80 transition-colors hover:text-paper"
            >
              About BKSR →
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}

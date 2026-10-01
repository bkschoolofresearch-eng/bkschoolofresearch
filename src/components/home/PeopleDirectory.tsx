'use client';

import { TeamMemberCard } from '@/components/home/TeamMemberCard';
import { PeopleSectionNav } from '@/components/home/PeopleSectionNav';
import { Reveal } from '@/components/motion/Reveal';
import { EditorialHeading } from '@/components/ui/EditorialHeading';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import type { PersonCategory } from '@/types/content';

export type PeopleDirectoryMember = {
  id: string;
  href: string;
  name: string;
  role: string;
  imageSrc: string | null;
  description: string;
  category: PersonCategory;
};

export type PeopleDirectoryGroup = {
  id: string;
  title: string;
  description: string;
  members: PeopleDirectoryMember[];
};

export type PeopleDirectoryDirector = {
  href: string;
  name: string;
  role: string;
  imageSrc: string | null;
  description: string;
};

type JumpLink = { href: string; label: string };

type PeopleDirectoryProps = {
  director: PeopleDirectoryDirector | null;
  groups: PeopleDirectoryGroup[];
  jumpLinks: JumpLink[];
  directorSectionId: string;
};

function TeamSection({
  id,
  title,
  description,
  members,
}: {
  id: string;
  title: string;
  description: string;
  members: PeopleDirectoryMember[];
}) {
  if (!members.length) {
    return (
      <section
        id={id}
        className="scroll-mt-28 border-t border-border pt-14 sm:scroll-mt-32 sm:pt-16"
      >
        <Reveal className="mx-auto w-full text-center">
          <EditorialHeading
            as="h2"
            className="!text-[clamp(1.15rem,4.6vw,2.25rem)] !leading-tight whitespace-nowrap"
          >
            {title}
          </EditorialHeading>
          {description ? (
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              {description}
            </p>
          ) : null}
          <p className="mt-2 font-sans text-xs tracking-wide text-muted/80">
            No profiles in this section yet.
          </p>
        </Reveal>
      </section>
    );
  }

  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-border pt-14 sm:scroll-mt-32 sm:pt-16"
    >
      <Reveal className="mx-auto w-full text-center">
        <EditorialHeading
          as="h2"
          className="!text-[clamp(1.15rem,4.6vw,2.25rem)] !leading-tight whitespace-nowrap"
        >
          {title}
        </EditorialHeading>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          {description}
        </p>
        <p className="mt-2 font-sans text-xs tracking-wide text-muted/80">
          {members.length} {members.length === 1 ? 'profile' : 'profiles'}
        </p>
      </Reveal>
      <ul className="mt-10 grid w-full grid-cols-2 gap-3 sm:mt-12 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
    </section>
  );
}

export function PeopleDirectory({
  director,
  groups,
  jumpLinks,
  directorSectionId,
}: PeopleDirectoryProps) {
  return (
    <>
      <Section tone="white" spaced={false} className="pt-20 pb-4 sm:pt-24 sm:pb-5">
        <Container>
          <header className="mx-auto max-w-3xl text-center">
            <EditorialHeading as="h1" size="xl" className="text-balance">
              Meet our team
            </EditorialHeading>
            <p className="mt-2 text-base leading-relaxed text-muted sm:text-lg">
              Researchers, fellows, and programme contributors behind BKSR’s
              work.
            </p>
          </header>

          {jumpLinks.length > 1 ? <PeopleSectionNav links={jumpLinks} /> : null}
        </Container>
      </Section>

      {director ? (
        <Section
          id={directorSectionId}
          tone="surface"
          spaced={false}
          className="scroll-mt-28 border-y border-border py-12 sm:scroll-mt-32 sm:py-14"
        >
          <Container>
            <div className="flex flex-col items-center">
              <Reveal className="mx-auto max-w-2xl text-center">
                <EditorialHeading as="h2" className="text-3xl sm:text-4xl">
                  Executive Director
                </EditorialHeading>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  Institutional leadership of BK School of Research.
                </p>
              </Reveal>
              <Reveal className="mt-8 w-full sm:mt-10 sm:w-[min(100%,20.5rem)] lg:w-[calc((100%-4.5rem)/4)]">
                <TeamMemberCard
                  href={director.href}
                  name={director.name}
                  role={director.role}
                  imageSrc={director.imageSrc}
                  description={director.description}
                />
              </Reveal>
            </div>
          </Container>
        </Section>
      ) : null}

      <Section tone="white" className="pt-4 md:pt-6">
        <Container>
          <div className="space-y-16 sm:space-y-20">
            {groups.map((group) => (
              <TeamSection
                key={group.id}
                id={group.id}
                title={group.title}
                description={group.description}
                members={group.members}
              />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

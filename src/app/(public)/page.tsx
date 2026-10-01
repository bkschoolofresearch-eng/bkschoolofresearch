import Link from 'next/link';
import { BksrInMedia } from '@/components/home/BksrInMedia';
import { CollaborationOnRecord } from '@/components/home/CollaborationOnRecord';
import { FocusAreasCarousel } from '@/components/home/FocusAreasCarousel';
import { OurResearch } from '@/components/home/OurResearch';
import { HeroSlideshow } from '@/components/home/HeroSlideshow';
import { MessageFromExecutive } from '@/components/home/MessageFromExecutive';
import { NoticesAndEvents } from '@/components/home/NoticesAndEvents';
import { NoticesNewsCarousel } from '@/components/home/NoticesNewsCarousel';
import { OurPrograms } from '@/components/home/OurPrograms';
import { ResearcherSay } from '@/components/home/ResearcherSay';
import { StatsMarquee } from '@/components/home/StatsMarquee';
import { TeamMemberCard } from '@/components/home/TeamMemberCard';
import { WhoWeAre } from '@/components/home/WhoWeAre';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { EditorialHeading } from '@/components/ui/EditorialHeading';
import { ImageFrame } from '@/components/ui/ImageFrame';
import { Section } from '@/components/ui/Section';
import {
  getActivities,
  getEvents,
  getHomepageConfig,
  getNotices,
  getPeople,
  getPersonById,
  getMediaClippings,
  getPublications,
  getResearchAreas,
  getResearchProjects,
  getSiteSettings,
} from '@/lib/content/queries';
import { uploadedPersonPhoto } from '@/lib/content/person-photo';
import {
  heroSlides,
  prototypeMedia,
} from '@/lib/content/prototype-media';
import {
  ABOUT_HEADLINE,
  ABOUT_OVERVIEW_IDENTITY,
  WHAT_WE_DO_PILLARS,
} from '@/content/about-hub';
import { withResearchExternalUrls } from '@/lib/content/research-links';
import { publicationCardSupportingLine } from '@/lib/content/publication-card';
import { resolveLiveHomepage } from '@/lib/content/homepage-live';
import { siteSettings } from '@/content/seed/site-settings';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata(
  siteSettings.defaultSeo.title,
  siteSettings.defaultSeo.description,
  '/',
);

function HomeSectionIntro({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <Reveal className="mx-auto w-full max-w-6xl text-center">
      <EditorialHeading
        as="h2"
        size="xl"
        className="text-pretty lg:text-nowrap"
      >
        {title}
      </EditorialHeading>
      {children ? (
        <p className="mx-auto mt-4 max-w-5xl text-sm leading-relaxed text-muted sm:mt-4 sm:text-lg md:text-xl lg:max-w-none lg:whitespace-nowrap">
          {children}
        </p>
      ) : null}
    </Reveal>
  );
}

export default async function HomePage() {
  const settings = await getSiteSettings();
  const homepage = await getHomepageConfig();
  const areas = await getResearchAreas();
  const activities = await getActivities();
  const events = await getEvents();
  const notices = await getNotices();
  const researchProjectsRaw = await getResearchProjects();
  const allPublications = await getPublications();
  const researchProjects = withResearchExternalUrls(
    researchProjectsRaw,
    allPublications,
  );
  const opinionPublications = await getPublications({ type: 'opinion' });
  const mediaCoverage = await getMediaClippings();

  const archiveVisuals = [
    ...mediaCoverage
      .map((item) => item.coverImageUrl)
      .filter((url): url is string => Boolean(url)),
    ...opinionPublications
      .map((item) => item.coverImageUrl)
      .filter((url): url is string => Boolean(url)),
    prototypeMedia.researchField.url,
    prototypeMedia.activityWorkshop.url,
    prototypeMedia.eventSeminar.url,
    prototypeMedia.knowledgeArchive.url,
    prototypeMedia.heroSlideField.url,
    prototypeMedia.heroSlideArchive.url,
    prototypeMedia.heroSlideWebinar.url,
  ];

  const verifiedStats = [...homepage.stats]
    .filter((stat) => stat.verified)
    .sort((a, b) => a.order - b.order);

  const people = await getPeople();
  const live = resolveLiveHomepage(homepage, {
    areas,
    projects: researchProjects,
    people,
    notices,
    events,
    media: mediaCoverage,
    opinions: opinionPublications,
  });
  const researchFeatured = live.research.slice(0, 2);
  const researchSidebar = live.research.slice(2, 5);

  const director =
    (await getPersonById(homepage.directorPersonId)) ??
    people.find((person) => person.category === 'executive-director');
  const directorPhoto = uploadedPersonPhoto(director?.photoUrl);

  /** Flip-face copy: Figma-style narrative bio paragraph. */
  const teamFlipDescription = (person: {
    name: string;
    role: string;
    shortBio?: string | null;
    bio?: string | null;
    affiliation?: string | null;
  }) => {
    const short = person.shortBio?.trim();
    if (short) return short;

    const firstParagraph = person.bio
      ?.split(/\n\s*\n/)[0]
      ?.replace(/\s+/g, ' ')
      .trim();
    if (firstParagraph) return firstParagraph;

    if (person.affiliation) {
      return `${person.name} serves as ${person.role} at BK School of Research. ${person.affiliation}.`;
    }

    return `${person.name} serves as ${person.role} at BK School of Research.`;
  };

  const teamMembers = live.people.map((person) => ({
      href: `/people/${person.slug}`,
      name: person.name,
      role: person.role,
      image: uploadedPersonPhoto(person.photoUrl),
      description: teamFlipDescription(person),
    }));

  const researcherQuotes = live.quotes;

  const eventItems = live.events;

  const noticeSlides = live.notices.map((item, index) => ({
    id: item.id,
    href: `/notices/${item.slug}`,
    title: item.title,
    summary: item.summary,
    imageUrl:
      item.featuredImageUrl ??
      archiveVisuals[index] ??
      prototypeMedia.heroSeminar.url,
  }));

  const eventSlides = live.events.map((item, index) => ({
    id: item.id,
    href: `/events/${item.slug}`,
    title: item.title,
    summary: item.summary,
    imageUrl:
      item.featuredImageUrl ??
      archiveVisuals[index] ??
      prototypeMedia.eventSeminar.url,
  }));

  const programItems = [
    {
      href: '/activities/capacity-building',
      title: 'Capacity Building',
      summary:
        'Training workshops, fellowships and grants, and mentorship across career stages.',
      imageSrc:
        activities.find((item) => item.type === 'capacity-building')?.imageUrl ??
        archiveVisuals[0] ??
        prototypeMedia.activityWorkshop.url,
    },
    {
      href: '/activities/research-talks',
      title: 'Policy & Academic Engagement',
      summary:
        'Policy dialogues, evidence briefings, seminars, and academic partnerships.',
      imageSrc:
        activities.find((item) => item.type === 'research-talk')?.imageUrl ??
        archiveVisuals[1] ??
        prototypeMedia.eventSeminar.url,
    },
    {
      href: '/activities/awareness-campaigns',
      title: 'Community & Social Impact',
      summary:
        'Field studies, outreach, and civil-society collaboration grounded in communities.',
      imageSrc:
        activities.find((item) => item.type === 'awareness-campaign')
          ?.imageUrl ??
        archiveVisuals[2] ??
        prototypeMedia.activityWorkshop.url,
    },
  ];

  const homeAreas = live.areas;
  const homeMedia = live.media;
  const opinionSlides = live.opinions.map((item, index) => ({
    id: item.id,
    href: `/publications/${item.slug}`,
    title: item.title,
    summary: publicationCardSupportingLine(item) ?? undefined,
    imageUrl:
      item.coverImageUrl ??
      archiveVisuals[index] ??
      archiveVisuals[0],
  }));

  const primaryCta =
    homepage.heroCtas.find((cta) => cta.variant === 'primary') ??
    homepage.heroCtas[0];
  const secondaryCta =
    homepage.heroCtas.find((cta) => cta.variant === 'secondary') ??
    homepage.heroCtas[1];

  const heroImage = homepage.heroImageUrl ?? prototypeMedia.heroSeminar.url;
  const slides = [
    { src: heroImage, alt: prototypeMedia.heroSeminar.alt },
    ...heroSlides.filter((slide) => slide.src !== heroImage),
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink">
        <HeroSlideshow slides={slides} />
        <Container className="relative flex min-h-[72svh] max-h-208 flex-col justify-end pb-10 pt-24 sm:min-h-[78vh] sm:pb-16 sm:pt-32 lg:min-h-[85vh] lg:pb-20">
          <Reveal className="max-w-4xl min-w-0">
            <h1 className="max-w-full font-display text-[clamp(1.15rem,0.55rem+4.8vw,3.5rem)] font-normal leading-[1.05] tracking-normal text-paper whitespace-nowrap">
              BK School of Research
            </h1>
            <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-paper/80 sm:mt-6 sm:text-lg md:text-xl">
              {homepage.heroSubtitle?.trim() ||
                'A Heaven for Inquisitive Minds.'}
            </p>
            <div className="mt-7 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row">
              {primaryCta ? (
                <Button
                  href={primaryCta.href}
                  variant="ink"
                  size="lg"
                  className="w-full border border-paper/25 sm:w-auto"
                >
                  {primaryCta.label}
                </Button>
              ) : null}
              {secondaryCta ? (
                <Button
                  href={secondaryCta.href}
                  variant="onInk"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {secondaryCta.label}
                </Button>
              ) : null}
            </div>
          </Reveal>
        </Container>
      </section>

      <StatsMarquee items={verifiedStats} />

      <Section tone="white" spaced={false} className="py-12 sm:py-14 md:py-16">
        <Container>
          <HomeSectionIntro title="Who we are">
            {ABOUT_HEADLINE}.
          </HomeSectionIntro>
          <Reveal>
            <WhoWeAre
              foundedYear={settings.foundedYear}
              motto="Turning evidence into policy, and policy into change."
              tagline=""
              identity={ABOUT_OVERVIEW_IDENTITY}
              featureImageSrc={
                archiveVisuals[0] ?? prototypeMedia.researchField.url
              }
              featureImageAlt="BKSR research and academic work"
              pillars={WHAT_WE_DO_PILLARS.map((pillar) => ({
                id: pillar.id,
                title: pillar.title,
                description: pillar.description,
                href: pillar.href,
              }))}
            />
          </Reveal>
        </Container>
      </Section>

      {director ? (
        <Section tone="white" className="border-t border-border">
          <Container>
            <HomeSectionIntro title="Message from the Executive Director">
              From mentorship to global impact - a decade of evidence-driven
              transformation.
            </HomeSectionIntro>
            <Reveal className="mt-12 sm:mt-14">
              <MessageFromExecutive
                name={director.name}
                role={director.role}
                message={homepage.directorMessageExcerpt}
                photoSrc={directorPhoto}
                profileHref={`/people/${director.slug}`}
              />
            </Reveal>
          </Container>
        </Section>
      ) : null}

      <FocusAreasCarousel
        areas={homeAreas.map((area) => ({
          id: area.id,
          slug: area.slug,
          title: area.title,
          description: area.shortDescription ?? area.description,
        }))}
      />

      {researchFeatured.length ? (
        <Section tone="white" className="border-t border-border">
          <Container>
            <HomeSectionIntro title="Our Research" />

            <OurResearch
              featured={researchFeatured}
              sidebar={researchSidebar}
            />
          </Container>
        </Section>
      ) : null}

      <OurPrograms items={programItems} />

      {noticeSlides.length || eventSlides.length ? (
        <Section
          tone="white"
          spaced={false}
          className="border-t border-border py-10 sm:py-12 md:py-14"
        >
          <Container>
            <Reveal className="mx-auto w-full max-w-6xl text-center">
              <EditorialHeading
                as="h2"
                size="lg"
                className="text-pretty lg:text-nowrap"
              >
                Notice and Events
              </EditorialHeading>
            </Reveal>
            <div className="mt-10 sm:mt-12">
              <NoticesAndEvents
                notices={noticeSlides}
                events={eventSlides}
                fallbackImage={prototypeMedia.heroSeminar.url}
              />
            </div>
          </Container>
        </Section>
      ) : null}

      <Section
        tone="white"
        spaced={false}
        className="border-t border-border py-10 sm:py-12 md:py-14"
      >
        <Container>
          <HomeSectionIntro title="BKSR in Media">
            Headlines featuring our work in newspapers, television, and other
            mass media.
          </HomeSectionIntro>

          <BksrInMedia
            items={homeMedia}
          />
        </Container>
      </Section>

      <Section tone="white" className="border-t border-border">
        <Container>
          <HomeSectionIntro title="Meet Our Team">
            Meet the inquisitive minds turning curiosity into insight, and
            insight into social transformation.
          </HomeSectionIntro>

          <div className="mt-10 flex flex-col items-center gap-5 sm:mt-14 sm:gap-10">
            {director ? (
              <Reveal className="w-full max-w-[15.5rem] sm:w-[calc((100%-1.5rem)/2)] sm:max-w-none lg:w-[calc((100%-4.5rem)/4)]">
                <TeamMemberCard
                  href={`/people/${director.slug}`}
                  name={director.name}
                  role={director.role}
                  imageSrc={directorPhoto}
                  description={teamFlipDescription(director)}
                />
              </Reveal>
            ) : null}

            {teamMembers.length ? (
              <ul className="grid w-full grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                {teamMembers.map((item) => (
                  <li key={item.href} className="min-w-0">
                    <TeamMemberCard
                      href={item.href}
                      name={item.name}
                      role={item.role}
                      imageSrc={item.image}
                      description={item.description}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="mt-10 flex justify-center sm:mt-12">
            <Button href="/people" variant="ink" size="lg">
              View full team
            </Button>
          </div>
        </Container>
      </Section>

      <ResearcherSay
        title="What our researchers say"
        items={researcherQuotes}
      />

      {/* Temporarily hidden — Talks & webinars */}
      {false && (
        <Section tone="white" className="border-t border-border">
          <Container>
            <HomeSectionIntro title="Talks & webinars">
              Documented webinars and public conversations from the BKSR
              archive.
            </HomeSectionIntro>
            <ul className="mt-12 grid gap-5 md:grid-cols-3">
              {eventItems.map((item, index) => (
                <li key={item.id}>
                  <Link
                    href={`/events/${item.slug}`}
                    className="group flex h-full flex-col border border-ink p-4 transition-colors hover:border-accent"
                  >
                    <h3 className="min-h-16 font-sans text-lg leading-snug text-ink transition-colors group-hover:text-accent sm:text-xl">
                      {item.title}
                    </h3>
                    <div className="mt-4 flex-1">
                      <ImageFrame
                        src={
                          item.featuredImageUrl?.startsWith('http') ||
                          item.featuredImageUrl?.startsWith('/')
                            ? item.featuredImageUrl
                            : (archiveVisuals[index] ??
                              prototypeMedia.activityWorkshop.url)
                        }
                        alt=""
                        aspect="video"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        frameClassName="border-0"
                        className="object-cover"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex justify-center">
              <Button href="/events" variant="ink" size="lg">
                View all talks
              </Button>
            </div>
          </Container>
        </Section>
      )}

      <Section
        tone="white"
        spaced={false}
        className="border-t border-border py-10 sm:py-12 md:py-14"
      >
        <Container>
          <HomeSectionIntro title="Opinions" />
          <div className="mt-8 sm:mt-10">
            <NoticesNewsCarousel
              slides={opinionSlides}
              fallbackImage={prototypeMedia.heroSeminar.url}
            />
          </div>
        </Container>
      </Section>

      <Section
        tone="white"
        className="relative isolate z-10 border-t border-border"
      >
        <Container>
          <HomeSectionIntro title="Collaboration & Partnerships">
            Building bridges with institutions, industry, and communities
            worldwide to advance research that matters.
          </HomeSectionIntro>
          <CollaborationOnRecord
            defaultActiveIndex={0}
            items={[
              {
                id: 'positive-sciences',
                shortLabel: 'Positive Sciences',
                title: 'Positive Sciences (France)',
                description:
                  'Cross-border collaboration advancing research for good, documented in the BKSR archive.',
                imageSrc: '/media/partners/positive-sciences.jpeg',
              },
              {
                id: 'cfep-sri-lanka',
                shortLabel: 'CFEP',
                title:
                  'Ceylon Foundation for Economic Policy Analysis (CFEP), Sri Lanka',
                description:
                  'International partnership supporting evidence-based economic policy analysis with BK School of Research.',
                imageSrc: '/media/partners/cfep.jpeg',
              },
              {
                id: 'forthcoming-cs',
                shortLabel: 'Open to partners',
                title: 'Open to new partnerships',
                description:
                  'BKSR remains open to new institutional partnerships that advance research for good.',
                imageSrc: prototypeMedia.collabComputerScience.url,
              },
            ]}
          />
          <div className="mt-8 flex justify-center sm:mt-10">
            <Button href="/contact" variant="ink" size="lg" withArrow>
              Contact us to collaborate
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}

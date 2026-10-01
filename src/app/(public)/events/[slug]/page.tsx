import { notFound } from 'next/navigation';
import { PageHero } from '@/components/layout/PageHero';
import {
  ArticleReading,
  EventAside,
} from '@/components/editorial/ArticleReading';
import { InvolvedPeople } from '@/components/editorial/InvolvedPeople';
import { RegistrationCTA } from '@/components/public/RegistrationCTA';
import {
  getEventBySlug,
  getEvents,
  getLinkedPeopleForEntity,
} from '@/lib/content/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { formatDate } from '@/lib/utils';
import { isProductionBuild } from '@/lib/cms/build-phase';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  if (isProductionBuild()) return [];
  return (await getEvents({ includeDrafts: true })).map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = await getEventBySlug(slug, { includeDrafts: true });
  if (!item) return {};
  return buildPageMetadata(item.title, item.summary, `/events/${item.slug}`);
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const item = await getEventBySlug(slug);
  if (!item) notFound();

  const when = formatDate(item.startAt, "d MMMM yyyy · h:mm a");
  const whenShort = formatDate(item.startAt, 'd MMM yyyy');

  return (
    <>
      <PageHero
        eyebrow={item.eventStatus === 'upcoming' ? 'Upcoming' : 'Past event'}
        title={item.title}
        description={item.summary}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'News and Events', href: '/news-events' },
          { label: 'Events', href: '/events' },
          { label: 'Details' },
        ]}
      />
      <ArticleReading
        body={item.description}
        imageUrl={item.featuredImageUrl}
        imageAlt={`Poster for ${item.title}`}
        imageAspect="video"
        meta={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <time
              dateTime={item.startAt}
              className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted"
            >
              <span className="sm:hidden">{whenShort}</span>
              <span className="hidden sm:inline">{when}</span>
            </time>
            {item.isOnline ? (
              <span className="inline-flex rounded-full border border-ink/12 px-2.5 py-0.5 font-sans text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink/65">
                Online webinar
              </span>
            ) : item.location ? (
              <span className="inline-flex rounded-full border border-ink/12 px-2.5 py-0.5 font-sans text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink/65">
                {item.location}
              </span>
            ) : null}
          </div>
        }
        aside={
          <div className="space-y-8">
            <EventAside
              when={when}
              where={item.location}
              isOnline={item.isOnline}
              speakers={item.speakers}
              status={item.eventStatus}
              registerHref={null}
              watchHref={item.recordingUrl}
            />
            <RegistrationCTA
              eventId={item.id}
              eventStatus={item.eventStatus}
              externalRegistrationUrl={item.registrationUrl}
            />
            <div className="border-t border-border pt-6">
              <InvolvedPeople
                entityType="event"
                entityId={item.id}
                initialPeople={await getLinkedPeopleForEntity('event', item.id)}
              />
            </div>
          </div>
        }
        legacyUrl={item.originalLegacyUrl}
        backHref="/events"
        backLabel="All events"
      />
    </>
  );
}

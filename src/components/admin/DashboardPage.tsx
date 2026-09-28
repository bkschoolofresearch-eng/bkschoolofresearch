'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Clock,
  FileEdit,
  FlaskConical,
  Home,
  Image,
  Megaphone,
  Newspaper,
  UserPlus,
  Users,
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';
import { AdminLoading } from './AdminLoading';
import { AdminPageHeader, AdminPanel } from './AdminUI';
import { StatusBadge } from './StatusBadge';
import { useCms } from './CmsProvider';

type IconType = typeof BookOpen;

function LibraryTile({
  label,
  value,
  href,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number;
  href: string;
  icon: IconType;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[8.5rem] flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_2px_rgba(11,31,54,0.04)] transition hover:border-[#0B1F36]/30 hover:shadow-[0_10px_28px_rgba(11,31,54,0.07)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-[#F4F7FB] text-[#0B1F36]">
          <Icon className="h-4 w-4" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-[#7A90A8] transition group-hover:text-[#0B1F36]" />
      </div>
      <div>
        <p className="font-[family-name:var(--font-admin-display)] text-[1.85rem] leading-none text-[#0B1F36]">
          {value}
        </p>
        <p className="mt-2 text-sm font-semibold text-[#0B1F36]">{label}</p>
        <p className="mt-0.5 text-xs text-[#7A90A8]">{hint}</p>
      </div>
    </Link>
  );
}

function AttentionLink({
  href,
  label,
  detail,
  icon: Icon,
}: {
  href: string;
  label: string;
  detail: string;
  icon: IconType;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-[#E8D7B0] bg-[#FFF8EC] px-4 py-3.5 transition hover:border-[#C4A15A]"
    >
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0B1F36] text-white">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#0B1F36]">{label}</span>
        <span className="block text-xs text-[#5B6B7C]">{detail}</span>
      </span>
      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-[#0B1F36]" />
    </Link>
  );
}

export function DashboardPage() {
  const { database, ready, mode, apiAuthenticated } = useCms();

  const metrics = useMemo(() => {
    if (!database) return null;

    const libraries = [
      ...database.publications,
      ...database.researchProjects,
      ...database.news,
      ...database.events,
      ...database.notices,
      ...database.people,
      ...database.activities,
      ...database.resources,
    ];
    const drafts = libraries.filter((item) => item.status === 'draft').length;
    const published = libraries.filter((item) => item.status === 'published').length;

    const pendingJoins = (database.joinApplications ?? []).filter(
      (item) => item.status === 'pending',
    ).length;
    const newRegistrations = (database.registrationEntries ?? []).filter(
      (item) => item.status === 'submitted',
    ).length;
    const upcomingEvents = database.events.filter(
      (event) =>
        event.eventStatus === 'upcoming' && event.status === 'published',
    ).length;

    const recentlyEdited = [
      ...database.publications.map((i) => ({
        id: i.id,
        title: i.title,
        href: `/admin/publications/${i.id}`,
        updatedAt: i.updatedAt,
        status: i.status,
        kind: 'Publication',
      })),
      ...database.researchProjects.map((i) => ({
        id: i.id,
        title: i.title,
        href: `/admin/research/${i.id}`,
        updatedAt: i.updatedAt,
        status: i.status,
        kind: 'Research',
      })),
      ...database.news.map((i) => ({
        id: i.id,
        title: i.title,
        href: `/admin/news/${i.id}`,
        updatedAt: i.updatedAt,
        status: i.status,
        kind: 'News',
      })),
      ...database.events.map((i) => ({
        id: i.id,
        title: i.title,
        href: `/admin/events/${i.id}`,
        updatedAt: i.updatedAt,
        status: i.status,
        kind: 'Event',
      })),
      ...database.people.map((i) => ({
        id: i.id,
        title: i.name,
        href: `/admin/people/${i.id}`,
        updatedAt: i.updatedAt,
        status: i.status,
        kind: 'Team',
      })),
      ...database.notices.map((i) => ({
        id: i.id,
        title: i.title,
        href: `/admin/notices/${i.id}`,
        updatedAt: i.updatedAt,
        status: i.status,
        kind: 'Notice',
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 7);

    return {
      published,
      drafts,
      pendingJoins,
      newRegistrations,
      upcomingEvents,
      research: database.researchProjects.length,
      publications: database.publications.length,
      people: database.people.filter((person) => person.status === 'published')
        .length,
      news: database.news.length,
      notices: database.notices.length,
      media: database.media.length,
      recentlyEdited,
    };
  }, [database]);

  if (!ready) {
    return <AdminLoading label="Loading overview" />;
  }

  if (!apiAuthenticated || !metrics) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="CMS"
          title="Overview"
          description="Unlock the content manager to see what is on the site."
        />
        <AdminPanel className="border-[#F0D4D4] bg-[#FFF8F8] p-6 text-sm text-[#8A3B3B]">
          CMS session is locked.{' '}
          <Link href="/admin/system" className="font-semibold underline">
            Unlock under System &amp; data
          </Link>
          .
        </AdminPanel>
      </div>
    );
  }

  const storeLabel = mode === 'mongo' ? 'Database' : 'Saved on this computer';
  const today = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const attention = [
    metrics.pendingJoins > 0
      ? {
          href: '/admin/join-applications',
          label: `${metrics.pendingJoins} join ${metrics.pendingJoins === 1 ? 'application' : 'applications'} waiting`,
          detail: 'Review people who applied to BKSR',
          icon: UserPlus,
        }
      : null,
    metrics.newRegistrations > 0
      ? {
          href: '/admin/registration-forms',
          label: `${metrics.newRegistrations} form ${metrics.newRegistrations === 1 ? 'submission' : 'submissions'} to review`,
          detail: 'Event and career registrations',
          icon: Calendar,
        }
      : null,
    metrics.drafts > 0
      ? {
          href: '/admin/news',
          label: `${metrics.drafts} draft ${metrics.drafts === 1 ? 'item is' : 'items are'} not on the site`,
          detail: 'Publish when the copy is ready',
          icon: FileEdit,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A90A8]">
            {today}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-admin-display)] text-[1.85rem] leading-tight text-[#0B1F36] sm:text-[2.15rem]">
            Overview
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5B6B7C]">
            {metrics.published} published items are live on the website.
            {metrics.drafts
              ? ` ${metrics.drafts} drafts stay here until you publish them.`
              : ' Nothing is sitting in draft.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#5B6B7C]">
            {storeLabel}
          </span>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5DEE8] bg-white px-3.5 py-2 text-sm font-semibold text-[#0B1F36] hover:bg-[#F4F7FB]"
          >
            View website
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/admin/homepage"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B1F36] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#173B6C]"
          >
            <Home className="h-3.5 w-3.5" />
            Homepage
          </Link>
        </div>
      </div>

      {attention.length ? (
        <section className="grid gap-3 lg:grid-cols-3">
          {attention.map((item) => (
            <AttentionLink key={item.href + item.label} {...item} />
          ))}
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#0B1F36]">On the website</h2>
          <p className="text-xs text-[#7A90A8]">
            {metrics.upcomingEvents} upcoming{' '}
            {metrics.upcomingEvents === 1 ? 'event' : 'events'}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <LibraryTile
            label="Research"
            value={metrics.research}
            href="/admin/research"
            icon={FlaskConical}
            hint="Ongoing and completed"
          />
          <LibraryTile
            label="Publications"
            value={metrics.publications}
            href="/admin/publications"
            icon={BookOpen}
            hint="Papers, briefs, reports"
          />
          <LibraryTile
            label="Team"
            value={metrics.people}
            href="/admin/people"
            icon={Users}
            hint="Published profiles"
          />
          <LibraryTile
            label="Events"
            value={metrics.upcomingEvents}
            href="/admin/events"
            icon={Calendar}
            hint="Upcoming and published"
          />
          <LibraryTile
            label="News"
            value={metrics.news}
            href="/admin/news"
            icon={Newspaper}
            hint="Articles and opinions"
          />
          <LibraryTile
            label="Notices"
            value={metrics.notices}
            href="/admin/notices"
            icon={Megaphone}
            hint="Announcements"
          />
          <LibraryTile
            label="Photos & files"
            value={metrics.media}
            href="/admin/media"
            icon={Image}
            hint="Media library"
          />
          <LibraryTile
            label="Drafts"
            value={metrics.drafts}
            href="/admin/news"
            icon={FileEdit}
            hint="Saved, not on the site"
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.85fr)]">
        <AdminPanel>
          <div className="flex items-center justify-between gap-3 border-b border-[#EEF2F6] px-5 py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#173B6C]" />
              <h2 className="text-sm font-semibold text-[#0B1F36]">
                Recently updated
              </h2>
            </div>
          </div>
          <ul className="divide-y divide-[#EEF2F6]">
            {metrics.recentlyEdited.length === 0 ? (
              <li className="px-5 py-10 text-sm text-[#5B6B7C]">
                No edits yet. Add research, a notice, or a team profile to start.
              </li>
            ) : (
              metrics.recentlyEdited.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#F8FAFC]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0B1F36]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#7A90A8]">{item.kind}</p>
                    </div>
                    <StatusBadge status={item.status} />
                    <span className="hidden w-24 shrink-0 text-right text-xs text-[#7A90A8] sm:block">
                      {formatDateShort(item.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </AdminPanel>

        <AdminPanel className="h-fit p-5">
          <h2 className="text-sm font-semibold text-[#0B1F36]">Start here</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#5B6B7C]">
            The usual publishing tasks.
          </p>
          <div className="mt-4 space-y-1.5">
            {[
              { href: '/admin/homepage', label: 'Homepage', icon: Home },
              { href: '/admin/research', label: 'Research', icon: FlaskConical },
              { href: '/admin/news/new', label: 'New article', icon: Newspaper },
              { href: '/admin/events/new', label: 'New event', icon: Calendar },
              { href: '/admin/people/new', label: 'Add a person', icon: Users },
              { href: '/admin/notices/new', label: 'New notice', icon: Megaphone },
              {
                href: '/admin/join-applications',
                label: 'Join applications',
                icon: UserPlus,
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-[#0B1F36] transition hover:bg-[#F4F7FB]"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#F4F7FB] text-[#0B1F36]">
                  <action.icon className="h-3.5 w-3.5" />
                </span>
                {action.label}
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-[#7A90A8]" />
              </Link>
            ))}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  FileEdit,
  FlaskConical,
  Home,
  Image,
  Megaphone,
  Newspaper,
  Users,
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';
import { AdminLoading } from './AdminLoading';
import {
  AdminPageHeader,
  AdminPanel,
  AdminPrimaryButton,
  AdminSecondaryButton,
} from './AdminUI';
import { StatusBadge } from './StatusBadge';
import { useCms } from './CmsProvider';

function MetricCard({
  label,
  value,
  href,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number;
  href: string;
  icon: typeof BookOpen;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_2px_rgba(11,31,54,0.04)] transition hover:border-[#0B1F36]/25 hover:shadow-[0_8px_24px_rgba(11,31,54,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A90A8]">
            {label}
          </p>
          <p className="mt-3 font-[family-name:var(--font-admin-display)] text-[2rem] leading-none text-[#0B1F36]">
            {value}
          </p>
          {hint ? (
            <p className="mt-2 text-xs text-[#5B6B7C]">{hint}</p>
          ) : null}
        </div>
        <span className="rounded-xl bg-[#0B1F36] p-2.5 text-white shadow-sm">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#173B6C] opacity-0 transition group-hover:opacity-100">
        Open
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

export function DashboardPage() {
  const { database, ready, mode, apiAuthenticated } = useCms();

  const metrics = useMemo(() => {
    if (!database) return null;
    const drafts = [
      ...database.publications,
      ...database.researchProjects,
      ...database.news,
      ...database.events,
      ...database.notices,
      ...database.people,
      ...database.pages,
      ...database.activities,
      ...database.resources,
    ].filter((item) => item.status === 'draft').length;

    const upcomingEvents = database.events.filter(
      (e) => e.eventStatus === 'upcoming' && e.status === 'published',
    ).length;

    const recentlyEdited = [
      ...database.publications.map((i) => ({
        id: i.id,
        title: i.title,
        href: `/admin/publications/${i.id}`,
        updatedAt: i.updatedAt,
        status: i.status,
        kind: 'Publication',
        publicPath: '/publications',
      })),
      ...database.researchProjects.map((i) => ({
        id: i.id,
        title: i.title,
        href: `/admin/research/${i.id}`,
        updatedAt: i.updatedAt,
        status: i.status,
        kind: 'Research',
        publicPath: '/research',
      })),
      ...database.news.map((i) => ({
        id: i.id,
        title: i.title,
        href: `/admin/news/${i.id}`,
        updatedAt: i.updatedAt,
        status: i.status,
        kind: 'News',
        publicPath: '/news',
      })),
      ...database.events.map((i) => ({
        id: i.id,
        title: i.title,
        href: `/admin/events/${i.id}`,
        updatedAt: i.updatedAt,
        status: i.status,
        kind: 'Event',
        publicPath: '/events',
      })),
      ...database.people.map((i) => ({
        id: i.id,
        title: i.name,
        href: `/admin/people/${i.id}`,
        updatedAt: i.updatedAt,
        status: i.status,
        kind: 'Team',
        publicPath: '/people',
      })),
      ...database.notices.map((i) => ({
        id: i.id,
        title: i.title,
        href: `/admin/notices/${i.id}`,
        updatedAt: i.updatedAt,
        status: i.status,
        kind: 'Notice',
        publicPath: '/notices',
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 8);

    return {
      research: database.researchProjects.length,
      publications: database.publications.length,
      people: database.people.length,
      upcomingEvents,
      drafts,
      notices: database.notices.length,
      news: database.news.length,
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
          description="Unlock the content manager to see counts and recent edits."
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

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="CMS"
        title="Overview"
        description={`Everything here is live site content (${mode === 'mongo' ? 'MongoDB' : 'server store'}). Counts are library items — not visitor traffic.`}
        action={
          <>
            <AdminSecondaryButton href="/admin/homepage">
              Homepage
            </AdminSecondaryButton>
            <AdminPrimaryButton href="/admin/news/new">
              New article
            </AdminPrimaryButton>
          </>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#0B1F36] p-6 text-white shadow-[0_12px_40px_rgba(11,31,54,0.18)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Content manager
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-admin-display)] text-2xl sm:text-3xl">
              Edit once — the public site updates
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Research, publications, news, events, notices, and the team
              directory all share this store with the frontend.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/homepage"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1F36]"
            >
              <Home className="h-4 w-4" />
              Edit homepage
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Open website
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Research"
          value={metrics.research}
          href="/admin/research"
          icon={FlaskConical}
          hint="/research"
        />
        <MetricCard
          label="Publications"
          value={metrics.publications}
          href="/admin/publications"
          icon={BookOpen}
          hint="/publications"
        />
        <MetricCard
          label="Team"
          value={metrics.people}
          href="/admin/people"
          icon={Users}
          hint="/people"
        />
        <MetricCard
          label="Upcoming events"
          value={metrics.upcomingEvents}
          href="/admin/events"
          icon={Calendar}
          hint="/events"
        />
        <MetricCard
          label="Drafts"
          value={metrics.drafts}
          href="/admin/news"
          icon={FileEdit}
          hint="Not live yet"
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Notices"
          value={metrics.notices}
          href="/admin/notices"
          icon={Megaphone}
          hint="/notices"
        />
        <MetricCard
          label="News"
          value={metrics.news}
          href="/admin/news"
          icon={Newspaper}
          hint="/news"
        />
        <MetricCard
          label="Media"
          value={metrics.media}
          href="/admin/media"
          icon={Image}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <AdminPanel>
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] px-5 py-4">
            <Clock className="h-4 w-4 text-[#173B6C]" />
            <h2 className="text-sm font-semibold text-[#0B1F36]">
              Recently updated
            </h2>
          </div>
          <ul className="divide-y divide-[#EEF2F6]">
            {metrics.recentlyEdited.length === 0 ? (
              <li className="px-5 py-8 text-sm text-[#5B6B7C]">
                No recent edits yet.
              </li>
            ) : (
              metrics.recentlyEdited.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 transition hover:bg-[#F4F7FB]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0B1F36]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#5B6B7C]">
                        {item.kind} · {item.publicPath}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} />
                      <span className="text-xs text-[#7A90A8]">
                        {formatDateShort(item.updatedAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </AdminPanel>

        <AdminPanel className="p-5">
          <h2 className="text-sm font-semibold text-[#0B1F36]">Quick actions</h2>
          <p className="mt-1 text-xs text-[#5B6B7C]">
            Common publishing tasks
          </p>
          <div className="mt-4 space-y-2">
            {[
              {
                href: '/admin/homepage',
                label: 'Homepage content',
                icon: Home,
              },
              {
                href: '/admin/news/new',
                label: 'Write a news article',
                icon: Newspaper,
              },
              {
                href: '/admin/events/new',
                label: 'Add an event',
                icon: Calendar,
              },
              {
                href: '/admin/people/new',
                label: 'Add a team member',
                icon: Users,
              },
              {
                href: '/admin/notices/new',
                label: 'Post a notice',
                icon: Megaphone,
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-3 text-sm font-medium text-[#0B1F36] transition hover:border-[#0B1F36]/20 hover:bg-white"
              >
                <span className="rounded-lg bg-[#0B1F36] p-1.5 text-white">
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

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { MediaImage } from '@/components/media/MediaImage';
import { Button } from '@/components/ui/Button';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { EditorialHeading } from '@/components/ui/EditorialHeading';
import { RichText } from '@/components/ui/RichText';
import { cn } from '@/lib/utils';
import {
  groupInvolvements,
  humanizeLinkRole,
  type ResolvedPersonInvolvement,
} from '@/lib/content/person-links';

export type PersonProfileResearchItem = {
  title: string;
  summary?: string;
  href?: string;
};

export type PersonRoleHistoryItem = {
  id: string;
  year: string;
  role: string;
};

export type PersonVerifiedAchievementItem = {
  id: string;
  title: string;
  description?: string;
  certificateCode?: string | null;
  assignedAt?: string;
};

export type PersonMemberAchievementItem = {
  id: string;
  title: string;
  description?: string;
  year?: string;
};

export type PersonProfileData = {
  name: string;
  role: string;
  categoryLabel?: string;
  affiliation?: string | null;
  photoUrl?: string | null;
  bio: string;
  shortBio?: string | null;
  skills?: string[];
  researchItems?: PersonProfileResearchItem[];
  involvements?: ResolvedPersonInvolvement[];
  roleHistory?: PersonRoleHistoryItem[];
  verifiedAchievements?: PersonVerifiedAchievementItem[];
  memberAchievements?: PersonMemberAchievementItem[];
  verificationCode?: string | null;
  appointmentYear?: string | null;
  backHref?: string;
  backLabel?: string;
};

type PersonProfileProps = {
  person: PersonProfileData;
  related?: Array<{
    href: string;
    name: string;
    role: string;
    imageSrc: string;
  }>;
  className?: string;
};

function ProfileCard({
  title,
  children,
  className,
  action,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-[1.75rem] border border-ink/12 bg-white shadow-[0_18px_40px_-34px_rgba(13,39,69,0.35)] sm:rounded-[2rem]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border/80 px-5 py-4 sm:px-7 sm:py-5">
        <h2 className="font-display text-[1.45rem] leading-tight text-ink sm:text-[1.7rem]">
          {title}
        </h2>
        {action}
      </div>
      <div className="px-5 py-5 sm:px-7 sm:py-6">{children}</div>
    </section>
  );
}

function clipSummary(text: string, max = 140) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, '').trim()}…`;
}

export function PersonProfile({ person, related, className }: PersonProfileProps) {
  const backHref = person.backHref ?? '/people';
  const skills = person.skills?.filter(Boolean) ?? [];
  const researchItems = person.researchItems?.filter((item) => item.title) ?? [];
  const involvementGroups = groupInvolvements(person.involvements ?? []);
  const roleHistory = person.roleHistory ?? [];
  const verifiedAchievements = person.verifiedAchievements ?? [];
  const memberAchievements = person.memberAchievements ?? [];
  const headline = person.shortBio?.trim();

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'People', href: '/people' },
    ...(person.categoryLabel && backHref !== '/people'
      ? [{ label: person.categoryLabel, href: backHref }]
      : []),
    { label: person.name },
  ];

  return (
    <div className={cn('min-h-screen bg-surface-subtle', className)}>
      <Container className="pb-16 pt-24 md:pb-24 md:pt-28">
        <Breadcrumb items={breadcrumbItems} className="mb-5 sm:mb-6" />

        {/* Hero identity card */}
        <article className="overflow-hidden rounded-[1.75rem] border border-ink/12 bg-white shadow-[0_22px_50px_-36px_rgba(13,39,69,0.45)] sm:rounded-[2.25rem]">
          <div className="relative h-40 overflow-hidden sm:h-52 md:h-60">
            <div
              className="absolute inset-0 bg-[linear-gradient(125deg,#0b233f_0%,#173b6c_48%,#2a5f96_100%)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_20%,rgba(255,255,255,0.16),transparent_42%)]"
              aria-hidden
            />
            <div
              className="absolute -bottom-16 left-1/2 h-40 w-[120%] -translate-x-1/2 rounded-[100%] bg-white/10 blur-2xl"
              aria-hidden
            />
          </div>

          <div className="relative px-5 pb-7 sm:px-8 sm:pb-9 lg:px-10">
            <div className="-mt-[4.75rem] flex flex-col items-center gap-5 sm:-mt-24 sm:flex-row sm:items-end sm:gap-8">
              <div className="w-[9.5rem] shrink-0 overflow-hidden rounded-[1.5rem] bg-ink p-1.5 ring-4 ring-white sm:w-[12rem] sm:rounded-[1.85rem] sm:p-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.15rem] bg-surface sm:rounded-[1.45rem]">
                  {person.photoUrl ? (
                    <MediaImage
                      src={person.photoUrl}
                      alt={`Portrait of ${person.name}`}
                      fill
                      priority
                      sizes="(max-width: 640px) 152px, 192px"
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-end bg-[radial-gradient(circle_at_30%_20%,rgba(23,59,108,0.12),transparent_55%)] p-4">
                      <span className="font-display text-4xl text-ink/25">
                        {person.name
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase() ?? '')
                          .join('') || 'BK'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1 pb-1 text-center sm:text-left">
                {person.categoryLabel ? (
                  <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">
                    {person.categoryLabel}
                  </p>
                ) : null}
                <EditorialHeading
                  as="h1"
                  size="md"
                  className="mt-1.5 text-balance sm:text-[2.45rem]"
                >
                  {person.name}
                </EditorialHeading>
                <p className="mt-2 font-sans text-base font-medium text-ink sm:text-lg">
                  {person.role}
                </p>
                {person.affiliation ? (
                  <p className="mt-1 text-sm leading-snug text-muted sm:text-[0.95rem]">
                    {person.affiliation}
                  </p>
                ) : null}
              </div>

              <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row sm:pb-1">
                <Button href="/contact" variant="ink" size="md" className="justify-center sm:min-w-[8.5rem]">
                  Contact
                </Button>
                <Button
                  href="/people"
                  variant="secondary"
                  size="md"
                  className="justify-center sm:min-w-[8.5rem]"
                >
                  Full team
                </Button>
              </div>
            </div>

            {headline ? (
              <p className="mx-auto mt-6 max-w-3xl border-t border-border/80 pt-5 text-center font-sans text-[0.95rem] leading-relaxed text-body sm:mx-0 sm:mt-7 sm:pt-6 sm:text-left sm:text-base sm:leading-7">
                {headline}
              </p>
            ) : null}
          </div>
        </article>

        <div className="mt-5 grid items-start gap-5 lg:mt-6 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-5 lg:col-span-8">
            <ProfileCard title="Bio">
              <RichText
                content={person.bio}
                className="max-w-none text-[1rem] leading-[1.75] md:text-[1.0625rem] md:leading-[1.8]"
              />
            </ProfileCard>

            {involvementGroups.map((group) => (
              <ProfileCard
                key={group.type}
                title={group.label}
                action={
                  <span className="font-sans text-xs text-muted">
                    {group.items.length}{' '}
                    {group.items.length === 1 ? 'item' : 'items'}
                  </span>
                }
              >
                <ul className="space-y-3">
                  {group.items.map((item) => {
                    const inner = (
                      <>
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-[0.95rem] bg-ink text-paper">
                          <BookOpen className="size-4" strokeWidth={1.75} aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                            {humanizeLinkRole(item.role)}
                          </p>
                          <p className="mt-0.5 font-sans text-[0.95rem] font-semibold leading-snug text-ink sm:text-base">
                            {item.title}
                          </p>
                          {item.summary ? (
                            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                              {clipSummary(item.summary, 160)}
                            </p>
                          ) : null}
                        </div>
                        {item.href ? (
                          <ArrowRight
                            className="mt-1 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                            aria-hidden
                          />
                        ) : null}
                      </>
                    );

                    return (
                      <li key={item.linkId}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="group flex items-start gap-3.5 rounded-[1.25rem] border border-border/90 bg-surface-subtle/70 p-3.5 transition-[border-color,background-color,box-shadow] hover:border-ink/20 hover:bg-white hover:shadow-[0_14px_30px_-24px_rgba(13,39,69,0.4)] sm:gap-4 sm:p-4"
                          >
                            {inner}
                          </Link>
                        ) : (
                          <div className="flex items-start gap-3.5 rounded-[1.25rem] border border-border/90 bg-surface-subtle/70 p-3.5 sm:gap-4 sm:p-4">
                            {inner}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </ProfileCard>
            ))}

            {roleHistory.length ? (
              <ProfileCard title="Role history">
                <ol className="space-y-3">
                  {roleHistory.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-start justify-between gap-4 rounded-[1.15rem] border border-border/90 bg-surface-subtle/70 px-4 py-3"
                    >
                      <div>
                        <p className="font-sans text-[0.95rem] font-semibold text-ink">
                          {row.role}
                        </p>
                        <p className="mt-0.5 text-sm text-muted">{row.year}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </ProfileCard>
            ) : null}

            {verifiedAchievements.length || memberAchievements.length ? (
              <ProfileCard title="Achievements">
                <div className="space-y-5">
                  {verifiedAchievements.length ? (
                    <div>
                      <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                        Verified by BKSR
                      </p>
                      <ul className="mt-3 space-y-3">
                        {verifiedAchievements.map((item) => (
                          <li
                            key={item.id}
                            className="rounded-[1.15rem] border border-border/90 bg-surface-subtle/70 px-4 py-3"
                          >
                            <p className="font-sans text-[0.95rem] font-semibold text-ink">
                              {item.title}
                            </p>
                            {item.description ? (
                              <p className="mt-1 text-sm leading-relaxed text-muted">
                                {item.description}
                              </p>
                            ) : null}
                            {item.certificateCode ? (
                              <Link
                                href={`/verify/${encodeURIComponent(item.certificateCode)}`}
                                className="mt-2 inline-block font-mono text-xs text-accent hover:underline"
                              >
                                {item.certificateCode}
                              </Link>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {memberAchievements.length ? (
                    <div>
                      <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                        Member-added
                      </p>
                      <ul className="mt-3 space-y-3">
                        {memberAchievements.map((item) => (
                          <li
                            key={item.id}
                            className="rounded-[1.15rem] border border-border/90 bg-surface-subtle/70 px-4 py-3"
                          >
                            <p className="font-sans text-[0.95rem] font-semibold text-ink">
                              {item.title}
                              {item.year ? (
                                <span className="ml-2 text-sm font-normal text-muted">
                                  ({item.year})
                                </span>
                              ) : null}
                            </p>
                            {item.description ? (
                              <p className="mt-1 text-sm leading-relaxed text-muted">
                                {item.description}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </ProfileCard>
            ) : null}

            {!involvementGroups.length && researchItems.length ? (
              <ProfileCard
                title="Research"
                action={
                  <span className="font-sans text-xs text-muted">
                    {researchItems.length}{' '}
                    {researchItems.length === 1 ? 'item' : 'items'}
                  </span>
                }
              >
                <ul className="space-y-3">
                  {researchItems.map((item) => {
                    const inner = (
                      <>
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-[0.95rem] bg-ink text-paper">
                          <BookOpen className="size-4" strokeWidth={1.75} aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-sans text-[0.95rem] font-semibold leading-snug text-ink sm:text-base">
                            {item.title}
                          </p>
                          {item.summary ? (
                            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                              {clipSummary(item.summary, 160)}
                            </p>
                          ) : null}
                        </div>
                        {item.href ? (
                          <ArrowRight
                            className="mt-1 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                            aria-hidden
                          />
                        ) : null}
                      </>
                    );

                    return (
                      <li key={`${item.title}-${item.href ?? 'local'}`}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="group flex items-start gap-3.5 rounded-[1.25rem] border border-border/90 bg-surface-subtle/70 p-3.5 transition-[border-color,background-color,box-shadow] hover:border-ink/20 hover:bg-white hover:shadow-[0_14px_30px_-24px_rgba(13,39,69,0.4)] sm:gap-4 sm:p-4"
                          >
                            {inner}
                          </Link>
                        ) : (
                          <div className="flex items-start gap-3.5 rounded-[1.25rem] border border-border/90 bg-surface-subtle/70 p-3.5 sm:gap-4 sm:p-4">
                            {inner}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </ProfileCard>
            ) : null}
          </div>

          <aside className="flex flex-col gap-5 lg:col-span-4 lg:sticky lg:top-28">
            {skills.length ? (
              <ProfileCard title="Skills">
                <ul className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <li key={skill}>
                      <span className="inline-flex rounded-[1rem] border border-ink/15 bg-surface-subtle px-3 py-2 font-sans text-[0.8125rem] text-ink transition-colors hover:border-ink/30 hover:bg-white">
                        {skill}
                      </span>
                    </li>
                  ))}
                </ul>
              </ProfileCard>
            ) : null}

            <ProfileCard title="At BKSR">
              <dl className="divide-y divide-border/80 font-sans">
                <div className="flex flex-col gap-1 pb-4">
                  <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    Role
                  </dt>
                  <dd className="text-[0.95rem] leading-snug text-ink">{person.role}</dd>
                </div>
                {person.appointmentYear ? (
                  <div className="flex flex-col gap-1 py-4">
                    <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                      Appointment year
                    </dt>
                    <dd className="text-[0.95rem] leading-snug text-ink">
                      {person.appointmentYear}
                    </dd>
                  </div>
                ) : null}
                {person.categoryLabel ? (
                  <div className="flex flex-col gap-1 py-4">
                    <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                      Team
                    </dt>
                    <dd className="text-[0.95rem] leading-snug text-ink">
                      {person.categoryLabel}
                    </dd>
                  </div>
                ) : null}
                {person.affiliation ? (
                  <div className="flex flex-col gap-1 py-4">
                    <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                      Affiliation
                    </dt>
                    <dd className="text-[0.95rem] leading-relaxed text-ink">
                      {person.affiliation}
                    </dd>
                  </div>
                ) : null}
                {person.verificationCode ? (
                  <div className="flex flex-col gap-1 pt-4">
                    <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                      Verification code
                    </dt>
                    <dd>
                      <Link
                        href={`/verify/${encodeURIComponent(person.verificationCode)}`}
                        className="font-mono text-[0.95rem] text-accent hover:underline"
                      >
                        {person.verificationCode}
                      </Link>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </ProfileCard>

            {related?.length ? (
              <ProfileCard title="People also view">
                <ul className="space-y-1">
                  {related.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group flex gap-3 rounded-[1.15rem] p-2 transition-colors hover:bg-surface-subtle"
                      >
                        <div className="relative size-[3.25rem] shrink-0 overflow-hidden rounded-[0.95rem] bg-ink p-[3px]">
                          <div className="relative size-full overflow-hidden rounded-[0.75rem] bg-surface">
                            <Image
                              src={item.imageSrc}
                              alt=""
                              fill
                              sizes="52px"
                              className="object-cover object-top"
                            />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 self-center">
                          <p className="truncate font-sans text-sm font-medium text-ink transition-colors group-hover:text-accent">
                            {item.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted">
                            {item.role}
                          </p>
                        </div>
                        <ArrowRight
                          className="size-3.5 shrink-0 self-center text-muted opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-border/80 pt-4">
                  <Link
                    href="/people"
                    className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-ink transition-colors hover:text-accent"
                  >
                    View full team
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
              </ProfileCard>
            ) : null}
          </aside>
        </div>
      </Container>
    </div>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AdminPageHeader } from './AdminUI';
import { InvolvementsAdminPage } from './InvolvementsAdminPage';
import { PeopleAdminPage } from './PeopleAdminPage';
import { RoleHistoryAdminPage } from './RoleHistoryAdminPage';
import { TeamSectionsAdminPage } from './TeamSectionsAdminPage';

const TABS = [
  {
    id: 'people',
    label: 'People',
    description:
      'The roster. Add someone, send the invite later, or remove a person from the team.',
  },
  {
    id: 'sections',
    label: 'Sections',
    description:
      'The four researcher sections: Distinguished Research Fellow, Senior Research Associate, Research Associate, and Research Assistant.',
  },
  {
    id: 'years',
    label: 'Years',
    description:
      'The same person on a later committee. Add them to another year, or edit the position.',
  },
  {
    id: 'work',
    label: 'Work',
    description:
      'Which research, event, or publication a person worked on.',
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

function tabFromQuery(value: string | null): TabId {
  return TABS.some((tab) => tab.id === value) ? (value as TabId) : 'people';
}

export function TeamAdminPage() {
  const router = useRouter();
  const params = useSearchParams();
  const tab = tabFromQuery(params.get('tab'));
  const current = TABS.find((item) => item.id === tab) ?? TABS[0];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Team"
        title="Team & people"
        description={current.description}
      />
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => {
          const selected = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                router.replace(
                  item.id === 'people' ? '/admin/people' : `/admin/people?tab=${item.id}`,
                )
              }
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                selected
                  ? 'bg-[#0B1F36] text-white'
                  : 'bg-white text-[#0B1F36] ring-1 ring-[#D5DEE8] hover:bg-[#F4F7FB]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {tab === 'people' ? <PeopleAdminPage embedded /> : null}
      {tab === 'sections' ? <TeamSectionsAdminPage embedded /> : null}
      {tab === 'years' ? <RoleHistoryAdminPage embedded /> : null}
      {tab === 'work' ? <InvolvementsAdminPage embedded /> : null}
    </div>
  );
}

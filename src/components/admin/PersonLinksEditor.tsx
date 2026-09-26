'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { Person, PersonLinkEntityType } from '@/types/content';
import {
  PERSON_LINK_ROLE_OPTIONS,
  humanizeLinkRole,
} from '@/lib/content/person-links';

export type PersonLinkDraft = {
  personId: string;
  role: string;
};

export function PersonLinksEditor({
  entityType,
  people,
  value,
  onChange,
  plain = false,
}: {
  entityType: PersonLinkEntityType;
  people: Person[];
  value: PersonLinkDraft[];
  onChange: (next: PersonLinkDraft[]) => void;
  /** Drop outer card chrome when parent already provides a section. */
  plain?: boolean;
}) {
  const roles = PERSON_LINK_ROLE_OPTIONS[entityType];
  const used = new Set(value.map((row) => row.personId));

  const addEmpty = () => {
    const nextPerson = people.find((p) => !used.has(p.id));
    if (!nextPerson) return;
    onChange([
      ...value,
      { personId: nextPerson.id, role: roles[0]?.value ?? 'contributor' },
    ]);
  };

  return (
    <div
      className={
        plain
          ? 'space-y-3'
          : 'sm:col-span-2 space-y-3 rounded-lg border border-[#D9DEE5] bg-white p-3'
      }
    >
      <div className="flex items-center justify-between gap-3">
        {plain ? (
          <span className="text-xs text-[#5F6368]">
            {value.length === 0 ? 'None linked yet' : `${value.length} linked`}
          </span>
        ) : (
          <div>
            <p className="text-sm font-medium text-[#0D2745]">People involved</p>
            <p className="mt-0.5 text-xs text-[#68727D]">
              Roster members linked here appear on this page and on their
              profiles. External names can stay in speakers / authors text
              fields.
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={addEmpty}
          disabled={used.size >= people.length}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#D9DEE5] px-2.5 py-1.5 text-xs font-medium text-[#173B6C] hover:bg-[#EAF0F6] disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Add person
        </button>
      </div>

      {value.length === 0 ? (
        plain ? null : (
          <p className="text-xs text-[#9AA3A5]">No roster people linked yet.</p>
        )
      ) : (
        <ul className="space-y-2">
          {value.map((row, index) => (
            <li key={`${row.personId}-${index}`} className="flex gap-2">
              <select
                value={row.personId}
                onChange={(e) => {
                  const next = [...value];
                  next[index] = { ...row, personId: e.target.value };
                  onChange(next);
                }}
                className="min-w-0 flex-1 rounded-lg border border-[#D9DEE5] bg-white px-2 py-1.5 text-sm"
              >
                {people.map((person) => (
                  <option
                    key={person.id}
                    value={person.id}
                    disabled={used.has(person.id) && person.id !== row.personId}
                  >
                    {person.name}
                  </option>
                ))}
              </select>
              <select
                value={row.role}
                onChange={(e) => {
                  const next = [...value];
                  next[index] = { ...row, role: e.target.value };
                  onChange(next);
                }}
                className="w-36 rounded-lg border border-[#D9DEE5] bg-white px-2 py-1.5 text-sm"
              >
                {roles.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
                {!roles.some((opt) => opt.value === row.role) && row.role ? (
                  <option value={row.role}>{humanizeLinkRole(row.role)}</option>
                ) : null}
              </select>
              <button
                type="button"
                title="Remove"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="rounded-md p-1.5 text-[#68727D] hover:bg-[#FBF0F0] hover:text-[#8A3B3B]"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

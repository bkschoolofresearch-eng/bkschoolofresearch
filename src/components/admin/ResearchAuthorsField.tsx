'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, UserRound, X } from 'lucide-react';
import type { Person } from '@/types/content';

export type ResearchAuthorEntry =
  | {
      key: string;
      kind: 'person';
      personId: string;
      name: string;
      role: string;
    }
  | {
      key: string;
      kind: 'text';
      name: string;
    };

function newKey() {
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function namesMatch(a: string, b: string) {
  return normalizeName(a) === normalizeName(b);
}

export function hydrateResearchAuthors(
  names: string[],
  links: Array<{ personId: string; role: string; order?: number }>,
  people: Person[],
): ResearchAuthorEntry[] {
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const unused = [...links].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  );
  const rows: ResearchAuthorEntry[] = [];

  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const linkIndex = unused.findIndex((link) => {
      const person = peopleById.get(link.personId);
      return person ? namesMatch(person.name, name) : false;
    });
    if (linkIndex >= 0) {
      const link = unused.splice(linkIndex, 1)[0]!;
      const person = peopleById.get(link.personId);
      rows.push({
        key: newKey(),
        kind: 'person',
        personId: link.personId,
        name: person?.name ?? name,
        role: link.role || 'author',
      });
    } else {
      rows.push({ key: newKey(), kind: 'text', name });
    }
  }

  for (const link of unused) {
    const person = peopleById.get(link.personId);
    rows.push({
      key: newKey(),
      kind: 'person',
      personId: link.personId,
      name: person?.name ?? 'Linked person',
      role: link.role || 'author',
    });
  }

  return rows;
}

export function authorsToLeadNames(authors: ResearchAuthorEntry[]): string[] {
  return authors.map((row) => row.name.trim()).filter(Boolean);
}

export function authorsToPersonLinks(
  authors: ResearchAuthorEntry[],
): Array<{ personId: string; role: string }> {
  return authors
    .filter(
      (row): row is Extract<ResearchAuthorEntry, { kind: 'person' }> =>
        row.kind === 'person',
    )
    .map((row) => ({
      personId: row.personId,
      role: row.role.trim() || 'author',
    }));
}

const ROLE_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'author', label: 'Author' },
  { value: 'contributor', label: 'Contributor' },
];

export function ResearchAuthorsField({
  people,
  value,
  onChange,
  peopleLoading,
}: {
  people: Person[];
  value: ResearchAuthorEntry[];
  onChange: (next: ResearchAuthorEntry[]) => void;
  peopleLoading?: boolean;
}) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const usedPersonIds = useMemo(
    () => new Set(value.filter((r) => r.kind === 'person').map((r) => r.personId)),
    [value],
  );

  const matches = useMemo(() => {
    const q = normalizeName(query);
    if (!q) return [];
    return people
      .filter((p) => p.status !== 'archived')
      .filter((p) => !usedPersonIds.has(p.id))
      .filter((p) => normalizeName(p.name).includes(q))
      .slice(0, 8);
  }, [people, query, usedPersonIds]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const addPerson = (person: Person) => {
    onChange([
      ...value,
      {
        key: newKey(),
        kind: 'person',
        personId: person.id,
        name: person.name,
        role: 'author',
      },
    ]);
    setQuery('');
    setOpen(false);
  };

  const addText = (raw: string) => {
    const name = raw.trim();
    if (!name) return;
    const already = value.some((row) => namesMatch(row.name, name));
    if (already) {
      setQuery('');
      setOpen(false);
      return;
    }
    const exact = people.find(
      (p) =>
        p.status !== 'archived' &&
        !usedPersonIds.has(p.id) &&
        namesMatch(p.name, name),
    );
    if (exact) {
      addPerson(exact);
      return;
    }
    onChange([...value, { key: newKey(), kind: 'text', name }]);
    setQuery('');
    setOpen(false);
  };

  const move = (index: number, dir: -1 | 1) => {
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= value.length) return;
    const next = [...value];
    const [row] = next.splice(index, 1);
    next.splice(nextIndex, 0, row!);
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const setRole = (index: number, role: string) => {
    onChange(
      value.map((row, i) =>
        i === index && row.kind === 'person' ? { ...row, role } : row,
      ),
    );
  };

  return (
    <div className="space-y-3" ref={wrapRef}>
      {value.length > 0 ? (
        <ol className="space-y-2" aria-label="Author order">
          {value.map((row, index) => (
            <li
              key={row.key}
              className="flex items-center gap-2 rounded-lg border border-[#DADCE0] bg-[#F8F9FA] px-2 py-1.5"
            >
              <span className="w-5 shrink-0 text-center text-xs font-semibold text-[#5F6368]">
                {index + 1}
              </span>
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded p-0.5 text-[#5F6368] hover:bg-white disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded p-0.5 text-[#5F6368] hover:bg-white disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#202124]">
                  {row.name}
                </p>
                {row.kind === 'person' ? (
                  <p className="flex items-center gap-1 text-[11px] text-[#174EA6]">
                    <UserRound className="h-3 w-3" />
                    On roster · shows on their profile
                  </p>
                ) : (
                  <p className="text-[11px] text-[#5F6368]">Typed name only</p>
                )}
              </div>
              {row.kind === 'person' ? (
                <select
                  value={row.role}
                  onChange={(e) => setRole(index, e.target.value)}
                  className="max-w-[7.5rem] rounded-md border border-[#DADCE0] bg-white px-1.5 py-1 text-xs text-[#202124]"
                  aria-label={`Role for ${row.name}`}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                  {!ROLE_OPTIONS.some((o) => o.value === row.role) && row.role ? (
                    <option value={row.role}>{row.role}</option>
                  ) : null}
                </select>
              ) : null}
              <button
                type="button"
                aria-label={`Remove ${row.name}`}
                onClick={() => removeAt(index)}
                className="rounded-md p-1.5 text-[#5F6368] hover:bg-white hover:text-[#D93025]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && matches.length) {
              e.preventDefault();
              setOpen(true);
              setActiveIndex((i) => Math.min(i + 1, matches.length - 1));
              return;
            }
            if (e.key === 'ArrowUp' && matches.length) {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
              return;
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              if (open && matches[activeIndex]) {
                addPerson(matches[activeIndex]!);
                return;
              }
              addText(query);
              return;
            }
            if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder={
            peopleLoading
              ? 'Loading people…'
              : 'Type a name — pick from roster or press Enter'
          }
          disabled={peopleLoading}
          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[15px] text-[#0B1F36] outline-none placeholder:text-[#9AA8B8] focus:border-[#0B1F36] focus:bg-white focus:ring-2 focus:ring-[#0B1F36]/10 disabled:opacity-60"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open && (matches.length > 0 || query.trim().length > 0)}
        />

        {open && query.trim() ? (
          <div
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-[#DADCE0] bg-white shadow-lg"
          >
            {matches.length > 0 ? (
              <ul className="max-h-56 overflow-y-auto py-1">
                {matches.map((person, i) => (
                  <li key={person.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === activeIndex}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => addPerson(person)}
                      className={
                        i === activeIndex
                          ? 'flex w-full items-start gap-2 bg-[#E8F0FE] px-3 py-2 text-left'
                          : 'flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-[#F8F9FA]'
                      }
                    >
                      <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#174EA6]" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[#202124]">
                          {person.name}
                        </span>
                        {person.role ? (
                          <span className="block truncate text-xs text-[#5F6368]">
                            {person.role}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              onClick={() => addText(query)}
              className="flex w-full items-center gap-2 border-t border-[#DADCE0] px-3 py-2.5 text-left text-sm text-[#202124] hover:bg-[#F8F9FA]"
            >
              Add “{query.trim()}” as typed name
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

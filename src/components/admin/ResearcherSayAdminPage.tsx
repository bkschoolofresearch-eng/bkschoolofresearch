'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { CloudinaryImageField } from '@/components/media/CloudinaryImageField';
import type { HomepageQuote } from '@/lib/content/homepage-live';
import { AdminLoading } from './AdminLoading';
import {
  AdminLockedState,
  AdminPageHeader,
  AdminPanel,
  AdminPrimaryButton,
} from './AdminUI';
import { ConfirmDialog } from './ConfirmDialog';
import { useSaveConfirm } from './SaveAlert';
import { useCms } from './CmsProvider';

const fieldClass =
  'w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[15px] text-[#0B1F36] outline-none placeholder:text-[#7A90A8] focus:border-[#0B1F36] focus:bg-white focus:ring-2 focus:ring-[#0B1F36]/10';

const emptyQuote = (): HomepageQuote => ({
  name: '',
  role: '',
  imageSrc: '',
  quote: '',
});

export function ResearcherSayAdminPage() {
  const { database, ready, apiAuthenticated, saveHomepage } = useCms();
  const { askSave, saveDialog } = useSaveConfirm();
  const [quotes, setQuotes] = useState<HomepageQuote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  const people = useMemo(
    () =>
      [...(database?.people ?? [])]
        .filter((person) => person.status === 'published')
        .sort((a, b) => a.name.localeCompare(b.name)),
    [database],
  );

  useEffect(() => {
    if (!database || loaded) return;
    setQuotes((database.homepage.researcherQuotes ?? []).map((quote) => ({ ...quote })));
    setLoaded(true);
  }, [database, loaded]);

  if (!ready) return <AdminLoading label="Loading statements" />;
  if (!apiAuthenticated || !database) {
    return <AdminLockedState noun="researcher statements" />;
  }
  if (!loaded) return <AdminLoading label="Loading statements" />;

  const save = async () => {
    const clean = quotes
      .map((quote) => ({
        name: quote.name.trim(),
        role: quote.role.trim(),
        imageSrc: quote.imageSrc.trim(),
        quote: quote.quote.trim(),
      }))
      .filter((quote) => quote.quote && quote.name);
    if (clean.length !== quotes.length) {
      setMessage('Each statement needs a name and the words they said.');
      return;
    }
    if (!(await askSave())) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveHomepage({ researcherQuotes: clean });
      setQuotes(clean);
      setMessage(
        clean.length
          ? 'Saved. These statements are on the homepage.'
          : 'Saved. The homepage section stays hidden until a statement is added.',
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Homepage"
        title="What our researchers say"
        description="Statements for that homepage section. It stays off the site until at least one is saved."
        action={
          <AdminPrimaryButton onClick={() => void save()} disabled={saving}>
            {saving ? 'Saving…' : 'Save statements'}
          </AdminPrimaryButton>
        }
      />
      {message ? (
        <p className="text-sm font-semibold text-[#173B6C]">{message}</p>
      ) : null}

      {quotes.length ? (
        <div className="space-y-4">
          {quotes.map((quote, index) => (
            <AdminPanel key={index} className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#0B1F36]">
                  Statement {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => setRemoveIndex(index)}
                  className="text-sm font-semibold text-[#8A3B3B]"
                >
                  Remove
                </button>
              </div>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-[#0B1F36]">
                  Fill from the team
                </span>
                <select
                  value=""
                  onChange={(event) => {
                    const person = people.find((item) => item.id === event.target.value);
                    if (!person) return;
                    setQuotes((rows) =>
                      rows.map((row, rowIndex) =>
                        rowIndex === index
                          ? {
                              ...row,
                              name: person.name,
                              role: person.role,
                              imageSrc: person.photoUrl || row.imageSrc,
                            }
                          : row,
                      ),
                    );
                  }}
                  className={fieldClass}
                >
                  <option value="">Choose a person, or type the name below</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#0B1F36]">Name</span>
                  <input
                    value={quote.name}
                    onChange={(event) =>
                      setQuotes((rows) =>
                        rows.map((row, rowIndex) =>
                          rowIndex === index
                            ? { ...row, name: event.target.value }
                            : row,
                        ),
                      )
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#0B1F36]">Position</span>
                  <input
                    value={quote.role}
                    onChange={(event) =>
                      setQuotes((rows) =>
                        rows.map((row, rowIndex) =>
                          rowIndex === index
                            ? { ...row, role: event.target.value }
                            : row,
                        ),
                      )
                    }
                    className={fieldClass}
                  />
                </label>
              </div>
              <CloudinaryImageField
                label="Photo"
                value={quote.imageSrc}
                previewAspect="portrait"
                help="Portrait used beside the statement."
                onChange={(url) =>
                  setQuotes((rows) =>
                    rows.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, imageSrc: url } : row,
                    ),
                  )
                }
              />
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-[#0B1F36]">
                  What they say
                </span>
                <textarea
                  value={quote.quote}
                  rows={4}
                  onChange={(event) =>
                    setQuotes((rows) =>
                      rows.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, quote: event.target.value }
                          : row,
                      ),
                    )
                  }
                  className={fieldClass}
                />
              </label>
            </AdminPanel>
          ))}
        </div>
      ) : (
        <AdminPanel className="p-6 text-sm text-[#5B6B7C]">
          No statements yet. Add one, then save.
        </AdminPanel>
      )}

      <button
        type="button"
        onClick={() => setQuotes((rows) => [...rows, emptyQuote()])}
        className="inline-flex items-center gap-2 rounded-full bg-[#0B1F36] px-4 py-2.5 text-sm font-semibold text-white"
      >
        <Plus className="h-4 w-4" />
        Add statement
      </button>

      {saveDialog}
      <ConfirmDialog
        open={removeIndex !== null}
        title="Remove this statement?"
        description="It leaves the homepage after you save."
        confirmLabel="Remove"
        onCancel={() => setRemoveIndex(null)}
        onConfirm={() => {
          if (removeIndex === null) return;
          setQuotes((rows) => rows.filter((_, index) => index !== removeIndex));
          setRemoveIndex(null);
        }}
      />
    </div>
  );
}

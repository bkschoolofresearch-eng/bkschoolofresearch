'use client';

import { useEffect, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import {
  AdminPageHeader,
  AdminPanel,
  AdminSecondaryButton,
} from './AdminUI';
import { useCms } from './CmsProvider';
import { cmsApi } from '@/lib/cms/client-api';

export function SystemPage() {
  const {
    resetDemoData,
    ready,
    database,
    mode,
    apiAuthenticated,
    logoutCms,
    refresh,
  } = useCms();
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [health, setHealth] = useState<{
    driver?: string;
    mode?: string;
    cloudinaryConfigured?: boolean;
    resendConfigured?: boolean;
    mongoConfigured?: boolean;
  } | null>(null);

  useEffect(() => {
    void cmsApi.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  if (!ready) {
    return <p className="text-sm text-[#5B6B7C]">Loading…</p>;
  }

  const storageLabel =
    mode === 'mongo'
      ? 'MongoDB (live database)'
      : 'Local server file (.data/cms-database.json)';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="System & data"
        description="Where website content is stored. Admin edits go through the CMS API so the public site and the dashboard stay in sync."
      />

      <AdminPanel className="max-w-2xl p-5">
        <h2 className="text-sm font-semibold text-[#0B1F36]">Storage status</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          {[
            ['Driver', health?.driver ?? mode],
            ['Content store', storageLabel],
            ['Content version', database?.version ?? '—'],
            ['Admin session', apiAuthenticated ? 'Logged in' : 'Logged out'],
            [
              'Image storage (Cloudinary)',
              health?.cloudinaryConfigured
                ? 'Configured'
                : 'Not configured (URL paste still works)',
            ],
            [
              'Email (Resend)',
              health?.resendConfigured
                ? 'Configured'
                : 'Not configured (invite links shown in admin)',
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-4 border-b border-[#EEF2F6] pb-3 last:border-0 last:pb-0"
            >
              <dt className="text-[#5B6B7C]">{label}</dt>
              <dd className="text-right font-medium text-[#0B1F36]">{value}</dd>
            </div>
          ))}
        </dl>
        {apiAuthenticated ? (
          <div className="mt-4">
            <AdminSecondaryButton
              onClick={() => {
                void logoutCms();
              }}
            >
              Log out
            </AdminSecondaryButton>
          </div>
        ) : null}
      </AdminPanel>

      <AdminPanel className="max-w-2xl space-y-3 border-[#F0D4D4] p-5">
        <h2 className="text-sm font-semibold text-[#8A3B3B]">
          Reset to starter library
        </h2>
        <p className="text-sm text-[#5B6B7C]">
          Replaces the CMS store with the compiled starter content. Use on
          staging or when you want a clean slate. Does not delete files already
          on Cloudinary.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="rounded-xl border border-[#F0D4D4] bg-white px-4 py-2.5 text-sm font-semibold text-[#8A3B3B] hover:bg-[#FFF8F8]"
          >
            Reset to starter library
          </button>
          <AdminSecondaryButton onClick={() => void refresh()}>
            Refresh from store
          </AdminSecondaryButton>
        </div>
        {message ? (
          <p className="text-sm font-semibold text-[#173B6C]">{message}</p>
        ) : null}
      </AdminPanel>

      <ConfirmDialog
        open={confirmReset}
        title="Reset CMS to starter library?"
        description="This overwrites the current content store with the seed shipped in the app."
        confirmLabel="Reset"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          void (async () => {
            await resetDemoData();
            setConfirmReset(false);
            setMessage('Starter library restored');
            window.setTimeout(() => setMessage(null), 2500);
          })();
        }}
      />
    </div>
  );
}

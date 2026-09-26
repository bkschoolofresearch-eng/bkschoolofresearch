'use client';

import Link from 'next/link';
import { ExternalLink, Menu } from 'lucide-react';
import { useCms } from './CmsProvider';

export function AdminHeader({
  title,
  onMenuClick,
}: {
  title?: string;
  onMenuClick: () => void;
}) {
  const { mode, apiAuthenticated, logoutCms } = useCms();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E2E8F0] bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-xl p-2 text-[#0B1F36] hover:bg-[#F4F7FB] lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#0B1F36]">
          {title ?? 'BK School of Research'}
        </p>
        <p className="truncate text-xs text-[#5B6B7C]">
          {apiAuthenticated
            ? mode === 'mongo'
              ? 'Connected to MongoDB'
              : 'Connected — edits update the live site'
            : 'Not logged in'}
        </p>
      </div>
      {apiAuthenticated ? (
        <button
          type="button"
          onClick={() => void logoutCms()}
          className="rounded-xl border border-[#D5DEE8] bg-white px-3 py-2 text-xs font-semibold text-[#0B1F36] hover:bg-[#F4F7FB]"
        >
          Log out
        </button>
      ) : null}
      <Link
        href="/"
        target="_blank"
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5DEE8] bg-white px-3 py-2 text-xs font-semibold text-[#0B1F36] hover:bg-[#F4F7FB]"
      >
        View website
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </header>
  );
}

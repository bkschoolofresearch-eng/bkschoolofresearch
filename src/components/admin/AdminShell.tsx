'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { AdminLoading } from './AdminLoading';
import { AdminLoginScreen } from './AdminLoginScreen';
import { AdminSidebar } from './AdminSidebar';
import { CmsProvider, useCms } from './CmsProvider';

/** Routes that load their own data and should not wait on the full CMS snapshot. */
function skipsFullDatabaseGate(pathname: string): boolean {
  return pathname === '/admin/research' || pathname === '/admin/research/';
}

function AdminShellInner({ children }: { children: ReactNode }) {
  const { ready, apiAuthenticated, database, contentLoading, contentError, refresh } =
    useCms();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!ready) {
    return <AdminLoading label="Checking session" fullScreen />;
  }

  if (!apiAuthenticated) {
    return <AdminLoginScreen />;
  }

  const waitingOnFullDatabase =
    contentLoading && !database && !skipsFullDatabaseGate(pathname);

  if (!database && contentError && !skipsFullDatabaseGate(pathname)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#EEF2F6] px-6">
        <div className="max-w-md text-center">
          <p className="font-sans text-base leading-relaxed text-[#17212B]">
            {contentError}
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#0b233f] px-6 py-3 font-sans text-sm font-medium text-white hover:bg-[#173b6c]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root flex min-h-screen bg-[#EEF2F6] text-[#17212B]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex h-12 items-center border-b border-[#E2E8F0] bg-[#EEF2F6]/95 px-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-[#0B1F36] hover:bg-white"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {waitingOnFullDatabase ? (
            <AdminLoading label="Loading CMS" />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode; title?: string }) {
  return (
    <CmsProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </CmsProvider>
  );
}

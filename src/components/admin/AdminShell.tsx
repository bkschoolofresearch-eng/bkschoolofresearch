'use client';

import { useState, type ReactNode } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminLoginScreen } from './AdminLoginScreen';
import { AdminSidebar } from './AdminSidebar';
import { CmsProvider, useCms } from './CmsProvider';

function AdminShellInner({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const { ready, apiAuthenticated } = useCms();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF2F6] text-sm text-[#5B6B7C]">
        Loading CMS…
      </div>
    );
  }

  if (!apiAuthenticated) {
    return <AdminLoginScreen />;
  }

  return (
    <div className="admin-root flex min-h-screen bg-[#EEF2F6] text-[#17212B]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <CmsProvider>
      <AdminShellInner title={title}>{children}</AdminShellInner>
    </CmsProvider>
  );
}

'use client';

import { Suspense } from 'react';
import { AdminLoading } from '@/components/admin/AdminLoading';
import { TeamAdminPage } from '@/components/admin/TeamAdminPage';

export default function Page() {
  return (
    <Suspense fallback={<AdminLoading label="Loading team" />}>
      <TeamAdminPage />
    </Suspense>
  );
}

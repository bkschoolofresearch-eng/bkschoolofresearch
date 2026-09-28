'use client';

import { use } from 'react';
import { ActivityEditorPage } from '@/components/admin/ActivityEditorPage';

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ActivityEditorPage mode="edit" id={id} />;
}

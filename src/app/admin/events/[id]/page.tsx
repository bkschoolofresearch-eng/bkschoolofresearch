'use client';

import { use } from 'react';
import { EventEditorPage } from '@/components/admin/EventEditorPage';

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EventEditorPage mode="edit" id={id} />;
}

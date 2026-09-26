'use client';

import { use } from 'react';
import { PublicationEditorPage } from '@/components/admin/PublicationEditorPage';

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PublicationEditorPage mode="edit" id={id} />;
}

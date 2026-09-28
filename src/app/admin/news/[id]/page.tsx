'use client';

import { use } from 'react';
import { NewsEditorPage } from '@/components/admin/NewsEditorPage';

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <NewsEditorPage mode="edit" id={id} />;
}

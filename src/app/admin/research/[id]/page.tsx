'use client';

import { use } from 'react';
import { ResearchEditorPage } from '@/components/admin/ResearchEditorPage';

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ResearchEditorPage mode="edit" id={id} />;
}

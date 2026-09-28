'use client';

import { use } from 'react';
import { ResearchAreaEditorPage } from '@/components/admin/ResearchAreaEditorPage';

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ResearchAreaEditorPage mode="edit" id={id} />;
}

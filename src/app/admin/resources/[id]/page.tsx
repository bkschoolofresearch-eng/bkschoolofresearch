'use client';

import { use } from 'react';
import { ResourceEditorPage } from '@/components/admin/ResourceEditorPage';

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ResourceEditorPage mode="edit" id={id} />;
}

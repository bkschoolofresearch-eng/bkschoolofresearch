'use client';

import { use } from 'react';
import { PersonEditorPage } from '@/components/admin/PersonEditorPage';

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PersonEditorPage id={id} />;
}

'use client';

import { use } from 'react';
import { NoticeEditorPage } from '@/components/admin/NoticeEditorPage';

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <NoticeEditorPage mode="edit" id={id} />;
}

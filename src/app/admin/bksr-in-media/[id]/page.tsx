'use client';

import { use } from 'react';
import { MediaClippingEditorPage } from '@/components/admin/MediaClippingEditorPage';

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <MediaClippingEditorPage mode="edit" id={id} />;
}

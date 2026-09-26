import { JoinApplicationForm } from '@/components/public/JoinApplicationForm';
import { getContentDatabase } from '@/lib/cms/get-content-database';
import { getJoinForm } from '@/lib/content/registration-forms';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata(
  'Join BKSR',
  'Apply to join BK School of Research as a researcher or organisational collaborator.',
  '/join',
);

export default async function JoinPage() {
  const form = getJoinForm(await getContentDatabase());
  return <JoinApplicationForm form={form} />;
}

'use client';

import { usePathname } from 'next/navigation';
import { SiteCta } from '@/components/layout/SiteCta';

const HIDDEN_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/account',
  '/verify',
  '/join',
];

/** Keep auth / account / join form flows free of the sitewide CTA. */
export function SiteCtaGate() {
  const pathname = usePathname();
  const hidden = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (hidden) return null;
  return <SiteCta />;
}

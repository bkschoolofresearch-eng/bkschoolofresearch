'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from '@/components/layout/SiteFooter';
import type { NavigationItem, SiteSettings } from '@/types/content';

const HIDDEN_PREFIXES = ['/join'];

type SiteFooterGateProps = {
  settings: SiteSettings;
  footerNav: NavigationItem[];
  knowledgeHub: NavigationItem[];
};

/** Form-first public pages keep the header but skip the marketing footer. */
export function SiteFooterGate({
  settings,
  footerNav,
  knowledgeHub,
}: SiteFooterGateProps) {
  const pathname = usePathname();
  const hidden = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (hidden) return null;
  return (
    <SiteFooter
      settings={settings}
      footerNav={footerNav}
      knowledgeHub={knowledgeHub}
    />
  );
}

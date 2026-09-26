import { SiteCtaGate } from '@/components/layout/SiteCtaGate';
import { SiteFooterGate } from '@/components/layout/SiteFooterGate';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { getNavigation, getSiteSettings } from '@/lib/content/queries';

type PublicShellProps = {
  children: React.ReactNode;
};

export async function PublicShell({ children }: PublicShellProps) {
  const settings = await getSiteSettings();
  const navigation = await getNavigation();

  return (
    <>
      <SkipLink />
      <SiteHeader
        organizationName={settings.organizationName}
        navigation={navigation.main}
      />
      <main id="main-content" className="min-w-0 flex-1 overflow-x-clip">
        {children}
      </main>
      <SiteCtaGate />
      <SiteFooterGate
        settings={settings}
        footerNav={navigation.footer}
        knowledgeHub={navigation.knowledgeHub}
      />
    </>
  );
}

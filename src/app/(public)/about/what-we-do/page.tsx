import { HowWeWorkTimeline } from '@/components/home/HowWeWorkTimeline';
import { AboutSubpageView } from '@/components/public/AboutSubpageView';
import { WHAT_WE_DO_PILLARS } from '@/content/about-hub';
import { getAboutPage } from '@/content/about-pages';
import { buildPageMetadata } from '@/lib/seo/metadata';

const page = getAboutPage('what-we-do');

export const metadata = buildPageMetadata(
  page.title,
  page.excerpt,
  `/about/${page.slug}`,
);

export default function WhatWeDoPage() {
  return (
    <AboutSubpageView
      page={page}
      slug={page.slug}
      bodySlot={
        <HowWeWorkTimeline
          mode="reading"
          showLabel={false}
          steps={WHAT_WE_DO_PILLARS}
        />
      }
    />
  );
}

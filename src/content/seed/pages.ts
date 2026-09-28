import type { Page } from '@/types/content';

const ts = {
  status: 'published' as const,
  createdAt: '2016-12-01T00:00:00.000Z',
  updatedAt: '2026-08-30T00:00:00.000Z',
  publishedAt: '2016-12-01T00:00:00.000Z',
};

/** About subpages live in src/content/about-pages.ts, not in the CMS. */
export const pages: Page[] = [
  {
    ...ts,
    id: 'page-contact',
    slug: 'contact',
    title: 'Contact',
    excerpt: 'Get in touch with BK School of Research.',
    body: `BK School of Research

Address: Shahjadpur, Sirajganj-6770, Bangladesh
Phone: +8801747256047

Email:
- General: info@bkschoolofresearch.org
- Executive Director: exe_dir@bkschoolofresearch.org
- Research Director: dir_res@bkschoolofresearch.org`,
    template: 'contact',
    order: 10,
    seo: {
      title: 'Contact | BK School of Research',
      description: 'Contact BK School of Research in Shahjadpur, Sirajganj, Bangladesh.',
      canonicalPath: '/contact',
    },
  },
];

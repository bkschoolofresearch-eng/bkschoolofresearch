import type { MediaClipping } from '@/types/content';

const base = {
  status: 'published' as const,
  createdAt: '2022-01-01T00:00:00.000Z',
  updatedAt: '2026-09-20T00:00:00.000Z',
};

/**
 * BKSR in Media — press / TV / digital coverage from
 * docs/New folder/BKSR in Media.docx (order preserved).
 */
export const mediaClippings: MediaClipping[] = [
  {
    ...base,
    id: 'press-tbs-bk-school-curiosity-2023',
    slug: 'tbs-bk-school-inspiring-research-cultivating-curiosity',
    publishedAt: '2023-06-28T00:00:00.000Z',
    title: 'BK School: Inspiring research and cultivating curiosity',
    authors: ['Miraz Hossain'],
    year: 2023,
    venue: 'The Business Standard',
    url: 'https://www.tbsnews.net/features/pursuit/bk-school-inspiring-research-and-cultivating-curiosity-657558',
    citation:
      'Hossain, M. (28 June, 2023). BK School: Inspiring research and cultivating curiosity. The Business Standard.',
    abstract:
      'Feature profile of BK School of Research as a hub for young researchers offering free mentoring, training, and policy-oriented research.',
    language: 'en',
  },
  {
    ...base,
    id: 'press-deshrupantor-beautiful-future-research-2023',
    slug: 'deshrupantor-sundar-agamir-jonno-gobeshona',
    publishedAt: '2023-09-03T00:00:00.000Z',
    title: 'সুন্দর আগামীর জন্য গবেষণা করেন যারা',
    authors: [],
    year: 2023,
    venue: 'Deshrupantor',
    url: 'https://www.deshrupantor.com/amp/450751/%E0%A6%B8%E0%A7%81%E0%A6%A8%E0%A7%8D%E0%A6%A6%E0%A6%B0-%E0%A6%86%E0%A6%97%E0%A6%BE%E0%A6%AE%E0%A7%80%E0%A6%B0-%E0%A6%9C%E0%A6%A8%E0%A7%8D%E0%A6%AF-%E0%A6%97%E0%A6%AC%E0%A7%87%E0%A6%B7%E0%A6%A3%E0%A6%BE-%E0%A6%95%E0%A6%B0%E0%A7%87%E0%A6%A8-%E0%A6%AF%E0%A6%BE%E0%A6%B0%E0%A6%BE',
    citation:
      'Deshrupantor. (03 September, 2023). সুন্দর আগামীর জন্য গবেষণা করেন যারা.',
    abstract:
      'Deshrupantor feature on researchers working toward a better future, including BK School of Research.',
    language: 'bn',
  },
  {
    ...base,
    id: 'press-jamuna-cfep-mou-2025',
    slug: 'jamuna-bksr-cfep-mou-signed',
    publishedAt: '2025-09-04T00:00:00.000Z',
    title: 'বিকে স্কুল অব রিসার্চ ও সিএফইপির মধ্যে সমঝোতা স্মারক স্বাক্ষরিত',
    authors: [],
    year: 2025,
    venue: 'Jamuna Television',
    url: 'https://www.jamuna.tv/misc/635089',
    citation:
      'Jamuna Television. (04 September, 2025). বিকে স্কুল অব রিসার্চ ও সিএফইপির মধ্যে সমঝোতা স্মারক স্বাক্ষরিত.',
    abstract:
      'Television coverage of the memorandum of understanding between BK School of Research and CFEP.',
    language: 'bn',
  },
  {
    ...base,
    id: 'press-deshrupantor-research-as-career-2026',
    slug: 'deshrupantor-jodi-gobeshonake-pesha-hisebe-nite-chan',
    publishedAt: '2026-05-25T00:00:00.000Z',
    title: 'যদি গবেষণাকে পেশা হিসেবে নিতে চান',
    authors: [],
    year: 2026,
    venue: 'Deshrupantor',
    url: 'https://www.deshrupantor.com/amp/690859/%E0%A6%AF%E0%A6%A6%E0%A6%BF-%E0%A6%97%E0%A6%AC%E0%A7%87%E0%A6%B7%E0%A6%A3%E0%A6%BE%E0%A6%95%E0%A7%87-%E0%A6%AA%E0%A7%87%E0%A6%B6%E0%A6%BE-%E0%A6%B9%E0%A6%BF%E0%A6%B8%E0%A7%87%E0%A6%AC%E0%A7%87-%E0%A6%A8%E0%A6%BF%E0%A6%A4%E0%A7%87-%E0%A6%9A%E0%A6%BE%E0%A6%A8',
    citation:
      'Deshrupantor. (25 May, 2026). যদি গবেষণাকে পেশা হিসেবে নিতে চান.',
    abstract:
      'Career guidance feature on pursuing research as a profession, featuring BKSR perspectives.',
    language: 'bn',
  },
  {
    ...base,
    id: 'press-ajker-patrika-research-for-students-2023',
    slug: 'ajker-patrika-shiksharthi-gobeshona-keno-joruri',
    publishedAt: '2023-05-10T00:00:00.000Z',
    title: 'শিক্ষার্থীদের জন্য গবেষণা কেন জরুরি',
    authors: ['বিজন কুমার'],
    year: 2023,
    venue: 'Ajker Patrika',
    url: 'https://www.ajkerpatrika.com/amp/education/ajpo9dkp8slz0',
    citation:
      'Kumar, B. (10 May, 2023). শিক্ষার্থীদের জন্য গবেষণা কেন জরুরি. Ajker Patrika.',
    abstract:
      'Ajker Patrika education column on why research matters for students, by Bezon Kumar.',
    language: 'bn',
  },
  {
    ...base,
    id: 'press-protidiner-bksr-cfep-2025',
    slug: 'protidiner-bksr-cfep-sustainable-development',
    publishedAt: '2025-09-04T00:00:00.000Z',
    title:
      'টেকসই উন্নয়নে একসঙ্গে কাজ করবে বিকে স্কুল অব রিসার্চ ও সিএফইপি',
    authors: [],
    year: 2025,
    venue: 'Protidiner Bangladesh',
    url: 'https://protidinerbangladesh.com/country/146688/%E0%A6%9F%E0%A7%87%E0%A6%95%E0%A6%B8%E0%A6%87-%E0%A6%89%E0%A6%A8%E0%A7%8D%E0%A6%A8%E0%A7%9F%E0%A6%A8%E0%A7%87-%E0%A6%8F%E0%A6%95%E0%A6%B8%E0%A6%99%E0%A7%8D%E0%A6%97%E0%A7%87-%E0%A6%95%E0%A6%BE%E0%A6%9C-%E0%A6%95%E0%A6%B0%E0%A6%AC%E0%A7%87-%E0%A6%AC%E0%A6%BF%E0%A6%95%E0%A7%87-%E0%A6%B8%E0%A7%8D%E0%A6%95%E0%A7%81%E0%A6%B2-%E0%A6%85%E0%A6%AC-%E0%A6%B0%E0%A6%BF%E0%A6%B8%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%9A-%E0%A6%93-%E0%A6%B8%E0%A6%BF%E0%A6%8F%E0%A6%AB%E0%A6%87%E0%A6%AA%E0%A6%BF',
    citation:
      'Protidiner Bangladesh. (04 September, 2025). টেকসই উন্নয়নে একসঙ্গে কাজ করবে বিকে স্কুল অব রিসার্চ ও সিএফইপি.',
    abstract:
      'Coverage of BK School of Research and CFEP agreeing to work together on sustainable development.',
    language: 'bn',
  },
  {
    ...base,
    id: 'press-dhaka-tribune-joy-bangla-2022',
    slug: 'dhaka-tribune-joy-bangla-youth-award-2022',
    publishedAt: '2022-11-12T00:00:00.000Z',
    title: '10 changemaking organizations win Joy Bangla Youth Award 2022',
    authors: ['Ali Asif Shawon'],
    year: 2022,
    venue: 'Dhaka Tribune',
    url: 'https://www.dhakatribune.com/bangladesh/298006/10-changemaking-organizations-win-joy-bangla-youth',
    citation:
      'Shawon, A. A. (12 November, 2022). 10 changemaking organizations win Joy Bangla Youth Award 2022. Dhaka Tribune.',
    abstract:
      'Dhaka Tribune report naming BK School of Research among Joy Bangla Youth Award 2022 winners in the Skills and Employment category.',
    language: 'en',
  },
  {
    ...base,
    id: 'press-tbs-joy-bangla-inspirational-2022',
    slug: 'tbs-joy-bangla-youth-award-inspirational-winners',
    publishedAt: '2022-11-13T00:00:00.000Z',
    title: 'Joy Bangla Youth Award inspirational, say winners',
    authors: ['TBS Report'],
    year: 2022,
    venue: 'The Business Standard',
    url: 'https://www.tbsnews.net/bangladesh/joy-bangla-youth-award-inspirational-say-winners-531130',
    citation:
      'TBS Report. (13 November, 2022). Joy Bangla Youth Award inspirational, say winners. The Business Standard.',
    abstract:
      'The Business Standard coverage of Joy Bangla Youth Award 2022 winners, including BK School of Research.',
    language: 'en',
  },
  {
    ...base,
    id: 'press-risingbd-youth-award-2023',
    slug: 'risingbd-rising-youth-award-bezon-kumar',
    publishedAt: '2023-07-30T00:00:00.000Z',
    title:
      'রাইজিং ইয়ুথ অ্যাওয়ার্ড পেলেন রবীন্দ্র বিশ্ববিদ্যালয়ের শিক্ষক বিজন কুমার',
    authors: [],
    year: 2023,
    venue: 'RisingBD',
    url: 'https://www.risingbd.com/campus/news/514187',
    citation:
      'RisingBD. (30 July, 2023). রাইজিং ইয়ুথ অ্যাওয়ার্ড পেলেন রবীন্দ্র বিশ্ববিদ্যালয়ের শিক্ষক বিজন কুমার.',
    abstract:
      'Campus report on Bezon Kumar of Rabindra University receiving the Rising Youth Award.',
    language: 'bn',
  },
  {
    ...base,
    id: 'press-youtube-maasranga-bezon-2023',
    slug: 'maasranga-ranga-shokal-bezon-kumar-interview',
    publishedAt: '2023-01-07T00:00:00.000Z',
    title:
      'Bezon Kumar | শিক্ষক ও গবেষক | BK School of Research | Maasranga Ranga Shokal',
    authors: [],
    year: 2023,
    venue: 'Maasranga Television',
    url: 'https://youtu.be/EcaHhsYCu-U',
    citation:
      'Maasranga Ranga Shokal. (07 January, 2023). Bezon Kumar | শিক্ষক ও গবেষক | BK School of Research [Video]. YouTube.',
    abstract:
      'Maasranga Television morning-show interview with Bezon Kumar on teaching, research, and BK School of Research.',
    language: 'bn',
  },
  {
    ...base,
    id: 'press-dbangla71-clipping-2022',
    slug: 'dbangla71-press-clipping-october-2022',
    publishedAt: '2022-10-02T00:00:00.000Z',
    title: 'BK School of Research press clipping',
    authors: [],
    year: 2022,
    venue: 'Daily Bangla 71',
    url: 'https://dbangla71.com/2022/10/02/7/details/7_r2_c3.jpg',
    citation:
      'Daily Bangla 71. (02 October, 2022). BK School of Research press clipping.',
    abstract: 'Scanned newspaper clipping featuring BK School of Research.',
    language: 'bn',
  },
  {
    ...base,
    id: 'press-bdnews24-rohingya-covid-2022',
    slug: 'bdnews24-rohingya-women-adolescents-food-insecurity-covid',
    publishedAt: '2022-10-05T00:00:00.000Z',
    title: 'মহামারীকালে খাদ্য সংকটে ছিলেন ৬৩% রোহিঙ্গা নারী ও কিশোর-কিশোরী',
    authors: [],
    year: 2022,
    venue: 'bdnews24.com',
    url: 'https://bangla.bdnews24.com/bangladesh/u8c0vwjfau',
    citation:
      'bdnews24.com. (05 October, 2022). মহামারীকালে খাদ্য সংকটে ছিলেন ৬৩% রোহিঙ্গা নারী ও কিশোর-কিশোরী.',
    abstract:
      'bdnews24 coverage of BKSR research findings on food insecurity among Rohingya women and adolescents during COVID-19.',
    language: 'bn',
  },
  {
    ...base,
    id: 'press-amadershomoy-unicef-feature-2022',
    slug: 'amadershomoy-unicef-features-bksr-research',
    publishedAt: '2022-09-30T00:00:00.000Z',
    title: 'বিকে স্কুল অব রিসার্চের গবেষণাকে ফিচার করলো ইউনিসেফ',
    authors: ['হাবিবুর রহমান'],
    year: 2022,
    venue: 'Amader Shomoy',
    url: 'https://www.amadershomoy.com/education/article/24869/%e0%a6%ac%e0%a6%bf%e0%a6%95%e0%a7%87-%e0%a6%b8%e0%a7%8d%e0%a6%95%e0%a7%81%e0%a6%b2-%e0%a6%85%e0%a6%ac-%e0%a6%b0%e0%a6%bf%e0%a6%b8%e0%a6%be%e0%a6%b0%e0%a7%8d%e0%a6%9a%e0%a7%87%e0%a6%b0-%e0%a6%97',
    citation:
      'Rahman, H. (2022). বিকে স্কুল অব রিসার্চের গবেষণাকে ফিচার করলো ইউনিসেফ. Amader Shomoy.',
    abstract:
      'Amader Shomoy report that UNICEF featured BK School of Research work in its Women and Children Research Library.',
    language: 'bn',
  },
];

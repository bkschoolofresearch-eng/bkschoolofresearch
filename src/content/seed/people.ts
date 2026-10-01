import type { Person } from '@/types/content';

const now = '2026-08-30T00:00:00.000Z';
const published = '2016-12-01T00:00:00.000Z';

export const people: Person[] = [
  {
    id: 'person-bezon-kumar',
    slug: 'bezon-kumar',
    status: 'published',
    createdAt: published,
    updatedAt: now,
    publishedAt: published,
    name: 'Bezon Kumar',
    role: 'Executive Director',
    category: 'executive-director',
    email: 'exe_dir@bkschoolofresearch.org',
    claimStatus: 'unclaimed',
    verificationCode: 'BKSR-00001M',
    appointmentYear: '2025-2026',
    affiliation: 'Lecturer in Economics, Rabindra University, Bangladesh',
    shortBio:
      'Bezon Kumar is an experienced researcher and educator with expertise in development economics, remittances, climate perception, and evidence-based policy. He is passionate about building research capacity, mentoring young scholars, and creating long-term value for communities and institutions. As Executive Director of BK School of Research and Lecturer in Economics at Rabindra University, Bangladesh, he leads programmes that connect scholarship with public practice.',
    photoId: 'media-authentic-bezon-kumar',
    photoUrl: '/media/authentic/bezon-kumar.jpg',
    bio: `Bezon Kumar, a Lecturer in Economics at Rabindra University, Bangladesh, is a professional researcher. He has a number of international peer-reviewed journal articles and is engaged in many research projects. Before joining Rabindra University, he served at Varendra University as a Lecturer in Economics from 2017 to 2019.

Besides teaching and research, he writes columns in the newspaper, and also writes poems, short stories, and articles. He has a deep devotion to drawing and photography. In leisure, he likes reading books, gardening, caring for pets, playing cricket, listening to music, and watching movies. Making films is a great passion of his, and he has directed short films.

He founded BK School of Research in October 2015; the organization began its official journey in December 2016. He now serves as Executive Director of BK School of Research. (Note: the legacy BKSR site listed his role as Director.)`,
    legacyRoleNote:
      'Legacy site listed role as Director; new IA uses Executive Director.',
    researchInterests: [
      'Remittances',
      'Poverty',
      'Climate change perception',
      'Social media and wellbeing',
      'Development economics',
    ],
    order: 1,
    originalLegacyUrl: 'https://bkschoolofresearch.blogspot.com/p/people.html',
    seo: {
      title: 'Bezon Kumar — Executive Director | BK School of Research',
      description:
        'Bezon Kumar is Executive Director of BK School of Research and Lecturer in Economics at Rabindra University, Bangladesh.',
      canonicalPath: '/people/bezon-kumar',
    },
  },
];

/** Empty structural collections — populate when real profiles are available */
export const distinguishedFellows: Person[] = [];
export const researchTeam: Person[] = [];
export const administrativeTeam: Person[] = [];

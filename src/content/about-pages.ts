/**
 * About subpages are authored in code. They are not CMS records.
 */

export const ABOUT_PAGE_SLUGS = [
  'who-we-are',
  'what-we-do',
  'governance',
  'policies',
] as const;

export type AboutPageSlug = (typeof ABOUT_PAGE_SLUGS)[number];

export type AboutStaticPage = {
  slug: AboutPageSlug;
  title: string;
  excerpt: string;
  body: string;
  comingSoon?: {
    title: string;
    description: string;
    excerpt: string;
  };
};

export const ABOUT_PAGES: Record<AboutPageSlug, AboutStaticPage> = {
  'who-we-are': {
    slug: 'who-we-are',
    title: 'Who We Are',
    excerpt:
      'A research institution generating evidence-based knowledge, shaping policy, and driving lasting social impact across 26 countries.',
    body: `BK School of Research (BKSR), established in 2015, is a research institution dedicated to generating evidence-based knowledge, shaping policy, and driving lasting social impact. Our multidisciplinary work spans Arts and Humanities, Social Sciences, Business and Economics, and Public Health, bringing together 15 research fellows, 55 research scholars, and 300 enumerators across 26 countries.

We are committed to nurturing the next generation of researchers. Through training, mentorship, and innovation programs, we have empowered over 15,000 young individuals, many now pursuing global careers in research and development.

Our findings have shaped policy conversations, informed institutions like WHO and UNICEF, and reached communities through publications and partnerships, reflecting who we are: a bridge between evidence and impact.

## Vision

To be a globally recognized center of research excellence, empowering young researchers across diverse fields to generate evidence-based knowledge, shape policy, and drive lasting social impact.

## Missions

- To pursue innovative, evidence-based research that confronts pressing socio-economic and developmental challenges.
- To empower youths, early-career researchers, and young professionals, building their capacity through training, mentorship, collaboration, and publication.
- To bridge the gap between research and action, turning evidence into policy that governments, institutions, and communities can act on.
- To forge partnerships across borders and disciplines with universities, institutions, and change-makers who share our commitment to research for good.
- To carry knowledge beyond the walls of academia through journals, policy briefs, and public conversation so that research speaks not only to scholars, but also to the world it seeks to serve.

## Core Values

- To uphold rigor and quality in every stage of research.
- To invest in young researchers to build lasting capacity.
- To commit to honesty and transparency in research and reporting.
- To collaborate across disciplines and borders to address shared challenges.
- To translate research into policy, practice, and public benefit.`,
  },
  'what-we-do': {
    slug: 'what-we-do',
    title: 'What We Do',
    excerpt:
      'Research and publications, capacity building, policy engagement, and community impact.',
    body: '',
  },
  governance: {
    slug: 'governance',
    title: 'Governance',
    excerpt:
      'A structured framework for accountability, transparency, and sound institutional decision-making.',
    body: `BK School of Research operates under a structured governance framework designed to ensure accountability, transparency, and sound institutional decision-making across all areas of its work.

## Governing Board

BK School of Research is governed by a Governing Board, which serves as the institution's apex decision-making authority. The board sets the institution's strategic direction, approves major policies, and provides overarching oversight of institutional performance and integrity. It comprises a balanced mix of institutional leadership and independent members drawn from academia and the research sector, ensuring that governance decisions reflect diverse expertise and remain free from undue concentration of authority. The board convenes periodically to review institutional performance, approve key policies, and provide strategic guidance, with all proceedings formally documented.

## Executive Leadership

Day-to-day management of BK School of Research is entrusted to its executive leadership, headed by the Executive Director, who is accountable to the Governing Board. The Executive Director oversees the implementation of institutional strategy, research operations, and administrative functions, while major decisions including significant budgetary allocations, new institutional partnerships, and policy revisions remain subject to Board review and approval, in accordance with a clearly defined delegation of authority.

## Standing Committees

To distribute oversight responsibility and ensure specialized attention to key institutional functions, BK School of Research maintains the following standing committees:

- **Ethics Review Committee (ERC):** Reviews and approves all research involving human participants, assesses risk-benefit considerations, and monitors ongoing ethical compliance throughout the research lifecycle.
- **Research Advisory Committee:** Provides scientific and academic oversight of research design, methodology, and quality, ensuring that all research outputs meet institutional and international standards of rigor.
- **Finance and Audit Committee:** Oversees budgeting, financial controls, and the conduct of internal and external audits, ensuring the transparent and accountable use of institutional and donor resources.
- **Human Resources and Grievance Committee:** Oversees staff conduct, HR policy compliance, and the fair, impartial handling of workplace and research-related grievances.

## Accountability and Transparency Mechanisms

BK School of Research upholds accountability through a combination of internal and external mechanisms:

- **Financial Reporting:** Annual financial statements are prepared and reviewed through internal and external audit processes, ensuring transparent stewardship of institutional and donor funds.
- **Programmatic Reporting:** Annual reports detailing research activities, outcomes, and institutional performance are shared with donors, partners, and relevant stakeholders.
- **Policy Compliance Monitoring:** Adherence to institutional policies is monitored on an ongoing basis by the relevant committees, with periodic reviews to ensure continued alignment with evolving regulatory and sector standards.
- **Public Disclosure:** Governance structures, institutional policies, and leadership information are made publicly accessible, reflecting the institution's commitment to openness and accountability toward donors, partners, and the communities it serves.`,
  },
  policies: {
    slug: 'policies',
    title: 'Our Policies',
    excerpt: 'Institutional policies will be published here.',
    body: '',
    comingSoon: {
      title: 'Coming soon',
      excerpt: 'Institutional policies will be published here.',
      description:
        'No institutional policies have been published yet. They will appear on this page when they are ready.',
    },
  },
};

export function getAboutPage(slug: AboutPageSlug): AboutStaticPage {
  return ABOUT_PAGES[slug];
}

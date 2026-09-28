/**
 * Presentation-only team roster (NOT shown on the public site).
 * Kept for local design demos / future authentic CMS seeding only.
 * Public `/people` and homepage use CMS-published Person records exclusively.
 */

import type { PersonCategory } from '@/types/content';

export type DemoTeamMember = {
  id: string;
  slug: string;
  name: string;
  role: string;
  category: Exclude<PersonCategory, 'executive-director' | 'other'>;
  imageSrc: string;
  /** Flip-card short bio */
  description: string;
  /** Profile detail page bio */
  bio: string;
  affiliation?: string;
  researchInterests?: string[];
};

const portraits = {
  carlos: '/media/prototype/team-demo-carlos-ramirez.png',
  daniel: '/media/prototype/team-demo-daniel-wong.png',
  aisha: '/media/prototype/team-demo-aisha-patel.png',
  sofia: '/media/prototype/team-demo-sofia-chen.png',
} as const;

const shortBio = (name: string, expertise: string) =>
  `${name} is an experienced researcher and collaborator with expertise in ${expertise}. They are passionate about building strong teams, driving innovation, and creating long-term value for organisations and their stakeholders.`;

const longBio = (name: string, role: string, expertise: string, focus: string) =>
  `${name} serves as ${role} at BK School of Research. With expertise in ${expertise}, they contribute to collaborative inquiry, mentoring, and programmes that connect scholarship with public practice.

Their work focuses on ${focus}. Across projects and partnerships, they help strengthen research design, evidence use, and institutional learning.

Outside formal programmes, ${name.split(' ')[0]} remains engaged in knowledge exchange, capacity building, and supporting early-career researchers within the BKSR community.`;

function member(
  partial: Omit<DemoTeamMember, 'description' | 'bio'> & {
    expertise: string;
    focus: string;
  },
): DemoTeamMember {
  const { expertise, focus, ...rest } = partial;
  return {
    ...rest,
    description: shortBio(rest.name, expertise),
    bio: longBio(rest.name, rest.role, expertise, focus),
  };
}

/** Section order on /people (after Executive Director). */
export const PEOPLE_DEMO_SECTION_ORDER: DemoTeamMember['category'][] = [
  'distinguished-fellow',
  'research-team',
  'administrative-team',
  'alumni',
];

export const PEOPLE_DEMO_SECTION_COPY: Record<
  DemoTeamMember['category'],
  { label: string; description: string; href: string }
> = {
  'distinguished-fellow': {
    label: 'Distinguished Fellows',
    description:
      'Senior scholars and advisors contributing expertise across BKSR’s research programmes.',
    href: '/people/distinguished-fellows',
  },
  'research-team': {
    label: 'Research Team',
    description:
      'Fellows, associates, and assistants advancing evidence-based inquiry and publication.',
    href: '/people/research-team',
  },
  'administrative-team': {
    label: 'Administrative Team',
    description:
      'Programme, communications, and operations colleagues who keep BKSR delivery on track.',
    href: '/people/administrative-team',
  },
  alumni: {
    label: 'Alumni',
    description:
      'Former researchers and programme contributors who remain part of the BKSR community.',
    href: '/people',
  },
};

/** Demo directory members (excluding Executive Director). */
export const peopleDemoRoster: DemoTeamMember[] = [
  member({
    id: 'demo-carlos-ramirez',
    slug: 'carlos-ramirez',
    name: 'Carlos Ramirez',
    role: 'Distinguished Fellow',
    category: 'distinguished-fellow',
    imageSrc: portraits.carlos,
    affiliation: 'Policy & institutional partnerships',
    expertise: 'policy analysis, programme evaluation, and institutional partnerships',
    focus: 'evidence-informed reform, multi-stakeholder research, and long-horizon programme strategy',
    researchInterests: ['Policy analysis', 'Programme evaluation', 'Partnerships'],
  }),
  member({
    id: 'demo-james-okonkwo',
    slug: 'james-okonkwo',
    name: 'James Okonkwo',
    role: 'Distinguished Fellow',
    category: 'distinguished-fellow',
    imageSrc: portraits.daniel,
    expertise: 'development economics, governance reform, and comparative public policy',
    focus: 'governance quality, comparative institutions, and development policy learning',
    researchInterests: ['Governance', 'Development economics', 'Public policy'],
  }),
  member({
    id: 'demo-david-brook',
    slug: 'david-brook',
    name: 'David Brook',
    role: 'Distinguished Fellow',
    category: 'distinguished-fellow',
    imageSrc: portraits.daniel,
    expertise: 'social development, civil society research, and policy advising',
    focus: 'civil society evidence, social inclusion, and advisory practice for public programmes',
    researchInterests: ['Social development', 'Civil society', 'Policy advice'],
  }),
  member({
    id: 'demo-laura-nguyen',
    slug: 'laura-nguyen',
    name: 'Laura Nguyen',
    role: 'Distinguished Fellow',
    category: 'distinguished-fellow',
    imageSrc: portraits.aisha,
    expertise: 'migration studies, diaspora engagement, and transnational policy research',
    focus: 'migration pathways, diaspora networks, and transnational policy coordination',
    researchInterests: ['Migration', 'Diaspora', 'Transnational policy'],
  }),
  member({
    id: 'demo-daniel-wong',
    slug: 'daniel-wong',
    name: 'Daniel Wong',
    role: 'Research Director',
    category: 'research-team',
    imageSrc: portraits.daniel,
    expertise: 'corporate strategy, research operations, and programme growth',
    focus: 'research portfolio design, operational excellence, and cross-team delivery',
    researchInterests: ['Research strategy', 'Operations', 'Programme growth'],
  }),
  member({
    id: 'demo-sofia-chen',
    slug: 'sofia-chen',
    name: 'Sofia Chen',
    role: 'Research Associate',
    category: 'research-team',
    imageSrc: portraits.sofia,
    expertise: 'field methods, data analysis, and collaborative publication',
    focus: 'field protocols, analytical workflows, and co-authored research outputs',
    researchInterests: ['Field methods', 'Data analysis', 'Publication'],
  }),
  member({
    id: 'demo-priya-sen',
    slug: 'priya-sen',
    name: 'Priya Sen',
    role: 'Senior Research Fellow',
    category: 'research-team',
    imageSrc: portraits.aisha,
    expertise: 'education policy, gender studies, and mixed-methods evaluation',
    focus: 'education equity, gender-responsive evaluation, and mixed-methods design',
    researchInterests: ['Education policy', 'Gender', 'Evaluation'],
  }),
  member({
    id: 'demo-marcus-hale',
    slug: 'marcus-hale',
    name: 'Marcus Hale',
    role: 'Research Fellow',
    category: 'research-team',
    imageSrc: portraits.carlos,
    expertise: 'climate perception, survey design, and applied econometrics',
    focus: 'climate attitudes, survey instruments, and applied econometric analysis',
    researchInterests: ['Climate perception', 'Surveys', 'Econometrics'],
  }),
  member({
    id: 'demo-nina-rahman',
    slug: 'nina-rahman',
    name: 'Nina Rahman',
    role: 'Research Associate',
    category: 'research-team',
    imageSrc: portraits.sofia,
    expertise: 'remittances research, poverty analysis, and community fieldwork',
    focus: 'household remittances, poverty dynamics, and community-based inquiry',
    researchInterests: ['Remittances', 'Poverty', 'Fieldwork'],
  }),
  member({
    id: 'demo-omar-hassan',
    slug: 'omar-hassan',
    name: 'Omar Hassan',
    role: 'Research Associate',
    category: 'research-team',
    imageSrc: portraits.daniel,
    expertise: 'public health policy, programme monitoring, and impact assessment',
    focus: 'health systems evidence, monitoring frameworks, and impact measurement',
    researchInterests: ['Public health', 'Monitoring', 'Impact'],
  }),
  member({
    id: 'demo-kenji-tanaka',
    slug: 'kenji-tanaka',
    name: 'Kenji Tanaka',
    role: 'Research Fellow',
    category: 'research-team',
    imageSrc: portraits.carlos,
    expertise: 'statistical methods, open data practice, and research software training',
    focus: 'reproducible analysis, open data workflows, and research software capacity',
    researchInterests: ['Statistics', 'Open data', 'Training'],
  }),
  member({
    id: 'demo-amina-chowdhury',
    slug: 'amina-chowdhury',
    name: 'Amina Chowdhury',
    role: 'Junior Research Assistant',
    category: 'research-team',
    imageSrc: portraits.aisha,
    expertise: 'literature review, transcription support, and early-career research practice',
    focus: 'evidence synthesis support, careful documentation, and early-career learning',
    researchInterests: ['Literature review', 'Documentation', 'Learning'],
  }),
  member({
    id: 'demo-lucas-meyer',
    slug: 'lucas-meyer',
    name: 'Lucas Meyer',
    role: 'Research Assistant',
    category: 'research-team',
    imageSrc: portraits.carlos,
    expertise: 'data cleaning, GIS support, and collaborative fieldwork logistics',
    focus: 'dataset preparation, spatial support, and field coordination',
    researchInterests: ['Data cleaning', 'GIS', 'Field logistics'],
  }),
  member({
    id: 'demo-thomas-reed',
    slug: 'thomas-reed',
    name: 'Thomas Reed',
    role: 'Research Fellow',
    category: 'research-team',
    imageSrc: portraits.daniel,
    expertise: 'labour markets, skills policy, and longitudinal survey analysis',
    focus: 'labour market transitions, skills systems, and longitudinal evidence',
    researchInterests: ['Labour markets', 'Skills', 'Longitudinal data'],
  }),
  member({
    id: 'demo-arjun-mehta',
    slug: 'arjun-mehta',
    name: 'Arjun Mehta',
    role: 'Research Associate',
    category: 'research-team',
    imageSrc: portraits.carlos,
    expertise: 'urban policy, informal economies, and participatory research methods',
    focus: 'urban livelihoods, informal work, and participatory inquiry',
    researchInterests: ['Urban policy', 'Informal economy', 'Participatory methods'],
  }),
  member({
    id: 'demo-ibrahim-khan',
    slug: 'ibrahim-khan',
    name: 'Ibrahim Khan',
    role: 'Research Assistant',
    category: 'research-team',
    imageSrc: portraits.daniel,
    expertise: 'enumerator training, field coordination, and primary data collection',
    focus: 'field team readiness, quality collection, and on-site coordination',
    researchInterests: ['Enumeration', 'Field coordination', 'Primary data'],
  }),
  member({
    id: 'demo-samuel-okello',
    slug: 'samuel-okello',
    name: 'Samuel Okello',
    role: 'Research Fellow',
    category: 'research-team',
    imageSrc: portraits.carlos,
    expertise: 'agriculture policy, rural livelihoods, and evidence synthesis',
    focus: 'rural livelihoods evidence, agriculture policy, and synthesis for decision-makers',
    researchInterests: ['Agriculture', 'Rural livelihoods', 'Evidence synthesis'],
  }),
  member({
    id: 'demo-aisha-patel',
    slug: 'aisha-patel',
    name: 'Aisha Patel',
    role: 'Programme Coordinator',
    category: 'administrative-team',
    imageSrc: portraits.aisha,
    expertise: 'research operations, stakeholder engagement, and capacity-building delivery',
    focus: 'programme rhythm, partner coordination, and training delivery quality',
    researchInterests: ['Operations', 'Stakeholders', 'Capacity building'],
  }),
  member({
    id: 'demo-elena-vasquez',
    slug: 'elena-vasquez',
    name: 'Elena Vasquez',
    role: 'Programme Manager',
    category: 'administrative-team',
    imageSrc: portraits.aisha,
    expertise: 'programme delivery, partnership coordination, and event production',
    focus: 'delivery timelines, partner alignment, and high-quality research events',
    researchInterests: ['Programme delivery', 'Partnerships', 'Events'],
  }),
  member({
    id: 'demo-fatima-noor',
    slug: 'fatima-noor',
    name: 'Fatima Noor',
    role: 'Communications Lead',
    category: 'administrative-team',
    imageSrc: portraits.sofia,
    expertise: 'research communication, media outreach, and editorial storytelling',
    focus: 'clear research messaging, media placement, and editorial craft',
    researchInterests: ['Communications', 'Media', 'Editorial'],
  }),
  member({
    id: 'demo-sara-ibrahim',
    slug: 'sara-ibrahim',
    name: 'Sara Ibrahim',
    role: 'Administrative Coordinator',
    category: 'administrative-team',
    imageSrc: portraits.sofia,
    expertise: 'office operations, fellowship administration, and stakeholder liaison',
    focus: 'administrative continuity, fellowship support, and reliable liaison practice',
    researchInterests: ['Administration', 'Fellowships', 'Liaison'],
  }),
  member({
    id: 'demo-maya-fernandez',
    slug: 'maya-fernandez',
    name: 'Maya Fernandez',
    role: 'Training Lead',
    category: 'administrative-team',
    imageSrc: portraits.aisha,
    expertise: 'capacity-building design, workshop facilitation, and knowledge hub content',
    focus: 'learning design, facilitation quality, and knowledge-hub usefulness',
    researchInterests: ['Training design', 'Facilitation', 'Knowledge hub'],
  }),
  member({
    id: 'demo-hannah-park',
    slug: 'hannah-park',
    name: 'Hannah Park',
    role: 'Editorial Associate',
    category: 'administrative-team',
    imageSrc: portraits.sofia,
    expertise: 'publication workflows, citation standards, and research report editing',
    focus: 'editorial consistency, citation integrity, and report polish',
    researchInterests: ['Editing', 'Citations', 'Reports'],
  }),
  member({
    id: 'demo-zoe-martinez',
    slug: 'zoe-martinez',
    name: 'Zoe Martinez',
    role: 'Events Coordinator',
    category: 'administrative-team',
    imageSrc: portraits.sofia,
    expertise: 'seminar production, webinar operations, and community engagement',
    focus: 'seminar logistics, webinar delivery, and community participation',
    researchInterests: ['Seminars', 'Webinars', 'Community'],
  }),
  member({
    id: 'demo-riya-das',
    slug: 'riya-das',
    name: 'Riya Das',
    role: 'Former Research Associate',
    category: 'alumni',
    imageSrc: portraits.aisha,
    expertise: 'education research, alumni mentoring, and collaborative publication',
    focus: 'alumni mentoring pathways and continued scholarly collaboration',
    researchInterests: ['Education', 'Mentoring', 'Collaboration'],
  }),
  member({
    id: 'demo-noah-bennett',
    slug: 'noah-bennett',
    name: 'Noah Bennett',
    role: 'Former Research Fellow',
    category: 'alumni',
    imageSrc: portraits.carlos,
    expertise: 'policy briefs, programme evaluation, and early-career research training',
    focus: 'brief writing craft and early-career research support after fellowship',
    researchInterests: ['Policy briefs', 'Evaluation', 'Training'],
  }),
  member({
    id: 'demo-leila-karim',
    slug: 'leila-karim',
    name: 'Leila Karim',
    role: 'Former Programme Officer',
    category: 'alumni',
    imageSrc: portraits.sofia,
    expertise: 'campaign coordination, stakeholder workshops, and knowledge exchange',
    focus: 'campaign learning, workshop practice, and knowledge exchange networks',
    researchInterests: ['Campaigns', 'Workshops', 'Exchange'],
  }),
  member({
    id: 'demo-ethan-cole',
    slug: 'ethan-cole',
    name: 'Ethan Cole',
    role: 'Former Research Assistant',
    category: 'alumni',
    imageSrc: portraits.daniel,
    expertise: 'field support, data preparation, and collaborative research practice',
    focus: 'field readiness habits and collaborative research practice beyond the assistant role',
    researchInterests: ['Field support', 'Data prep', 'Collaboration'],
  }),
];

export function getDemoPersonBySlug(slug: string): DemoTeamMember | undefined {
  return peopleDemoRoster.find((person) => person.slug === slug);
}

export function getDemoPeopleSlugs(): string[] {
  return peopleDemoRoster.map((person) => person.slug);
}

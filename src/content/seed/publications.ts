import type { Publication } from '@/types/content';

const base = {
  status: 'published' as const,
  createdAt: '2018-01-01T00:00:00.000Z',
  updatedAt: '2026-09-19T00:00:00.000Z',
  doi: null as string | null,
};

/** Portfolio publications aligned to docs/New folder/Research.docx */
const scholarlyPublications: Publication[] = [
  // —— Journal articles ——
  {
    ...base,
    id: 'pub-kumar-remittances-rural-development-2026',
    slug: 'remittances-pathway-rural-development-bangladesh-2026',
    publishedAt: '2026-01-01T00:00:00.000Z',
    title:
      'Remittances as a pathway to rural development: micro-level evidence on household well-being and poverty reduction in Bangladesh',
    type: 'journal',
    authors: ['Kumar, B.'],
    year: 2026,
    venue: 'SN Business and Economics',
    volume: '6',
    pages: '328',
    citation:
      'Kumar, B. (2026). Remittances as a pathway to rural development: micro-level evidence on household well-being and poverty reduction in Bangladesh. SN Business and Economics, 6:328.',
    abstract:
      'Micro-level evidence on how remittances shape household well-being and poverty reduction in rural Bangladesh.',
    areaIds: ['area-economics-sustainability', 'area-migration-diaspora'],
    projectId: 'project-remittances-rural-development-2026',
  },
  {
    ...base,
    id: 'pub-banik-information-literacy-undergraduates-2026',
    slug: 'information-literacy-skills-bangladeshi-undergraduates-2026',
    publishedAt: '2026-01-01T00:00:00.000Z',
    title:
      'Information literacy skills among Bangladeshi undergraduates: measurement, determinants and the role of libraries',
    type: 'journal',
    authors: [
      'Banik, P',
      'Roy, P, B.',
      'Kumar, B',
    ],
    year: 2026,
    venue: 'Performance Measurement and Metrics',
    pages: '1-29',
    doi: '10.1108/PMM-03-2026-0025',
    citation:
      'Banik, P, Roy, P, B. and Kumar, B (2026). Information literacy skills among Bangladeshi undergraduates: measurement, determinants and the role of libraries. Performance Measurement and Metrics, 1-29. https://doi.org/10.1108/PMM-03-2026-0025.',
    abstract:
      'Measures information literacy among Bangladeshi undergraduates and examines determinants and the role of libraries.',
    areaIds: ['area-education-culture'],
    projectId: 'project-information-literacy-undergraduates-2026',
  },
  {
    ...base,
    id: 'pub-kumar-climate-women-pwd-2026',
    slug: 'climate-change-impacts-coping-women-persons-with-disabilities-2026',
    publishedAt: '2026-01-01T00:00:00.000Z',
    title:
      'Climate Change Impacts and Coping Mechanisms among Women and Persons with Disabilities: Insights from Climate-Induced Migrant Communities',
    type: 'journal',
    authors: [
      'Kumar, B.',
      'Mimi, M. B.',
      'Ko, J.',
      'Ridwan, M.',
      'Banik, P.',
      'Rani, D.',
      'Lee, H. F.',
    ],
    year: 2026,
    venue: 'Environment, Innovation and Management',
    volume: '2',
    pages: '2650011',
    citation:
      'Kumar, B., Mimi, M. B., Ko, J., Ridwan, M., Banik, P., Rani, D., & Lee, H. F. (2026). Climate Change Impacts and Coping Mechanisms among Women and Persons with Disabilities: Insights from Climate-Induced Migrant Communities. Environment, Innovation and Management, 2, 2650011.',
    abstract:
      'Documents climate impacts and coping among women and persons with disabilities in climate-induced migrant communities.',
    areaIds: [
      'area-environment-climate',
      'area-gender-development',
      'area-migration-diaspora',
    ],
    projectId: 'project-climate-women-pwd-2026',
  },
  {
    ...base,
    id: 'pub-al-galib-ncf-teachers-2026',
    slug: 'national-curriculum-framework-2021-bangladeshi-teachers-2026',
    publishedAt: '2026-01-01T00:00:00.000Z',
    title:
      "Navigating the uncharted: a phenomenological study of Bangladeshi teachers’ perceptions and experiences in implementing the National Curriculum Framework 2021",
    type: 'journal',
    authors: [
      'Al Galib, S.',
      'Nurudden, A. M.',
      'Sarker, T.',
      'Kumar, B.',
      'Banik, P.',
    ],
    year: 2026,
    venue: 'Discover Education',
    volume: '5',
    issue: '1',
    pages: '248',
    citation:
      'Al Galib, S., Nurudden, A. M., Sarker, T., Kumar, B., & Banik, P. (2026). Navigating the uncharted: a phenomenological study of Bangladeshi teachers’ perceptions and experiences in implementing the National Curriculum Framework 2021. Discover Education, 5(1), 248.',
    abstract:
      'Phenomenological study of Bangladeshi teachers’ experiences implementing the National Curriculum Framework 2021.',
    areaIds: ['area-education-culture'],
    projectId: 'project-ncf-2021-teachers-2026',
  },
  {
    ...base,
    id: 'pub-kumar-covid-rohingya-2022',
    slug: 'covid-19-rohingya-refugees-bangladesh-2022',
    publishedAt: '2022-01-01T00:00:00.000Z',
    title:
      'COVID-19 and the Rohingya Refugees in Bangladesh: Socioeconomic and Health Impacts on Women and Adolescents',
    type: 'journal',
    authors: [
      'Kumar, B.',
      'Pinky, S. D.',
      'Pulock, O. S.',
      'Kamal, R. S.',
      'Aziz, R.',
    ],
    year: 2022,
    venue: 'International Journal of Asia Pacific Studies',
    volume: '18',
    issue: '2',
    pages: '179-199',
    citation:
      'Kumar, B., Pinky, S. D., Pulock, O. S., Kamal, R. S. and Aziz, R. (2022). COVID-19 and the Rohingya Refugees in Bangladesh: Socioeconomic and Health Impacts on Women and Adolescents. International Journal of Asia Pacific Studies, 18(2): 179-199.',
    abstract:
      'Socioeconomic and health impacts of COVID-19 on Rohingya women and adolescents in Bangladesh.',
    areaIds: [
      'area-health-wellbeing',
      'area-migration-diaspora',
      'area-gender-development',
    ],
    projectId: 'project-covid-rohingya-2022',
  },
  {
    ...base,
    id: 'pub-ali-energy-growth-2022',
    slug: 'energy-consumption-economic-growth-linkage-2022',
    publishedAt: '2022-01-01T00:00:00.000Z',
    title:
      'Energy Consumption and Economic Growth Linkage: Global Evidence from Symmetric and Asymmetric Simulations',
    type: 'journal',
    authors: [
      'Ali, W.',
      'Nathaniel, S. P.',
      'Adikunle, I. A.',
      'Kumar, B.',
    ],
    year: 2022,
    venue: 'Quaestiones Geographicae',
    volume: '41',
    issue: '2',
    pages: '67-82',
    citation:
      'Ali, W., Nathaniel, S. P., Adikunle, I. A. and Kumar, B. (2022). Energy Consumption and Economic Growth Linkage: Global Evidence from Symmetric and Asymmetric Simulations. Quaestiones Geographicae, 41(2): 67-82.',
    abstract:
      'Global evidence on energy consumption–growth linkages using symmetric and asymmetric simulations.',
    areaIds: ['area-economics-sustainability', 'area-environment-climate'],
    projectId: 'project-energy-growth-2022',
  },
  {
    ...base,
    id: 'pub-kumar-kap-covid-students-2021',
    slug: 'knowledge-attitudes-practices-covid-19-students-bangladesh-2021',
    publishedAt: '2021-01-01T00:00:00.000Z',
    title:
      'Knowledge, Attitudes and Practices towards COVID-19 Guidelines among Students in Bangladesh',
    type: 'journal',
    authors: [
      'Kumar, B.',
      'Pinky, S. D.',
      'Nurudden, A. M.',
    ],
    year: 2021,
    venue: 'Social Sciences and Humanities Open',
    volume: '4',
    issue: '1',
    pages: '100194',
    citation:
      'Kumar, B., Pinky, S. D. and Nurudden, A. M. (2021). Knowledge, Attitudes and Practices towards COVID-19 Guidelines among Students in Bangladesh. Social Sciences and Humanities Open, 4(1): 100194.',
    abstract:
      'Survey of student knowledge, attitudes, and practices toward COVID-19 guidelines in Bangladesh.',
    areaIds: ['area-health-wellbeing', 'area-education-culture'],
    projectId: 'project-kap-covid-students-2021',
  },
  {
    ...base,
    id: 'pub-kumar-covid-economic-health-2020',
    slug: 'addressing-economic-health-challenges-covid-19-bangladesh-2020',
    publishedAt: '2020-01-01T00:00:00.000Z',
    title:
      'Addressing Economic and Health Challenges of COVID-19 in Bangladesh: Preparation and Response',
    type: 'journal',
    authors: ['Kumar, B.', 'Pinky, S. D.'],
    year: 2020,
    venue: 'Journal of Public Affairs',
    pages: 'e2556',
    citation:
      'Kumar, B. and Pinky, S. D. (2020). Addressing Economic and Health Challenges of COVID-19 in Bangladesh: Preparation and Response. Journal of Public Affairs, e2556.',
    abstract:
      'Assessment of Bangladesh’s preparation and response to the economic and health challenges of COVID-19.',
    areaIds: ['area-health-wellbeing', 'area-economics-sustainability'],
    projectId: 'project-covid-economic-health-2020',
  },
  {
    ...base,
    id: 'pub-awal-job-satisfaction-banks-2020',
    slug: 'employees-job-satisfaction-turnover-private-banks-bangladesh-2020',
    publishedAt: '2020-01-01T00:00:00.000Z',
    title:
      'Employees’ Job Satisfaction, Job Alternatives, and Turnover Intention: Evidence from Private Banks, Bangladesh',
    type: 'journal',
    authors: [
      'Awal, M. R.',
      'Kumar, B.',
      'Saha, P.',
      'Saha, A.',
    ],
    year: 2020,
    venue: 'Economic Insights- Trends and Challenges',
    volume: '9',
    issue: '3',
    pages: '67-75',
    citation:
      'Awal, M. R., Kumar, B., Saha, P. and Saha, A. (2020). Employees’ Job Satisfaction, Job Alternatives, and Turnover Intention: Evidence from Private Banks, Bangladesh. Economic Insights- Trends and Challenges, 9(3): 67-75.',
    abstract:
      'Evidence on job satisfaction, alternatives, and turnover intention among private bank employees in Bangladesh.',
    areaIds: ['area-business-technology'],
    projectId: 'project-job-satisfaction-banks-2020',
  },
  {
    ...base,
    id: 'pub-meo-unemployment-governance-poverty-2020',
    slug: 'impact-of-unemployment-and-governance-on-poverty-in-pakistan',
    publishedAt: '2020-01-01T00:00:00.000Z',
    title:
      'Impact of Unemployment and Governance on Poverty in Pakistan: a Fresh Insight from Non-linear ARDL Co-integration Approach',
    type: 'journal',
    authors: [
      'Meo, M. S.',
      'Kumar, B.',
      'Chughtai, S.',
      'Khan, V. J.',
      'Dost, M. K. B.',
      'Nisar, Q. A.',
    ],
    year: 2020,
    venue: 'Global Business Review',
    pages: '1-18',
    citation:
      'Meo, M. S., Kumar, B., Chughtai, S., Khan, V. J., Dost, M. K. B. and Nisar, Q. A. (2020). Impact of Unemployment and Governance on Poverty in Pakistan: a Fresh Insight from Non-linear ARDL Co-integration Approach. Global Business Review, 1-18.',
    abstract:
      'Non-linear ARDL co-integration analysis of unemployment, governance, and poverty in Pakistan.',
    areaIds: ['area-economics-sustainability', 'area-society-politics'],
    projectId: 'project-unemployment-governance-poverty-pakistan',
  },
  {
    ...base,
    id: 'pub-islam-kumar-social-network-loneliness-2019',
    slug: 'social-network-social-media-use-loneliness-academic-performance',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'The Relationship between Social Network, Social Media Use, Loneliness and Academic Performance: A Study among University Students in Bangladesh',
    type: 'journal',
    authors: ['Islam, M. A.', 'Kumar, B.'],
    year: 2019,
    venue: 'World of Media Journal of Russian Media and Journalism Studies',
    volume: '2019',
    issue: '4',
    pages: '25-47',
    citation:
      'Islam, M. A. and Kumar, B. (2019). The Relationship between Social Network, Social Media Use, Loneliness and Academic Performance: A Study among University Students in Bangladesh. World of Media Journal of Russian Media and Journalism Studies, 2019(4): 25-47.',
    abstract:
      'Examined relationships among social networks, social media use, loneliness, and academic performance for Bangladeshi university students.',
    areaIds: ['area-media-communication', 'area-education-culture'],
    projectId: 'project-social-network-loneliness-academic-performance',
  },
  {
    ...base,
    id: 'pub-kumar-climate-perception-2019',
    slug: 'perception-and-knowledge-on-climate-change-university-students',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'Perception and Knowledge on Climate Change: A Case Study on University Students in Bangladesh',
    type: 'journal',
    authors: [
      'Kumar, B.',
      'Asad, A. I.',
      'Chandraaroy, B.',
      'Banik, P.',
    ],
    year: 2019,
    venue: 'Journal of Atmospheric Science Research',
    volume: '2',
    issue: '3',
    pages: '17-22',
    citation:
      'Kumar, B., Asad, A. I., Chandraaroy, B. and Banik, P. (2019). Perception and Knowledge on Climate Change: A Case Study on University Students in Bangladesh. Journal of Atmospheric Science Research, 2(3): 17-22.',
    abstract:
      'Case study of climate change perception and knowledge among university students in Bangladesh.',
    areaIds: ['area-environment-climate', 'area-education-culture'],
    projectId: 'project-climate-perception-university-students',
  },
  {
    ...base,
    id: 'pub-kumar-remittances-poverty-alleviation-2019',
    slug: 'impact-of-international-remittances-on-poverty-alleviation-bangladesh',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'The Impact of International Remittances on Poverty Alleviation in Bangladesh',
    type: 'journal',
    authors: ['Kumar, B.'],
    year: 2019,
    venue: 'Remittances Review',
    volume: '4',
    issue: '1',
    pages: '67-86',
    citation:
      'Kumar, B. (2019). The Impact of International Remittances on Poverty Alleviation in Bangladesh. Remittances Review, 4(1): 67-86.',
    abstract:
      'Analyzed the impact of international remittances on poverty alleviation in Bangladesh.',
    areaIds: ['area-economics-sustainability', 'area-migration-diaspora'],
    projectId: 'project-remittances-poverty-alleviation',
  },
  {
    ...base,
    id: 'pub-kumar-remittances-poverty-welfare-cumilla-2019',
    slug: 'remittances-poverty-and-welfare-cumilla-bangladesh',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title: 'Remittances, Poverty and Welfare: Evidence from Cumilla, Bangladesh',
    type: 'journal',
    authors: ['Kumar, B.'],
    year: 2019,
    venue: 'American Journal of Data Mining and Knowledge Discovery',
    volume: '4',
    issue: '1',
    pages: '46-52',
    citation:
      'Kumar, B. (2019). Remittances, Poverty and Welfare: Evidence from Cumilla, Bangladesh. American Journal of Data Mining and Knowledge Discovery, 4(1): 46-52.',
    abstract:
      'Local evidence on remittances, poverty, and welfare from Cumilla, Bangladesh.',
    areaIds: ['area-economics-sustainability', 'area-migration-diaspora'],
    projectId: 'project-remittances-poverty-welfare-cumilla',
  },
  {
    ...base,
    id: 'pub-kumar-remittances-education-health-2019',
    slug: 'impact-of-international-remittances-education-and-health-bangladesh',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'The Impact of International Remittances Education and Health in Bangladesh',
    type: 'journal',
    authors: ['Kumar, B.'],
    year: 2019,
    venue: 'International Journal of Science and Qualitative Analysis',
    volume: '5',
    issue: '1',
    pages: '6-14',
    citation:
      'Kumar, B. (2019). The Impact of International Remittances Education and Health in Bangladesh. International Journal of Science and Qualitative Analysis, 5(1): 6-14.',
    abstract:
      'Studied remittance impacts on education and health outcomes in Bangladesh.',
    areaIds: ['area-education-culture', 'area-health-wellbeing'],
    projectId: 'project-remittances-education-health',
  },
  {
    ...base,
    id: 'pub-kumar-facebook-loneliness-2019',
    slug: 'social-network-facebook-use-and-loneliness-bangladesh',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'Social Network, Facebook Use and Loneliness: A Comparative Analysis between Public and Private University Students in Bangladesh',
    type: 'journal',
    authors: [
      'Kumar, B.',
      'Banik, P.',
      'Islam, M. A.',
    ],
    year: 2019,
    venue: 'International Journal of Psychological and Brain Science',
    volume: '4',
    issue: '2',
    pages: '20-28',
    citation:
      'Kumar, B., Banik, P. and Islam, M. A. (2019). Social Network, Facebook Use and Loneliness: A Comparative Analysis between Public and Private University Students in Bangladesh. International Journal of Psychological and Brain Science, 4(2): 20-28.',
    abstract:
      'Comparative analysis of Facebook use and loneliness across public and private university students in Bangladesh.',
    areaIds: ['area-media-communication', 'area-health-wellbeing'],
    projectId: 'project-facebook-use-loneliness',
  },
  {
    ...base,
    id: 'pub-banik-kumar-information-literacy-2019',
    slug: 'impact-of-information-literacy-skill-students-academic-performance',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      "Impact of Information Literacy Skill on Students’ Academic Performance in Bangladesh",
    type: 'journal',
    authors: ['Banik, P.', 'Kumar, B.'],
    year: 2019,
    venue: 'International Journal of European Studies',
    volume: '3',
    issue: '1',
    pages: '27-33',
    citation:
      'Banik, P. and Kumar, B. (2019). Impact of Information Literacy Skill on Students’ Academic Performance in Bangladesh. International Journal of European Studies, 3(1): 27-33.',
    abstract:
      "Assessed how information literacy skills relate to students' academic performance.",
    areaIds: ['area-education-culture'],
    projectId: 'project-information-literacy-academic-performance',
  },
  {
    ...base,
    id: 'pub-das-kumar-military-1971-2019',
    slug: 'indian-military-involvement-1971-east-pakistan',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'Indian Military Involvement in the 1971 Crisis of East-Pakistan: A Justification of Level of Analysis',
    type: 'journal',
    authors: ['Das, S.', 'Kumar, B.'],
    year: 2019,
    venue: 'American Journal of Theoretical and Applied Business',
    volume: '5',
    issue: '4',
    pages: '84-89',
    citation:
      'Das, S. and Kumar, B. (2019). Indian Military Involvement in the 1971 Crisis of East-Pakistan: A Justification of Level of Analysis. American Journal of Theoretical and Applied Business, 5(4): 84-89.',
    abstract:
      'Level-of-analysis justification of Indian military involvement in the 1971 East-Pakistan crisis.',
    areaIds: ['area-society-politics'],
    projectId: 'project-military-involvement-1971',
  },
  {
    ...base,
    id: 'pub-kumar-utilization-remittances-2018',
    slug: 'utilization-of-international-remittances-bangladesh',
    publishedAt: '2018-01-01T00:00:00.000Z',
    title: 'Utilization of International Remittances in Bangladesh',
    type: 'journal',
    authors: [
      'Kumar, B.',
      'Hossain, M. E.',
      'Osmani, M. A. G.',
    ],
    year: 2018,
    venue: 'Remittances Review',
    volume: '3',
    issue: '1',
    pages: '5-18',
    citation:
      'Kumar, B., Hossain, M. E. and Osmani, M. A. G. (2018). Utilization of International Remittances in Bangladesh. Remittances Review, 3(1): 5-18.',
    abstract:
      'Examined how international remittances are utilized in Bangladesh.',
    areaIds: ['area-economics-sustainability', 'area-migration-diaspora'],
    projectId: 'project-utilization-international-remittances',
  },
  {
    ...base,
    id: 'pub-khan-arch-mexico-2018',
    slug: 'financial-forecasting-arch-family-mexico',
    publishedAt: '2018-01-01T00:00:00.000Z',
    title:
      'Financial Forecasting by Autoregressive Conditional Heteroscedasticity (ARCH) Family: A Case of Mexico',
    type: 'journal',
    authors: [
      'Khan, V. J.',
      'Qadeer, A.',
      'Kumar B.',
    ],
    year: 2018,
    venue: 'Journal of Public Policy and Administration',
    volume: '2',
    issue: '3',
    pages: '32-39',
    citation:
      'Khan, V. J., Qadeer, A. and Kumar B. (2018). Financial Forecasting by Autoregressive Conditional Heteroscedasticity (ARCH) Family: A Case of Mexico. Journal of Public Policy and Administration, 2(3): 32-39.',
    abstract:
      'Applied ARCH-family models to financial forecasting for Mexico.',
    areaIds: ['area-business-technology', 'area-economics-sustainability'],
    projectId: 'project-financial-forecasting-arch-mexico',
  },
  {
    ...base,
    id: 'pub-fani-bank-performance-pakistan-2018',
    slug: 'impact-internal-external-factors-bank-performance-pakistan',
    publishedAt: '2018-01-01T00:00:00.000Z',
    title:
      'Impact of Internal and External Factors on Bank Performance in Pakistan',
    type: 'journal',
    authors: [
      'Fani, K. A.',
      'Khan, V. J.',
      'Kumar, B.',
      'Pk, B. K.',
    ],
    year: 2018,
    venue: 'International and Public Affairs',
    volume: '2',
    issue: '4',
    pages: '66-77',
    citation:
      'Fani, K. A., Khan, V. J., Kumar, B. and Pk, B. K. (2018). Impact of Internal and External Factors on Bank Performance in Pakistan. International and Public Affairs, 2(4): 66-77.',
    abstract:
      'Analyzed internal and external determinants of bank performance in Pakistan.',
    areaIds: ['area-business-technology', 'area-economics-sustainability'],
    projectId: 'project-bank-performance-pakistan',
  },

  // —— Book chapters ——
  {
    ...base,
    id: 'pub-jahan-talent-mobility-2025',
    slug: 'organizational-challenges-talent-mobility-bangladesh-2025',
    publishedAt: '2025-01-01T00:00:00.000Z',
    title:
      'Organizational Challenges and talent Mobility in Bangladesh: A Comparative Analysis between Pre and Post-COVID-19 Era',
    type: 'book-chapter',
    authors: [
      'Jahan, M. E.',
      'Saker, M. S.',
      'Kumar, B.',
    ],
    year: 2025,
    venue: 'Handbook of Talent Management and Learning Organizations',
    publisher: 'Taylor and Francis',
    citation:
      'Jahan, M. E., Saker, M. S. and Kumar, B. (2025). Organizational Challenges and talent Mobility in Bangladesh: A Comparative Analysis between Pre and Post-COVID-19 Era. Handbook of Talent Management and Learning Organizations. Taylor and Francis.',
    areaIds: ['area-business-technology'],
    projectId: 'project-talent-mobility-bangladesh-2025',
  },
  {
    ...base,
    id: 'pub-kumar-green-bonds-2024',
    slug: 'green-bonds-modern-portfolios-risk-return-2024',
    publishedAt: '2024-01-01T00:00:00.000Z',
    title: 'Green Bonds in Modern Portfolios: Risk‑Return Dynamics',
    type: 'book-chapter',
    authors: [
      'Kumar, B.',
      'Tiasha, A. M.',
      'Shah, A.',
      'Urbee, A. U.',
    ],
    year: 2024,
    venue:
      'Green Bonds and Sustainable Finance: The Evolution of Portfolio Management in Conventional Markets',
    publisher: 'Taylor and Francis',
    citation:
      'Kumar, B., Tiasha, A. M., Shah, A. and Urbee, A. U. (2024). Green Bonds in Modern Portfolios: Risk‑Return Dynamics. Green Bonds and Sustainable Finance: The Evolution of Portfolio Management in Conventional Markets. Taylor and Francis.',
    areaIds: ['area-economics-sustainability', 'area-business-technology'],
    projectId: 'project-green-bonds-portfolios-2024',
  },
  {
    ...base,
    id: 'pub-kumar-remittances-naogaon-igi-2020',
    slug: 'international-remittances-household-welfare-naogaon-2020',
    publishedAt: '2020-01-01T00:00:00.000Z',
    title:
      'International Remittances and Household Welfare: Evidence from Naogaon, Bangladesh',
    type: 'book-chapter',
    authors: [
      'Kumar, B.',
      'Ali, S. R.',
      'Kibria, G.',
    ],
    year: 2020,
    venue: 'Women Empowerment and Well-being for Inclusive Economic Growth',
    publisher: 'IGI Global: USA',
    citation:
      'Kumar, B., Ali, S. R. and Kibria, G. (2020). International Remittances and Household Welfare: Evidence from Naogaon, Bangladesh. Women Empowerment and Well-being for Inclusive Economic Growth. IGI Global: USA.',
    areaIds: ['area-migration-diaspora', 'area-gender-development'],
    projectId: 'project-remittances-naogaon-igi-2020',
  },
  {
    ...base,
    id: 'pub-maqsood-female-teachers-motivation-2020',
    slug: 'factors-affecting-motivation-productivity-female-university-teachers-2020',
    publishedAt: '2020-01-01T00:00:00.000Z',
    title:
      'Factors Affecting the Motivation and Productivity in the Workplace: a Case of Female University Teachers',
    type: 'book-chapter',
    authors: [
      'Maqsood, Z.',
      'Sardar, I.',
      'Kumar, B.',
    ],
    year: 2020,
    venue: 'Women Empowerment and Well-being for Inclusive Economic Growth',
    publisher: 'IGI Global: USA',
    citation:
      'Maqsood, Z., Sardar, I. and Kumar, B. (2020). Factors Affecting the Motivation and Productivity in the Workplace: a Case of Female University Teachers. Women Empowerment and Well-being for Inclusive Economic Growth. IGI Global: USA.',
    areaIds: ['area-gender-development', 'area-education-culture'],
    projectId: 'project-female-teachers-motivation-2020',
  },
  {
    ...base,
    id: 'pub-islam-kumar-nexus-social-network-igi-2019',
    slug: 'nexus-between-social-network-social-media-use-and-loneliness',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'Nexus between Social Network, Social Media Use and Loneliness: A Case Study of University Students, Bangladesh',
    type: 'book-chapter',
    authors: ['Islam, M. A.', 'Kumar, B.'],
    year: 2019,
    venue: 'Innovative Management and Business Practices in Asia',
    publisher: 'IGI Global: USA',
    citation:
      'Islam, M. A. and Kumar, B. (2019). Nexus between Social Network, Social Media Use and Loneliness: A Case Study of University Students, Bangladesh. Innovative Management and Business Practices in Asia. IGI Global: USA.',
    abstract:
      'Examined relationships among social networks, social media use, loneliness, and academic performance for Bangladeshi university students.',
    areaIds: ['area-media-communication', 'area-education-culture'],
    projectId: 'project-nexus-social-network-igi-2019',
  },

  // —— Conference papers ——
  {
    ...base,
    id: 'pub-kumar-youth-entrepreneurial-resilience-2026',
    slug: 'youth-entrepreneurial-resilience-digital-transformation-bangladesh-2026',
    publishedAt: '2026-05-01T00:00:00.000Z',
    title:
      'From Disruption to Digital Transformation: Evidence on Youth Entrepreneurial Resilience and Business Adaptation in Bangladesh during COVID-19',
    type: 'conference',
    authors: ['Bezon Kumar'],
    year: 2026,
    venue:
      'The Quest International Conference on Business, Technology, and Hospitality for Sustainable Future (QICBTH-SF 2026), Quest International College, Kathmandu, Nepal',
    citation:
      'Bezon Kumar (01 to 02 May 2026). From Disruption to Digital Transformation: Evidence on Youth Entrepreneurial Resilience and Business Adaptation in Bangladesh during COVID-19. The Quest International Conference on Business, Technology, and Hospitality for Sustainable Future (QICBTH-SF 2026), Quest International College, Kathmandu, Nepal.',
    areaIds: ['area-business-technology', 'area-economics-sustainability'],
    projectId: 'project-youth-entrepreneurial-resilience-2026',
  },
  {
    ...base,
    id: 'pub-kumar-char-land-livelihood-icbe-2025',
    slug: 'livelihood-impacts-climate-change-char-land-dwellers-icbe-2025',
    publishedAt: '2025-09-01T00:00:00.000Z',
    title:
      'The Livelihood Impacts of Climate Change and Coping Mechanisms of Forced Displaced Char Land Dwellers in Bangladesh',
    type: 'conference',
    authors: ['Bezon Kumar'],
    year: 2025,
    venue:
      'The International Conference on Behavioural Economics (ICBE 2025), Department of Economics, CHRIST (Deemed to be University), Bangalore, India',
    citation:
      'Bezon Kumar (01 to 03 September 2025). The Livelihood Impacts of Climate Change and Coping Mechanisms of Forced Displaced Char Land Dwellers in Bangladesh. The International Conference on Behavioural Economics (ICBE 2025), Department of Economics, CHRIST (Deemed to be University), Bangalore, India.',
    areaIds: ['area-environment-climate', 'area-migration-diaspora'],
    projectId: 'project-char-land-livelihood-icbe-2025',
  },
  {
    ...base,
    id: 'pub-kumar-information-literacy-triggers-2024',
    slug: 'what-triggers-information-literacy-skill-bangladesh-2024',
    publishedAt: '2024-06-06T00:00:00.000Z',
    title:
      'What Triggers Information Literacy Skill? Insights from University Students in Bangladesh',
    type: 'conference',
    authors: ['Kumar, B.'],
    year: 2024,
    venue:
      '2nd International Conference on the Art of Social Changes, Rabindra University, Bangladesh',
    citation:
      'Kumar, B. (06-08 June 2024). What Triggers Information Literacy Skill? Insights from University Students in Bangladesh. 2nd International Conference on the Art of Social Changes, Rabindra University, Bangladesh.',
    areaIds: ['area-education-culture'],
    projectId: 'project-information-literacy-triggers-2024',
  },
  {
    ...base,
    id: 'pub-kumar-remittances-wellbeing-bisr-2024',
    slug: 'international-remittances-household-wellbeing-rural-bangladesh-2024',
    publishedAt: '2024-01-27T00:00:00.000Z',
    title:
      'International Remittances and Household Wellbeing: Evidence from Rural Bangladesh',
    type: 'conference',
    authors: ['Kumar, B.'],
    year: 2024,
    venue:
      '8th Annual Conference on Social Science Research in Bangladesh, BISR, Dhaka, Bangladesh',
    citation:
      'Kumar, B. (27 January 2024). International Remittances and Household Wellbeing: Evidence from Rural Bangladesh. 8th Annual Conference on Social Science Research in Bangladesh, BISR, Dhaka, Bangladesh.',
    areaIds: ['area-migration-diaspora', 'area-economics-sustainability'],
    projectId: 'project-remittances-wellbeing-bisr-2024',
  },
  {
    ...base,
    id: 'pub-kumar-child-marriage-cedcon-2023',
    slug: 'nexus-child-marriage-domestic-violence-sirajganj-cedcon-2023',
    publishedAt: '2023-09-21T00:00:00.000Z',
    title:
      'Nexus between Child Marriage and Domestic Violence: Evidence from Sirajganj, Bangladesh',
    type: 'conference',
    authors: ['Kumar, B.'],
    year: 2023,
    venue:
      "CEDCON’s Annual International Conference in Economics, Tribhuvan University, Nepal",
    citation:
      'Kumar, B. (21-23 September 2023). Nexus between Child Marriage and Domestic Violence: Evidence from Sirajganj, Bangladesh. CEDCON’s Annual International Conference in Economics, Tribhuvan University, Nepal.',
    areaIds: ['area-gender-development', 'area-society-politics'],
    projectId: 'project-child-marriage-cedcon-2023',
  },
  {
    ...base,
    id: 'pub-kumar-covid-vulnerable-rabindra-2023',
    slug: 'assessing-impact-covid-19-vulnerable-populations-bangladesh-2023',
    publishedAt: '2023-06-15T00:00:00.000Z',
    title:
      'Assessing the Impact of COVID-19 Pandemic on Vulnerable Populations in Bangladesh',
    type: 'conference',
    authors: ['Kumar, B.'],
    year: 2023,
    venue:
      '1st International Conference on the Art of Social Changes, Rabindra University, Bangladesh',
    citation:
      'Kumar, B. (15-17 June 2023). Assessing the Impact of COVID-19 Pandemic on Vulnerable Populations in Bangladesh. 1st International Conference on the Art of Social Changes, Rabindra University, Bangladesh.',
    areaIds: ['area-health-wellbeing'],
    projectId: 'project-covid-vulnerable-rabindra-2023',
  },
  {
    ...base,
    id: 'pub-kumar-child-marriage-gccy-2023',
    slug: 'nexus-child-marriage-domestic-violence-gccy-cambridge-2023',
    publishedAt: '2023-06-02T00:00:00.000Z',
    title:
      'Nexus between Child Marriage and Domestic Violence: Evidence from Sirajganj, Bangladesh',
    type: 'conference',
    authors: ['Kumar, B.'],
    year: 2023,
    venue: 'Organized by GCCY, Cambridge, UK',
    citation:
      'Kumar, B. (02-04 June 2023). Nexus between Child Marriage and Domestic Violence: Evidence from Sirajganj, Bangladesh. Organized by GCCY, Cambridge, UK.',
    areaIds: ['area-gender-development', 'area-society-politics'],
    projectId: 'project-child-marriage-gccy-2023',
  },
  {
    ...base,
    id: 'pub-kumar-sti-knowledge-bimsscon-2020',
    slug: 'factors-affecting-knowledge-sexually-transmitted-infections-2020',
    publishedAt: '2020-01-01T00:00:00.000Z',
    title:
      'Factors affecting people’s knowledge about sexually transmitted infections: evidence from the developing countries',
    type: 'conference',
    authors: ['Kumar, B.', 'Pinky, S. D.'],
    year: 2020,
    venue:
      "Bangladesh International Medical Students' Scientific Congress BIMSSCON, Dhaka, Bangladesh",
    citation:
      "Kumar, B., Pinky, S. D. (2020). Factors affecting people’s knowledge about sexually transmitted infections: evidence from the developing countries. Bangladesh International Medical Students' Scientific Congress BIMSSCON, Dhaka, Bangladesh.",
    areaIds: ['area-health-wellbeing'],
    projectId: 'project-sti-knowledge-bimsscon-2020',
  },
  {
    ...base,
    id: 'pub-kumar-social-media-addiction-acstm-2021',
    slug: 'impact-social-media-addiction-mental-health-academic-performance-2021',
    publishedAt: '2021-11-20T00:00:00.000Z',
    title:
      'Impact of Social Media Addiction on Mental Health and Academic Performance of University Students in Bangladesh',
    type: 'conference',
    authors: ['Kumar, B.'],
    year: 2021,
    venue:
      '4th Asian Conference on Science, Technology, and Medicine (ACSTM) organized by ACSE, Dubai, UAE',
    citation:
      'Kumar, B. (20-21 November, 2021). Impact of Social Media Addiction on Mental Health and Academic Performance of University Students in Bangladesh. 4th Asian Conference on Science, Technology, and Medicine (ACSTM) organized by ACSE, Dubai, UAE.',
    areaIds: ['area-media-communication', 'area-health-wellbeing'],
    projectId: 'project-social-media-addiction-acstm-2021',
  },
  {
    ...base,
    id: 'pub-kumar-seminar-climate-icpad-2020',
    slug: 'impact-of-seminar-on-students-perception-climate-change-icpad-2020',
    publishedAt: '2020-02-05T00:00:00.000Z',
    title:
      "Impact of Seminar on Students’ Perception about Climate Change: A Case Study of Rabindra University, Bangladesh",
    type: 'conference',
    authors: ['Kumar, B.', 'Chandraaroy, B.'],
    year: 2020,
    venue:
      '7th International Conference on Public Administration and Development (ICPAD) Social Science Research in Bangladesh, BPATC, Dhaka, Bangladesh',
    citation:
      "Kumar, B. and Chandraaroy, B. (05-08 February, 2020). Impact of Seminar on Students’ Perception about Climate Change: A Case Study of Rabindra University, Bangladesh. 7th International Conference on Public Administration and Development (ICPAD) Social Science Research in Bangladesh, BPATC, Dhaka, Bangladesh.",
    areaIds: ['area-environment-climate', 'area-education-culture'],
    projectId: 'project-seminar-climate-icpad-2020',
  },
  {
    ...base,
    id: 'pub-kumar-climate-perception-conference-2019',
    slug: 'perception-knowledge-climate-change-fourth-annual-conference-2019',
    publishedAt: '2019-11-02T00:00:00.000Z',
    title:
      'Perception and Knowledge on Climate Change: A Case Study on University Students in Bangladesh',
    type: 'conference',
    authors: [
      'Kumar, B.',
      'Asad, A. I.',
      'Chandraaroy, B.',
      'Banik, P.',
    ],
    year: 2019,
    venue:
      'Fourth Annual Conference on Social Science Research in Bangladesh, BISR, Dhaka, Bangladesh',
    citation:
      'Kumar, B., Asad, A. I., Chandraaroy, B. and Banik, P. (02 November, 2019). Perception and Knowledge on Climate Change: A Case Study on University Students in Bangladesh. Fourth Annual Conference on Social Science Research in Bangladesh, BISR, Dhaka, Bangladesh.',
    abstract:
      'Case study of climate change perception and knowledge among university students in Bangladesh.',
    areaIds: ['area-environment-climate'],
    projectId: 'project-climate-perception-conference-2019',
  },

  // —— Newspaper / opinion ——
  {
    ...base,
    id: 'pub-kumar-varendra-university-asian-age-2019',
    slug: 'varendra-university-seven-years-enlightening-north-bengal-youths',
    publishedAt: '2019-03-17T00:00:00.000Z',
    title:
      'Varendra University: Seven years of enlightening the North Bengal youths',
    type: 'opinion',
    authors: ['B. Kumar'],
    year: 2019,
    venue: 'The Daily Asian Age',
    volume: '5',
    issue: '266',
    pages: '20',
    url: 'https://dailyasianage.com/news/168398/varendra-university-seven-years-of--enlightening-the-north-bengal-youths',
    citation:
      'Kumar, B. (17 March, 2019). Varendra University: Seven years of enlightening the North Bengal youths. The Daily Asian Age, 5 (266): 20.',
    areaIds: ['area-education-culture'],
  },
  {
    ...base,
    id: 'pub-kumar-probashi-aay-alokito-vor-2018',
    slug: 'probashi-aay-unnoyner-ekti-karyokori-hatiyar',
    publishedAt: '2018-12-02T00:00:00.000Z',
    title: 'Probashi Aay: Unnoyner Ekti Karyokori Hatiyar',
    type: 'opinion',
    authors: ['B. Kumar'],
    year: 2018,
    venue: 'Daily Alokito Vor',
    language: 'bn',
    citation:
      'Kumar, B. (02 December, 2018). Probashi Aay: Unnoyner Ekti Karyokori Hatiyar. Daily Alokito Vor. At Open Blog Page.',
    areaIds: ['area-economics-sustainability', 'area-migration-diaspora'],
  },
  {
    ...base,
    id: 'pub-kumar-factors-remittance-inflows-2018',
    slug: 'factors-influencing-remittance-inflows-into-bangladesh',
    publishedAt: '2018-11-14T00:00:00.000Z',
    title: 'Factors influencing remittance inflows into Bangladesh',
    type: 'opinion',
    authors: ['B. Kumar'],
    year: 2018,
    venue: 'The Daily Asian Age',
    volume: '5',
    issue: '146',
    pages: '20',
    citation:
      'Kumar, B. (14 November, 2018). Factors influencing remittance inflows into Bangladesh. The Daily Asian Age, 5 (146): 20.',
    areaIds: ['area-economics-sustainability'],
  },
  {
    ...base,
    id: 'pub-kumar-nordhaus-romer-nobel-2018',
    slug: 'why-nordhaus-and-romer-won-nobel-prize-in-economics',
    publishedAt: '2018-10-25T00:00:00.000Z',
    title: 'Why Nordhaus and Romer won Nobel Prize in economics',
    type: 'opinion',
    authors: ['B. Kumar'],
    year: 2018,
    venue: 'The Daily Asian Age',
    volume: '5',
    issue: '126',
    pages: '6',
    citation:
      'Kumar, B. (25 October, 2018). “Why Nordhaus and Romer won Nobel Prize in economics.” The Daily Asian Age, 5 (126): 6.',
    areaIds: ['area-economics-sustainability'],
  },
  {
    ...base,
    id: 'pub-kumar-international-remittances-development-2018',
    slug: 'international-remittances-one-step-ahead-towards-development',
    publishedAt: '2018-10-25T00:00:00.000Z',
    title: 'International Remittances-one step ahead towards development',
    type: 'opinion',
    authors: ['B. Kumar'],
    year: 2018,
    venue: 'The Daily Asian Age',
    volume: '5',
    issue: '126',
    pages: '20',
    citation:
      'Kumar, B. (25 October, 2018). “International Remittances-one step ahead towards development” The Daily Asian Age, 5 (126): 20.',
    areaIds: ['area-economics-sustainability', 'area-migration-diaspora'],
  },
  {
    ...base,
    id: 'pub-kumar-nobel-2017-asian-age',
    slug: 'the-story-behind-2017-nobel-prize-in-economics-asian-age',
    publishedAt: '2017-11-12T00:00:00.000Z',
    title: 'The Story behind 2017 Nobel Prize in Economics',
    type: 'opinion',
    authors: ['B. Kumar'],
    year: 2017,
    venue: 'The Daily Asian Age',
    volume: '4',
    issue: '146',
    pages: '20',
    citation:
      'Kumar, B. (12 November, 2017). “The Story behind 2017 Nobel Prize in Economics.” The Daily Asian Age, 4(146): 20.',
    areaIds: ['area-behaviour-decision', 'area-economics-sustainability'],
  },
  {
    ...base,
    id: 'pub-kumar-bangabandhu-7-march-asian-age-2017',
    slug: 'bangabandhus-7th-march-speech-part-of-world-heritage-asian-age',
    publishedAt: '2017-11-06T00:00:00.000Z',
    title: "Bangabandhu's 7th March speech: A part of world heritage",
    type: 'opinion',
    authors: ['B. Kumar'],
    year: 2017,
    venue: 'The Daily Asian Age',
    volume: '4',
    issue: '140',
    pages: '20',
    url: 'https://dailyasianage.com/news/93796/bangabandhus-7th-march-speech---a-part-world-heritage',
    citation:
      'Kumar, B. (06 November, 2017). “Bangabandhu’s 7th March speech: A part of world heritage.” The Daily Asian Age, 4(140): 20.',
    areaIds: ['area-society-politics'],
  },
  {
    ...base,
    id: 'pub-kumar-climate-bangladesh-asian-age-2017',
    slug: 'climate-change-in-bangladesh-causes-effects-suggestions-asian-age',
    publishedAt: '2017-10-23T00:00:00.000Z',
    title: 'Climate change in Bangladesh: Causes, effects and suggestions',
    type: 'opinion',
    authors: ['B. Kumar'],
    year: 2017,
    venue: 'The Daily Asian Age',
    volume: '4',
    issue: '126',
    pages: '20',
    url: 'https://dailyasianage.com/news/91661/climate-change-in-bangladesh-causes-effects-and-suggestions',
    citation:
      'Kumar, B. (23 October, 2017). “Climate change in Bangladesh: Causes, effects and suggestions.” The Daily Asian Age, 4(126): 20.',
    areaIds: ['area-environment-climate'],
  },
  {
    ...base,
    id: 'pub-kumar-remittance-mechanism-asian-age-2017',
    slug: 'remittance-an-effective-mechanism-for-development-asian-age',
    publishedAt: '2017-08-23T00:00:00.000Z',
    title: 'Remittance: an effective mechanism for development',
    type: 'opinion',
    authors: ['B. Kumar'],
    year: 2017,
    venue: 'The Daily Asian Age',
    volume: '4',
    issue: '69',
    pages: '20',
    citation:
      'Kumar, B. (23 August, 2017). “Remittance: an effective mechanism for development.” The Daily Asian Age, 4(69): 20.',
    areaIds: ['area-economics-sustainability', 'area-migration-diaspora'],
  },
];

export const publications: Publication[] = scholarlyPublications;

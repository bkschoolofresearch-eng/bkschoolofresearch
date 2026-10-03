import type { ResearchProject } from '@/types/content';

const ts = {
  status: 'published' as const,
  createdAt: '2018-01-01T00:00:00.000Z',
  updatedAt: '2026-09-19T00:00:00.000Z',
};

/**
 * Research portfolio from docs/New folder/Research.docx (exact).
 * Ongoing titles + Completed journal articles, book chapters, and conference papers.
 */

export const ongoingProjects: ResearchProject[] = [
  {
    ...ts,
    id: 'project-char-land-climate-displacement',
    slug: 'climate-change-forced-displacement-livelihood-char-land-dwellers',
    publishedAt: '2024-01-01T00:00:00.000Z',
    title:
      'Climate Change, Forced Displacement, and Livelihood: Coping Mechanisms among Char Land Dwellers in Bangladesh',
    summary:
      'Climate Change, Forced Displacement, and Livelihood: Coping Mechanisms among Char Land Dwellers in Bangladesh.',
    description:
      'Climate Change, Forced Displacement, and Livelihood: Coping Mechanisms among Char Land Dwellers in Bangladesh.',
    researchStatus: 'ongoing',
    areaIds: ['area-environment-climate', 'area-migration-diaspora'],
    leadAuthorNames: [],
    startYear: 2024,
    year: 2024,
    featuredOnResearchPage: true,
  },
  {
    ...ts,
    id: 'project-char-land-coping-drivers',
    slug: 'drivers-of-coping-mechanisms-char-land-climate-migrants',
    publishedAt: '2024-01-01T00:00:00.000Z',
    title:
      'Drivers of Coping Mechanisms among Char Land Dwellers in Bangladesh: Insights from Climate-Induced Migrant Communities in Bangladesh',
    summary:
      'Drivers of Coping Mechanisms among Char Land Dwellers in Bangladesh: Insights from Climate-Induced Migrant Communities in Bangladesh.',
    description:
      'Drivers of Coping Mechanisms among Char Land Dwellers in Bangladesh: Insights from Climate-Induced Migrant Communities in Bangladesh.',
    researchStatus: 'ongoing',
    areaIds: ['area-environment-climate', 'area-migration-diaspora'],
    leadAuthorNames: [],
    startYear: 2024,
    year: 2024,
    featuredOnResearchPage: true,
  },
  {
    ...ts,
    id: 'project-nepali-students-taiwan',
    slug: 'migration-young-nepali-students-taiwan',
    publishedAt: '2025-01-01T00:00:00.000Z',
    title:
      'Migration of Young Nepali Students in Taiwan: Motivations, Aspirations, Expectations, and Challenges',
    summary:
      'Migration of Young Nepali Students in Taiwan: Motivations, Aspirations, Expectations, and Challenges.',
    description:
      'Migration of Young Nepali Students in Taiwan: Motivations, Aspirations, Expectations, and Challenges.',
    researchStatus: 'ongoing',
    areaIds: ['area-migration-diaspora', 'area-education-culture'],
    leadAuthorNames: [],
    startYear: 2025,
    year: 2025,
    featuredOnResearchPage: true,
  },
];

export const completedProjects: ResearchProject[] = [
  {
    ...ts,
    id: 'project-remittances-rural-development-2026',
    slug: 'remittances-pathway-rural-development-bangladesh-2026',
    publishedAt: '2026-01-01T00:00:00.000Z',
    title:
      'Remittances as a pathway to rural development: micro-level evidence on household well-being and poverty reduction in Bangladesh',
    summary:
      'Kumar, B. (2026). Remittances as a pathway to rural development: micro-level evidence on household well-being and poverty reduction in Bangladesh. SN Business and Economics, 6:328.',
    description:
      'Kumar, B. (2026). Remittances as a pathway to rural development: micro-level evidence on household well-being and poverty reduction in Bangladesh. SN Business and Economics, 6:328.',
    researchStatus: 'completed',
    areaIds: ['area-economics-sustainability', 'area-migration-diaspora'],
    leadAuthorNames: ['Kumar, B.'],
    year: 2026,
    endYear: 2026,
    publicationIds: ['pub-kumar-remittances-rural-development-2026'],
    featuredOnResearchPage: true,
  },
  {
    ...ts,
    id: 'project-information-literacy-undergraduates-2026',
    slug: 'information-literacy-skills-bangladeshi-undergraduates-2026',
    publishedAt: '2026-01-01T00:00:00.000Z',
    title:
      'Information literacy skills among Bangladeshi undergraduates: measurement, determinants and the role of libraries',
    summary:
      'Banik, P, Roy, P, B. and Kumar, B (2026). Information literacy skills among Bangladeshi undergraduates: measurement, determinants and the role of libraries. Performance Measurement and Metrics, 1-29. https://doi.org/10.1108/PMM-03-2026-0025.',
    description:
      'Banik, P, Roy, P, B. and Kumar, B (2026). Information literacy skills among Bangladeshi undergraduates: measurement, determinants and the role of libraries. Performance Measurement and Metrics, 1-29. https://doi.org/10.1108/PMM-03-2026-0025.',
    researchStatus: 'completed',
    areaIds: ['area-education-culture'],
    leadAuthorNames: [
      'Banik, P',
      'Roy, P, B.',
      'Kumar, B',
    ],
    year: 2026,
    endYear: 2026,
    publicationIds: ['pub-banik-information-literacy-undergraduates-2026'],
    url: 'https://doi.org/10.1108/PMM-03-2026-0025',
  },
  {
    ...ts,
    id: 'project-climate-women-pwd-2026',
    slug: 'climate-change-impacts-coping-women-persons-with-disabilities-2026',
    publishedAt: '2026-01-01T00:00:00.000Z',
    title:
      'Climate Change Impacts and Coping Mechanisms among Women and Persons with Disabilities: Insights from Climate-Induced Migrant Communities',
    summary:
      'Kumar, B., Mimi, M. B., Ko, J., Ridwan, M., Banik, P., Rani, D., & Lee, H. F. (2026). Climate Change Impacts and Coping Mechanisms among Women and Persons with Disabilities: Insights from Climate-Induced Migrant Communities. Environment, Innovation and Management, 2, 2650011.',
    description:
      'Kumar, B., Mimi, M. B., Ko, J., Ridwan, M., Banik, P., Rani, D., & Lee, H. F. (2026). Climate Change Impacts and Coping Mechanisms among Women and Persons with Disabilities: Insights from Climate-Induced Migrant Communities. Environment, Innovation and Management, 2, 2650011.',
    researchStatus: 'completed',
    areaIds: [
      'area-environment-climate',
      'area-gender-development',
      'area-migration-diaspora',
    ],
    leadAuthorNames: [
      'Kumar, B.',
      'Mimi, M. B.',
      'Ko, J.',
      'Ridwan, M.',
      'Banik, P.',
      'Rani, D.',
      'Lee, H. F.',
    ],
    year: 2026,
    endYear: 2026,
    publicationIds: ['pub-kumar-climate-women-pwd-2026'],
  },
  {
    ...ts,
    id: 'project-ncf-2021-teachers-2026',
    slug: 'national-curriculum-framework-2021-bangladeshi-teachers-2026',
    publishedAt: '2026-01-01T00:00:00.000Z',
    title:
      "Navigating the uncharted: a phenomenological study of Bangladeshi teachers’ perceptions and experiences in implementing the National Curriculum Framework 2021",
    summary:
      'Al Galib, S., Nurudden, A. M., Sarker, T., Kumar, B., & Banik, P. (2026). Navigating the uncharted: a phenomenological study of Bangladeshi teachers’ perceptions and experiences in implementing the National Curriculum Framework 2021. Discover Education, 5(1), 248.',
    description:
      'Al Galib, S., Nurudden, A. M., Sarker, T., Kumar, B., & Banik, P. (2026). Navigating the uncharted: a phenomenological study of Bangladeshi teachers’ perceptions and experiences in implementing the National Curriculum Framework 2021. Discover Education, 5(1), 248.',
    researchStatus: 'completed',
    areaIds: ['area-education-culture'],
    leadAuthorNames: [
      'Al Galib, S.',
      'Nurudden, A. M.',
      'Sarker, T.',
      'Kumar, B.',
      'Banik, P.',
    ],
    year: 2026,
    endYear: 2026,
    publicationIds: ['pub-al-galib-ncf-teachers-2026'],
  },
  {
    ...ts,
    id: 'project-covid-rohingya-2022',
    slug: 'covid-19-rohingya-refugees-bangladesh-2022',
    publishedAt: '2022-01-01T00:00:00.000Z',
    title:
      'COVID-19 and the Rohingya Refugees in Bangladesh: Socioeconomic and Health Impacts on Women and Adolescents',
    summary:
      'Kumar, B., Pinky, S. D., Pulock, O. S., Kamal, R. S. and Aziz, R. (2022). COVID-19 and the Rohingya Refugees in Bangladesh: Socioeconomic and Health Impacts on Women and Adolescents. International Journal of Asia Pacific Studies, 18(2): 179-199.',
    description:
      'Kumar, B., Pinky, S. D., Pulock, O. S., Kamal, R. S. and Aziz, R. (2022). COVID-19 and the Rohingya Refugees in Bangladesh: Socioeconomic and Health Impacts on Women and Adolescents. International Journal of Asia Pacific Studies, 18(2): 179-199.',
    researchStatus: 'completed',
    areaIds: [
      'area-health-wellbeing',
      'area-migration-diaspora',
      'area-gender-development',
    ],
    leadAuthorNames: [
      'Kumar, B.',
      'Pinky, S. D.',
      'Pulock, O. S.',
      'Kamal, R. S.',
      'Aziz, R.',
    ],
    year: 2022,
    endYear: 2022,
    publicationIds: ['pub-kumar-covid-rohingya-2022'],
  },
  {
    ...ts,
    id: 'project-energy-growth-2022',
    slug: 'energy-consumption-economic-growth-linkage-2022',
    publishedAt: '2022-01-01T00:00:00.000Z',
    title:
      'Energy Consumption and Economic Growth Linkage: Global Evidence from Symmetric and Asymmetric Simulations',
    summary:
      'Ali, W., Nathaniel, S. P., Adikunle, I. A. and Kumar, B. (2022). Energy Consumption and Economic Growth Linkage: Global Evidence from Symmetric and Asymmetric Simulations. Quaestiones Geographicae, 41(2): 67-82.',
    description:
      'Ali, W., Nathaniel, S. P., Adikunle, I. A. and Kumar, B. (2022). Energy Consumption and Economic Growth Linkage: Global Evidence from Symmetric and Asymmetric Simulations. Quaestiones Geographicae, 41(2): 67-82.',
    researchStatus: 'completed',
    areaIds: ['area-economics-sustainability', 'area-environment-climate'],
    leadAuthorNames: [
      'Ali, W.',
      'Nathaniel, S. P.',
      'Adikunle, I. A.',
      'Kumar, B.',
    ],
    year: 2022,
    endYear: 2022,
    publicationIds: ['pub-ali-energy-growth-2022'],
  },
  {
    ...ts,
    id: 'project-kap-covid-students-2021',
    slug: 'knowledge-attitudes-practices-covid-19-students-bangladesh-2021',
    publishedAt: '2021-01-01T00:00:00.000Z',
    title:
      'Knowledge, Attitudes and Practices towards COVID-19 Guidelines among Students in Bangladesh',
    summary:
      'Kumar, B., Pinky, S. D. and Nurudden, A. M. (2021). Knowledge, Attitudes and Practices towards COVID-19 Guidelines among Students in Bangladesh. Social Sciences and Humanities Open, 4(1): 100194.',
    description:
      'Kumar, B., Pinky, S. D. and Nurudden, A. M. (2021). Knowledge, Attitudes and Practices towards COVID-19 Guidelines among Students in Bangladesh. Social Sciences and Humanities Open, 4(1): 100194.',
    researchStatus: 'completed',
    areaIds: ['area-health-wellbeing', 'area-education-culture'],
    leadAuthorNames: [
      'Kumar, B.',
      'Pinky, S. D.',
      'Nurudden, A. M.',
    ],
    year: 2021,
    endYear: 2021,
    publicationIds: ['pub-kumar-kap-covid-students-2021'],
  },
  {
    ...ts,
    id: 'project-covid-economic-health-2020',
    slug: 'addressing-economic-health-challenges-covid-19-bangladesh-2020',
    publishedAt: '2020-01-01T00:00:00.000Z',
    title:
      'Addressing Economic and Health Challenges of COVID-19 in Bangladesh: Preparation and Response',
    summary:
      'Kumar, B. and Pinky, S. D. (2020). Addressing Economic and Health Challenges of COVID-19 in Bangladesh: Preparation and Response. Journal of Public Affairs, e2556.',
    description:
      'Kumar, B. and Pinky, S. D. (2020). Addressing Economic and Health Challenges of COVID-19 in Bangladesh: Preparation and Response. Journal of Public Affairs, e2556.',
    researchStatus: 'completed',
    areaIds: ['area-health-wellbeing', 'area-economics-sustainability'],
    leadAuthorNames: ['Kumar, B.', 'Pinky, S. D.'],
    year: 2020,
    endYear: 2020,
    publicationIds: ['pub-kumar-covid-economic-health-2020'],
  },
  {
    ...ts,
    id: 'project-job-satisfaction-banks-2020',
    slug: 'employees-job-satisfaction-turnover-private-banks-bangladesh-2020',
    publishedAt: '2020-01-01T00:00:00.000Z',
    title:
      'Employees’ Job Satisfaction, Job Alternatives, and Turnover Intention: Evidence from Private Banks, Bangladesh',
    summary:
      'Awal, M. R., Kumar, B., Saha, P. and Saha, A. (2020). Employees’ Job Satisfaction, Job Alternatives, and Turnover Intention: Evidence from Private Banks, Bangladesh. Economic Insights- Trends and Challenges, 9(3): 67-75.',
    description:
      'Awal, M. R., Kumar, B., Saha, P. and Saha, A. (2020). Employees’ Job Satisfaction, Job Alternatives, and Turnover Intention: Evidence from Private Banks, Bangladesh. Economic Insights- Trends and Challenges, 9(3): 67-75.',
    researchStatus: 'completed',
    areaIds: ['area-business-technology'],
    leadAuthorNames: [
      'Awal, M. R.',
      'Kumar, B.',
      'Saha, P.',
      'Saha, A.',
    ],
    year: 2020,
    endYear: 2020,
    publicationIds: ['pub-awal-job-satisfaction-banks-2020'],
  },
  {
    ...ts,
    id: 'project-unemployment-governance-poverty-pakistan',
    slug: 'unemployment-governance-and-poverty-in-pakistan',
    publishedAt: '2020-01-01T00:00:00.000Z',
    title:
      'Impact of Unemployment and Governance on Poverty in Pakistan: a Fresh Insight from Non-linear ARDL Co-integration Approach',
    summary:
      'Meo, M. S., Kumar, B., Chughtai, S., Khan, V. J., Dost, M. K. B. and Nisar, Q. A. (2020). Impact of Unemployment and Governance on Poverty in Pakistan: a Fresh Insight from Non-linear ARDL Co-integration Approach. Global Business Review, 1-18.',
    description:
      'Meo, M. S., Kumar, B., Chughtai, S., Khan, V. J., Dost, M. K. B. and Nisar, Q. A. (2020). Impact of Unemployment and Governance on Poverty in Pakistan: a Fresh Insight from Non-linear ARDL Co-integration Approach. Global Business Review, 1-18.',
    researchStatus: 'completed',
    areaIds: ['area-economics-sustainability', 'area-society-politics'],
    leadAuthorNames: [
      'Meo, M. S.',
      'Kumar, B.',
      'Chughtai, S.',
      'Khan, V. J.',
      'Dost, M. K. B.',
      'Nisar, Q. A.',
    ],
    year: 2020,
    endYear: 2020,
    publicationIds: ['pub-meo-unemployment-governance-poverty-2020'],
  },
  {
    ...ts,
    id: 'project-social-network-loneliness-academic-performance',
    slug: 'social-network-loneliness-and-academic-performance',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'The Relationship between Social Network, Social Media Use, Loneliness and Academic Performance: A Study among University Students in Bangladesh',
    summary:
      'Islam, M. A. and Kumar, B. (2019). The Relationship between Social Network, Social Media Use, Loneliness and Academic Performance: A Study among University Students in Bangladesh. World of Media Journal of Russian Media and Journalism Studies, 2019(4): 25-47.',
    description:
      'Islam, M. A. and Kumar, B. (2019). The Relationship between Social Network, Social Media Use, Loneliness and Academic Performance: A Study among University Students in Bangladesh. World of Media Journal of Russian Media and Journalism Studies, 2019(4): 25-47.',
    researchStatus: 'completed',
    areaIds: ['area-media-communication', 'area-education-culture'],
    leadAuthorNames: ['Islam, M. A.', 'Kumar, B.'],
    year: 2019,
    endYear: 2019,
    publicationIds: [
      'pub-islam-kumar-social-network-loneliness-2019',
    ],
  },
  {
    ...ts,
    id: 'project-climate-perception-university-students',
    slug: 'perception-and-knowledge-on-climate-change-university-students',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'Perception and Knowledge on Climate Change: A Case Study on University Students in Bangladesh',
    summary:
      'Kumar, B., Asad, A. I., Chandraaroy, B. and Banik, P. (2019). Perception and Knowledge on Climate Change: A Case Study on University Students in Bangladesh. Journal of Atmospheric Science Research, 2(3): 17-22.',
    description:
      'Kumar, B., Asad, A. I., Chandraaroy, B. and Banik, P. (2019). Perception and Knowledge on Climate Change: A Case Study on University Students in Bangladesh. Journal of Atmospheric Science Research, 2(3): 17-22.',
    researchStatus: 'completed',
    areaIds: ['area-environment-climate', 'area-education-culture'],
    leadAuthorNames: [
      'Kumar, B.',
      'Asad, A. I.',
      'Chandraaroy, B.',
      'Banik, P.',
    ],
    year: 2019,
    endYear: 2019,
    publicationIds: [
      'pub-kumar-climate-perception-2019',
    ],
  },
  {
    ...ts,
    id: 'project-remittances-poverty-alleviation',
    slug: 'international-remittances-and-poverty-alleviation-bangladesh',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'The Impact of International Remittances on Poverty Alleviation in Bangladesh',
    summary:
      'Kumar, B. (2019). The Impact of International Remittances on Poverty Alleviation in Bangladesh. Remittances Review, 4(1): 67-86.',
    description:
      'Kumar, B. (2019). The Impact of International Remittances on Poverty Alleviation in Bangladesh. Remittances Review, 4(1): 67-86.',
    researchStatus: 'completed',
    areaIds: ['area-economics-sustainability', 'area-migration-diaspora'],
    leadAuthorNames: ['Kumar, B.'],
    year: 2019,
    endYear: 2019,
    publicationIds: ['pub-kumar-remittances-poverty-alleviation-2019'],
  },
  {
    ...ts,
    id: 'project-remittances-poverty-welfare-cumilla',
    slug: 'remittances-poverty-and-welfare-cumilla',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title: 'Remittances, Poverty and Welfare: Evidence from Cumilla, Bangladesh',
    summary:
      'Kumar, B. (2019). Remittances, Poverty and Welfare: Evidence from Cumilla, Bangladesh. American Journal of Data Mining and Knowledge Discovery, 4(1): 46-52.',
    description:
      'Kumar, B. (2019). Remittances, Poverty and Welfare: Evidence from Cumilla, Bangladesh. American Journal of Data Mining and Knowledge Discovery, 4(1): 46-52.',
    researchStatus: 'completed',
    areaIds: ['area-economics-sustainability', 'area-migration-diaspora'],
    leadAuthorNames: ['Kumar, B.'],
    year: 2019,
    endYear: 2019,
    publicationIds: ['pub-kumar-remittances-poverty-welfare-cumilla-2019'],
  },
  {
    ...ts,
    id: 'project-remittances-education-health',
    slug: 'international-remittances-education-and-health-bangladesh',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'The Impact of International Remittances Education and Health in Bangladesh',
    summary:
      'Kumar, B. (2019). The Impact of International Remittances Education and Health in Bangladesh. International Journal of Science and Qualitative Analysis, 5(1): 6-14.',
    description:
      'Kumar, B. (2019). The Impact of International Remittances Education and Health in Bangladesh. International Journal of Science and Qualitative Analysis, 5(1): 6-14.',
    researchStatus: 'completed',
    areaIds: ['area-education-culture', 'area-health-wellbeing'],
    leadAuthorNames: ['Kumar, B.'],
    year: 2019,
    endYear: 2019,
    publicationIds: ['pub-kumar-remittances-education-health-2019'],
  },
  {
    ...ts,
    id: 'project-facebook-use-loneliness',
    slug: 'facebook-use-and-loneliness-public-private-universities',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'Social Network, Facebook Use and Loneliness: A Comparative Analysis between Public and Private University Students in Bangladesh',
    summary:
      'Kumar, B., Banik, P. and Islam, M. A. (2019). Social Network, Facebook Use and Loneliness: A Comparative Analysis between Public and Private University Students in Bangladesh. International Journal of Psychological and Brain Science, 4(2): 20-28.',
    description:
      'Kumar, B., Banik, P. and Islam, M. A. (2019). Social Network, Facebook Use and Loneliness: A Comparative Analysis between Public and Private University Students in Bangladesh. International Journal of Psychological and Brain Science, 4(2): 20-28.',
    researchStatus: 'completed',
    areaIds: ['area-media-communication', 'area-health-wellbeing'],
    leadAuthorNames: [
      'Kumar, B.',
      'Banik, P.',
      'Islam, M. A.',
    ],
    year: 2019,
    endYear: 2019,
    publicationIds: ['pub-kumar-facebook-loneliness-2019'],
  },
  {
    ...ts,
    id: 'project-information-literacy-academic-performance',
    slug: 'information-literacy-and-academic-performance',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      "Impact of Information Literacy Skill on Students’ Academic Performance in Bangladesh",
    summary:
      "Assessed how information literacy skills relate to students' academic performance.",
    description:
      'Banik, P. and Kumar, B. (2019). Impact of Information Literacy Skill on Students’ Academic Performance in Bangladesh. International Journal of European Studies, 3(1): 27-33.',
    researchStatus: 'completed',
    areaIds: ['area-education-culture'],
    leadAuthorNames: ['Banik, P.', 'Kumar, B.'],
    year: 2019,
    endYear: 2019,
    publicationIds: ['pub-banik-kumar-information-literacy-2019'],
  },
  {
    ...ts,
    id: 'project-military-involvement-1971',
    slug: 'indian-military-involvement-1971-east-pakistan',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'Indian Military Involvement in the 1971 Crisis of East-Pakistan: A Justification of Level of Analysis',
    summary:
      'Das, S. and Kumar, B. (2019). Indian Military Involvement in the 1971 Crisis of East-Pakistan: A Justification of Level of Analysis. American Journal of Theoretical and Applied Business, 5(4): 84-89.',
    description:
      'Das, S. and Kumar, B. (2019). Indian Military Involvement in the 1971 Crisis of East-Pakistan: A Justification of Level of Analysis. American Journal of Theoretical and Applied Business, 5(4): 84-89.',
    researchStatus: 'completed',
    areaIds: ['area-society-politics'],
    leadAuthorNames: ['Das, S.', 'Kumar, B.'],
    year: 2019,
    endYear: 2019,
    publicationIds: ['pub-das-kumar-military-1971-2019'],
  },
  {
    ...ts,
    id: 'project-utilization-international-remittances',
    slug: 'utilization-of-international-remittances-bangladesh',
    publishedAt: '2018-01-01T00:00:00.000Z',
    title: 'Utilization of International Remittances in Bangladesh',
    summary:
      'Kumar, B., Hossain, M. E. and Osmani, M. A. G. (2018). Utilization of International Remittances in Bangladesh. Remittances Review, 3(1): 5-18.',
    description:
      'Kumar, B., Hossain, M. E. and Osmani, M. A. G. (2018). Utilization of International Remittances in Bangladesh. Remittances Review, 3(1): 5-18.',
    researchStatus: 'completed',
    areaIds: ['area-economics-sustainability', 'area-migration-diaspora'],
    leadAuthorNames: [
      'Kumar, B.',
      'Hossain, M. E.',
      'Osmani, M. A. G.',
    ],
    year: 2018,
    endYear: 2018,
    publicationIds: ['pub-kumar-utilization-remittances-2018'],
  },
  {
    ...ts,
    id: 'project-financial-forecasting-arch-mexico',
    slug: 'financial-forecasting-arch-family-mexico',
    publishedAt: '2018-01-01T00:00:00.000Z',
    title:
      'Financial Forecasting by Autoregressive Conditional Heteroscedasticity (ARCH) Family: A Case of Mexico',
    summary:
      'Khan, V. J., Qadeer, A. and Kumar B. (2018). Financial Forecasting by Autoregressive Conditional Heteroscedasticity (ARCH) Family: A Case of Mexico. Journal of Public Policy and Administration, 2(3): 32-39.',
    description:
      'Khan, V. J., Qadeer, A. and Kumar B. (2018). Financial Forecasting by Autoregressive Conditional Heteroscedasticity (ARCH) Family: A Case of Mexico. Journal of Public Policy and Administration, 2(3): 32-39.',
    researchStatus: 'completed',
    areaIds: ['area-business-technology', 'area-economics-sustainability'],
    leadAuthorNames: [
      'Khan, V. J.',
      'Qadeer, A.',
      'Kumar B.',
    ],
    year: 2018,
    endYear: 2018,
    publicationIds: ['pub-khan-arch-mexico-2018'],
  },
  {
    ...ts,
    id: 'project-bank-performance-pakistan',
    slug: 'internal-external-factors-bank-performance-pakistan',
    publishedAt: '2018-01-01T00:00:00.000Z',
    title:
      'Impact of Internal and External Factors on Bank Performance in Pakistan',
    summary:
      'Fani, K. A., Khan, V. J., Kumar, B. and Pk, B. K. (2018). Impact of Internal and External Factors on Bank Performance in Pakistan. International and Public Affairs, 2(4): 66-77.',
    description:
      'Fani, K. A., Khan, V. J., Kumar, B. and Pk, B. K. (2018). Impact of Internal and External Factors on Bank Performance in Pakistan. International and Public Affairs, 2(4): 66-77.',
    researchStatus: 'completed',
    areaIds: ['area-business-technology', 'area-economics-sustainability'],
    leadAuthorNames: [
      'Fani, K. A.',
      'Khan, V. J.',
      'Kumar, B.',
      'Pk, B. K.',
    ],
    year: 2018,
    endYear: 2018,
    publicationIds: ['pub-fani-bank-performance-pakistan-2018'],
  },
];

/** Completed (Book Chapters) — exact citations from Research.docx */
export const completedBookChapters: ResearchProject[] = [
  {
    ...ts,
    id: 'project-talent-mobility-bangladesh-2025',
    slug: 'organizational-challenges-talent-mobility-bangladesh-2025',
    publishedAt: '2025-01-01T00:00:00.000Z',
    title:
      'Organizational Challenges and talent Mobility in Bangladesh: A Comparative Analysis between Pre and Post-COVID-19 Era',
    summary:
      'Jahan, M. E., Saker, M. S. and Kumar, B. (2025). Organizational Challenges and talent Mobility in Bangladesh: A Comparative Analysis between Pre and Post-COVID-19 Era. Handbook of Talent Management and Learning Organizations. Taylor and Francis.',
    description:
      'Jahan, M. E., Saker, M. S. and Kumar, B. (2025). Organizational Challenges and talent Mobility in Bangladesh: A Comparative Analysis between Pre and Post-COVID-19 Era. Handbook of Talent Management and Learning Organizations. Taylor and Francis.',
    researchStatus: 'completed',
    areaIds: ['area-business-technology'],
    leadAuthorNames: ['Jahan, M. E.', 'Saker, M. S.', 'Kumar, B.'],
    year: 2025,
    endYear: 2025,
    publicationIds: ['pub-jahan-talent-mobility-2025'],
  },
  {
    ...ts,
    id: 'project-green-bonds-portfolios-2024',
    slug: 'green-bonds-modern-portfolios-risk-return-2024',
    publishedAt: '2024-01-01T00:00:00.000Z',
    title: 'Green Bonds in Modern Portfolios: Risk‑Return Dynamics',
    summary:
      'Kumar, B., Tiasha, A. M., Shah, A. and Urbee, A. U. (2024). Green Bonds in Modern Portfolios: Risk‑Return Dynamics. Green Bonds and Sustainable Finance: The Evolution of Portfolio Management in Conventional Markets. Taylor and Francis.',
    description:
      'Kumar, B., Tiasha, A. M., Shah, A. and Urbee, A. U. (2024). Green Bonds in Modern Portfolios: Risk‑Return Dynamics. Green Bonds and Sustainable Finance: The Evolution of Portfolio Management in Conventional Markets. Taylor and Francis.',
    researchStatus: 'completed',
    areaIds: ['area-economics-sustainability', 'area-business-technology'],
    leadAuthorNames: [
      'Kumar, B.',
      'Tiasha, A. M.',
      'Shah, A.',
      'Urbee, A. U.',
    ],
    year: 2024,
    endYear: 2024,
    publicationIds: ['pub-kumar-green-bonds-2024'],
  },
  {
    ...ts,
    id: 'project-remittances-naogaon-igi-2020',
    slug: 'international-remittances-household-welfare-naogaon-2020',
    publishedAt: '2020-01-01T00:00:00.000Z',
    title:
      'International Remittances and Household Welfare: Evidence from Naogaon, Bangladesh',
    summary:
      'Kumar, B., Ali, S. R. and Kibria, G. (2020). International Remittances and Household Welfare: Evidence from Naogaon, Bangladesh. Women Empowerment and Well-being for Inclusive Economic Growth. IGI Global: USA.',
    description:
      'Kumar, B., Ali, S. R. and Kibria, G. (2020). International Remittances and Household Welfare: Evidence from Naogaon, Bangladesh. Women Empowerment and Well-being for Inclusive Economic Growth. IGI Global: USA.',
    researchStatus: 'completed',
    areaIds: ['area-migration-diaspora', 'area-gender-development'],
    leadAuthorNames: ['Kumar, B.', 'Ali, S. R.', 'Kibria, G.'],
    year: 2020,
    endYear: 2020,
    publicationIds: ['pub-kumar-remittances-naogaon-igi-2020'],
  },
  {
    ...ts,
    id: 'project-female-teachers-motivation-2020',
    slug: 'factors-affecting-motivation-productivity-female-university-teachers-2020',
    publishedAt: '2020-01-01T00:00:00.000Z',
    title:
      'Factors Affecting the Motivation and Productivity in the Workplace: a Case of Female University Teachers',
    summary:
      'Maqsood, Z., Sardar, I. and Kumar, B. (2020). Factors Affecting the Motivation and Productivity in the Workplace: a Case of Female University Teachers. Women Empowerment and Well-being for Inclusive Economic Growth. IGI Global: USA.',
    description:
      'Maqsood, Z., Sardar, I. and Kumar, B. (2020). Factors Affecting the Motivation and Productivity in the Workplace: a Case of Female University Teachers. Women Empowerment and Well-being for Inclusive Economic Growth. IGI Global: USA.',
    researchStatus: 'completed',
    areaIds: ['area-gender-development', 'area-education-culture'],
    leadAuthorNames: ['Maqsood, Z.', 'Sardar, I.', 'Kumar, B.'],
    year: 2020,
    endYear: 2020,
    publicationIds: ['pub-maqsood-female-teachers-motivation-2020'],
  },
  {
    ...ts,
    id: 'project-nexus-social-network-igi-2019',
    slug: 'nexus-between-social-network-social-media-use-and-loneliness-igi-2019',
    publishedAt: '2019-01-01T00:00:00.000Z',
    title:
      'Nexus between Social Network, Social Media Use and Loneliness: A Case Study of University Students, Bangladesh',
    summary:
      'Islam, M. A. and Kumar, B. (2019). Nexus between Social Network, Social Media Use and Loneliness: A Case Study of University Students, Bangladesh. Innovative Management and Business Practices in Asia. IGI Global: USA.',
    description:
      'Islam, M. A. and Kumar, B. (2019). Nexus between Social Network, Social Media Use and Loneliness: A Case Study of University Students, Bangladesh. Innovative Management and Business Practices in Asia. IGI Global: USA.',
    researchStatus: 'completed',
    areaIds: ['area-media-communication', 'area-education-culture'],
    leadAuthorNames: ['Islam, M. A.', 'Kumar, B.'],
    year: 2019,
    endYear: 2019,
    publicationIds: ['pub-islam-kumar-nexus-social-network-igi-2019'],
  },
];

/** Conference Papers — exact citations from Research.docx */
export const completedConferencePapers: ResearchProject[] = [
  {
    ...ts,
    id: 'project-youth-entrepreneurial-resilience-2026',
    slug: 'youth-entrepreneurial-resilience-digital-transformation-bangladesh-2026',
    publishedAt: '2026-05-01T00:00:00.000Z',
    title:
      'From Disruption to Digital Transformation: Evidence on Youth Entrepreneurial Resilience and Business Adaptation in Bangladesh during COVID-19',
    summary:
      'Bezon Kumar (01 to 02 May 2026). From Disruption to Digital Transformation: Evidence on Youth Entrepreneurial Resilience and Business Adaptation in Bangladesh during COVID-19. The Quest International Conference on Business, Technology, and Hospitality for Sustainable Future (QICBTH-SF 2026), Quest International College, Kathmandu, Nepal.',
    description:
      'Bezon Kumar (01 to 02 May 2026). From Disruption to Digital Transformation: Evidence on Youth Entrepreneurial Resilience and Business Adaptation in Bangladesh during COVID-19. The Quest International Conference on Business, Technology, and Hospitality for Sustainable Future (QICBTH-SF 2026), Quest International College, Kathmandu, Nepal.',
    researchStatus: 'completed',
    areaIds: ['area-business-technology', 'area-economics-sustainability'],
    leadAuthorNames: ['Bezon Kumar'],
    year: 2026,
    endYear: 2026,
    publicationIds: ['pub-kumar-youth-entrepreneurial-resilience-2026'],
  },
  {
    ...ts,
    id: 'project-char-land-livelihood-icbe-2025',
    slug: 'livelihood-impacts-climate-change-char-land-dwellers-icbe-2025',
    publishedAt: '2025-09-01T00:00:00.000Z',
    title:
      'The Livelihood Impacts of Climate Change and Coping Mechanisms of Forced Displaced Char Land Dwellers in Bangladesh',
    summary:
      'Bezon Kumar (01 to 03 September 2025). The Livelihood Impacts of Climate Change and Coping Mechanisms of Forced Displaced Char Land Dwellers in Bangladesh. The International Conference on Behavioural Economics (ICBE 2025), Department of Economics, CHRIST (Deemed to be University), Bangalore, India.',
    description:
      'Bezon Kumar (01 to 03 September 2025). The Livelihood Impacts of Climate Change and Coping Mechanisms of Forced Displaced Char Land Dwellers in Bangladesh. The International Conference on Behavioural Economics (ICBE 2025), Department of Economics, CHRIST (Deemed to be University), Bangalore, India.',
    researchStatus: 'completed',
    areaIds: ['area-environment-climate', 'area-migration-diaspora'],
    leadAuthorNames: ['Bezon Kumar'],
    year: 2025,
    endYear: 2025,
    publicationIds: ['pub-kumar-char-land-livelihood-icbe-2025'],
  },
  {
    ...ts,
    id: 'project-information-literacy-triggers-2024',
    slug: 'what-triggers-information-literacy-skill-bangladesh-2024',
    publishedAt: '2024-06-06T00:00:00.000Z',
    title:
      'What Triggers Information Literacy Skill? Insights from University Students in Bangladesh',
    summary:
      'Kumar, B. (06-08 June 2024). What Triggers Information Literacy Skill? Insights from University Students in Bangladesh. 2nd International Conference on the Art of Social Changes, Rabindra University, Bangladesh.',
    description:
      'Kumar, B. (06-08 June 2024). What Triggers Information Literacy Skill? Insights from University Students in Bangladesh. 2nd International Conference on the Art of Social Changes, Rabindra University, Bangladesh.',
    researchStatus: 'completed',
    areaIds: ['area-education-culture'],
    leadAuthorNames: ['Kumar, B.'],
    year: 2024,
    endYear: 2024,
    publicationIds: ['pub-kumar-information-literacy-triggers-2024'],
  },
  {
    ...ts,
    id: 'project-remittances-wellbeing-bisr-2024',
    slug: 'international-remittances-household-wellbeing-rural-bangladesh-2024',
    publishedAt: '2024-01-27T00:00:00.000Z',
    title:
      'International Remittances and Household Wellbeing: Evidence from Rural Bangladesh',
    summary:
      'Kumar, B. (27 January 2024). International Remittances and Household Wellbeing: Evidence from Rural Bangladesh. 8th Annual Conference on Social Science Research in Bangladesh, BISR, Dhaka, Bangladesh.',
    description:
      'Kumar, B. (27 January 2024). International Remittances and Household Wellbeing: Evidence from Rural Bangladesh. 8th Annual Conference on Social Science Research in Bangladesh, BISR, Dhaka, Bangladesh.',
    researchStatus: 'completed',
    areaIds: ['area-migration-diaspora', 'area-economics-sustainability'],
    leadAuthorNames: ['Kumar, B.'],
    year: 2024,
    endYear: 2024,
    publicationIds: ['pub-kumar-remittances-wellbeing-bisr-2024'],
  },
  {
    ...ts,
    id: 'project-child-marriage-cedcon-2023',
    slug: 'nexus-child-marriage-domestic-violence-sirajganj-cedcon-2023',
    publishedAt: '2023-09-21T00:00:00.000Z',
    title:
      'Nexus between Child Marriage and Domestic Violence: Evidence from Sirajganj, Bangladesh',
    summary:
      'Kumar, B. (21-23 September 2023). Nexus between Child Marriage and Domestic Violence: Evidence from Sirajganj, Bangladesh. CEDCON’s Annual International Conference in Economics, Tribhuvan University, Nepal.',
    description:
      'Kumar, B. (21-23 September 2023). Nexus between Child Marriage and Domestic Violence: Evidence from Sirajganj, Bangladesh. CEDCON’s Annual International Conference in Economics, Tribhuvan University, Nepal.',
    researchStatus: 'completed',
    areaIds: ['area-gender-development', 'area-society-politics'],
    leadAuthorNames: ['Kumar, B.'],
    year: 2023,
    endYear: 2023,
    publicationIds: ['pub-kumar-child-marriage-cedcon-2023'],
  },
  {
    ...ts,
    id: 'project-covid-vulnerable-rabindra-2023',
    slug: 'assessing-impact-covid-19-vulnerable-populations-bangladesh-2023',
    publishedAt: '2023-06-15T00:00:00.000Z',
    title:
      'Assessing the Impact of COVID-19 Pandemic on Vulnerable Populations in Bangladesh',
    summary:
      'Kumar, B. (15-17 June 2023). Assessing the Impact of COVID-19 Pandemic on Vulnerable Populations in Bangladesh. 1st International Conference on the Art of Social Changes, Rabindra University, Bangladesh.',
    description:
      'Kumar, B. (15-17 June 2023). Assessing the Impact of COVID-19 Pandemic on Vulnerable Populations in Bangladesh. 1st International Conference on the Art of Social Changes, Rabindra University, Bangladesh.',
    researchStatus: 'completed',
    areaIds: ['area-health-wellbeing'],
    leadAuthorNames: ['Kumar, B.'],
    year: 2023,
    endYear: 2023,
    publicationIds: ['pub-kumar-covid-vulnerable-rabindra-2023'],
  },
  {
    ...ts,
    id: 'project-child-marriage-gccy-2023',
    slug: 'nexus-child-marriage-domestic-violence-gccy-cambridge-2023',
    publishedAt: '2023-06-02T00:00:00.000Z',
    title:
      'Nexus between Child Marriage and Domestic Violence: Evidence from Sirajganj, Bangladesh',
    summary:
      'Kumar, B. (02-04 June 2023). Nexus between Child Marriage and Domestic Violence: Evidence from Sirajganj, Bangladesh. Organized by GCCY, Cambridge, UK.',
    description:
      'Kumar, B. (02-04 June 2023). Nexus between Child Marriage and Domestic Violence: Evidence from Sirajganj, Bangladesh. Organized by GCCY, Cambridge, UK.',
    researchStatus: 'completed',
    areaIds: ['area-gender-development', 'area-society-politics'],
    leadAuthorNames: ['Kumar, B.'],
    year: 2023,
    endYear: 2023,
    publicationIds: ['pub-kumar-child-marriage-gccy-2023'],
  },
  {
    ...ts,
    id: 'project-sti-knowledge-bimsscon-2020',
    slug: 'factors-affecting-knowledge-sexually-transmitted-infections-2020',
    publishedAt: '2020-01-01T00:00:00.000Z',
    title:
      'Factors affecting people’s knowledge about sexually transmitted infections: evidence from the developing countries',
    summary:
      "Kumar, B., Pinky, S. D. (2020). Factors affecting people’s knowledge about sexually transmitted infections: evidence from the developing countries. Bangladesh International Medical Students' Scientific Congress BIMSSCON, Dhaka, Bangladesh.",
    description:
      "Kumar, B., Pinky, S. D. (2020). Factors affecting people’s knowledge about sexually transmitted infections: evidence from the developing countries. Bangladesh International Medical Students' Scientific Congress BIMSSCON, Dhaka, Bangladesh.",
    researchStatus: 'completed',
    areaIds: ['area-health-wellbeing'],
    leadAuthorNames: ['Kumar, B.', 'Pinky, S. D.'],
    year: 2020,
    endYear: 2020,
    publicationIds: ['pub-kumar-sti-knowledge-bimsscon-2020'],
  },
  {
    ...ts,
    id: 'project-social-media-addiction-acstm-2021',
    slug: 'impact-social-media-addiction-mental-health-academic-performance-2021',
    publishedAt: '2021-11-20T00:00:00.000Z',
    title:
      'Impact of Social Media Addiction on Mental Health and Academic Performance of University Students in Bangladesh',
    summary:
      'Kumar, B. (20-21 November, 2021). Impact of Social Media Addiction on Mental Health and Academic Performance of University Students in Bangladesh. 4th Asian Conference on Science, Technology, and Medicine (ACSTM) organized by ACSE, Dubai, UAE.',
    description:
      'Kumar, B. (20-21 November, 2021). Impact of Social Media Addiction on Mental Health and Academic Performance of University Students in Bangladesh. 4th Asian Conference on Science, Technology, and Medicine (ACSTM) organized by ACSE, Dubai, UAE.',
    researchStatus: 'completed',
    areaIds: ['area-media-communication', 'area-health-wellbeing'],
    leadAuthorNames: ['Kumar, B.'],
    year: 2021,
    endYear: 2021,
    publicationIds: ['pub-kumar-social-media-addiction-acstm-2021'],
  },
  {
    ...ts,
    id: 'project-seminar-climate-icpad-2020',
    slug: 'impact-of-seminar-on-students-perception-climate-change-icpad-2020',
    publishedAt: '2020-02-05T00:00:00.000Z',
    title:
      "Impact of Seminar on Students’ Perception about Climate Change: A Case Study of Rabindra University, Bangladesh",
    summary:
      "Kumar, B. and Chandraaroy, B. (05-08 February, 2020). Impact of Seminar on Students’ Perception about Climate Change: A Case Study of Rabindra University, Bangladesh. 7th International Conference on Public Administration and Development (ICPAD) Social Science Research in Bangladesh, BPATC, Dhaka, Bangladesh.",
    description:
      "Kumar, B. and Chandraaroy, B. (05-08 February, 2020). Impact of Seminar on Students’ Perception about Climate Change: A Case Study of Rabindra University, Bangladesh. 7th International Conference on Public Administration and Development (ICPAD) Social Science Research in Bangladesh, BPATC, Dhaka, Bangladesh.",
    researchStatus: 'completed',
    areaIds: ['area-environment-climate', 'area-education-culture'],
    leadAuthorNames: ['Kumar, B.', 'Chandraaroy, B.'],
    year: 2020,
    endYear: 2020,
    publicationIds: ['pub-kumar-seminar-climate-icpad-2020'],
  },
  {
    ...ts,
    id: 'project-climate-perception-conference-2019',
    slug: 'perception-knowledge-climate-change-fourth-annual-conference-2019',
    publishedAt: '2019-11-02T00:00:00.000Z',
    title:
      'Perception and Knowledge on Climate Change: A Case Study on University Students in Bangladesh',
    summary:
      'Kumar, B., Asad, A. I., Chandraaroy, B. and Banik, P. (02 November, 2019). Perception and Knowledge on Climate Change: A Case Study on University Students in Bangladesh. Fourth Annual Conference on Social Science Research in Bangladesh, BISR, Dhaka, Bangladesh.',
    description:
      'Kumar, B., Asad, A. I., Chandraaroy, B. and Banik, P. (02 November, 2019). Perception and Knowledge on Climate Change: A Case Study on University Students in Bangladesh. Fourth Annual Conference on Social Science Research in Bangladesh, BISR, Dhaka, Bangladesh.',
    researchStatus: 'completed',
    areaIds: ['area-environment-climate'],
    leadAuthorNames: [
      'Kumar, B.',
      'Asad, A. I.',
      'Chandraaroy, B.',
      'Banik, P.',
    ],
    year: 2019,
    endYear: 2019,
    publicationIds: ['pub-kumar-climate-perception-conference-2019'],
  },
];

export const researchProjects: ResearchProject[] = [
  ...ongoingProjects,
  ...completedProjects,
  ...completedBookChapters,
  ...completedConferencePapers,
];

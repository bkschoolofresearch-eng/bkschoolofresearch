import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'bksr';
const secret = process.env.CMS_ADMIN_SECRET;
const email = process.env.CMS_ADMIN_EMAIL;
const password = process.env.CMS_ADMIN_PASSWORD;

if (!uri) {
  console.error('MONGODB_URI required');
  process.exit(1);
}

const EXPECTED = [
  'cms_meta',
  'site_settings',
  'homepage',
  'navigation',
  'pages',
  'people',
  'research_areas',
  'research_projects',
  'publications',
  'activities',
  'news',
  'events',
  'notices',
  'resources',
  'gallery_albums',
  'gallery_images',
  'media',
  'person_content_links',
  'registration_forms',
  'registration_entries',
  'role_assignments',
  'join_applications',
  'achievements',
  'achievement_assignments',
  'member_achievements',
  'accounts',
];

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

const names = (await db.listCollections().toArray()).map((c) => c.name).sort();
const counts = Object.fromEntries(
  await Promise.all(
    EXPECTED.map(async (name) => [name, await db.collection(name).countDocuments()]),
  ),
);

const group = async (col, field) =>
  db
    .collection(col)
    .aggregate([{ $group: { _id: `$${field}`, n: { $sum: 1 } } }, { $sort: { n: -1 } }])
    .toArray();

const pubsByType = await group('publications', 'type');
const researchByStatus = await group('research_projects', 'researchStatus');

const featured = await db.collection('homepage').findOne(
  {},
  {
    projection: {
      featuredResearchProjectIds: 1,
      featuredPublicationIds: 1,
      featuredNewsIds: 1,
      featuredEventIds: 1,
      directorPersonId: 1,
    },
  },
);

const idSet = async (col) =>
  new Set(
    (await db.collection(col).find({}).project({ id: 1 }).toArray()).map((d) => d.id),
  );

const rIds = await idSet('research_projects');
const pIds = await idSet('publications');
const nIds = await idSet('news');
const eIds = await idSet('events');
const peopleIds = await idSet('people');

const brokenFeatured = [];
for (const id of featured?.featuredResearchProjectIds || []) {
  if (!rIds.has(id)) brokenFeatured.push(['research', id]);
}
for (const id of featured?.featuredPublicationIds || []) {
  if (!pIds.has(id)) brokenFeatured.push(['publication', id]);
}
for (const id of featured?.featuredNewsIds || []) {
  if (!nIds.has(id)) brokenFeatured.push(['news', id]);
}
for (const id of featured?.featuredEventIds || []) {
  if (!eIds.has(id)) brokenFeatured.push(['event', id]);
}

const links = await db.collection('person_content_links').find({}).toArray();
const entitySets = {
  research: rIds,
  publication: pIds,
  event: eIds,
  activity: await idSet('activities'),
};
const brokenLinks = links.filter((link) => {
  if (!peopleIds.has(link.personId)) return true;
  const set = entitySets[link.entityType];
  return !set || !set.has(link.entityId);
});

const login = await fetch('http://localhost:3000/api/cms/session', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
if (!login.ok) {
  // Fallback for scripts: secret header path still works via assertCmsAdmin
  console.error('Login failed', login.status, await login.text());
}
const cookie = (login.headers.getSetCookie?.() || [])
  .map((c) => c.split(';')[0])
  .join('; ');
const apiRes = await fetch('http://localhost:3000/api/cms', {
  headers: { cookie },
});
const apiJson = await apiRes.json();
const apiDb = apiJson.database;
const apiCounts = apiDb
  ? {
      pages: apiDb.pages.length,
      people: apiDb.people.length,
      researchAreas: apiDb.researchAreas.length,
      researchProjects: apiDb.researchProjects.length,
      publications: apiDb.publications.length,
      activities: apiDb.activities.length,
      news: apiDb.news.length,
      events: apiDb.events.length,
      notices: apiDb.notices.length,
      resources: apiDb.resources.length,
      galleryAlbums: apiDb.galleryAlbums.length,
      galleryImages: apiDb.galleryImages.length,
      media: apiDb.media.length,
      personContentLinks: apiDb.personContentLinks.length,
      registrationForms: apiDb.registrationForms.length,
      registrationEntries: apiDb.registrationEntries.length,
      roleAssignments: apiDb.roleAssignments.length,
      joinApplications: apiDb.joinApplications.length,
      achievements: apiDb.achievements.length,
      achievementAssignments: apiDb.achievementAssignments.length,
      memberAchievements: apiDb.memberAchievements.length,
    }
  : null;

const mongoListCounts = {
  pages: counts.pages,
  people: counts.people,
  researchAreas: counts.research_areas,
  researchProjects: counts.research_projects,
  publications: counts.publications,
  activities: counts.activities,
  news: counts.news,
  events: counts.events,
  notices: counts.notices,
  resources: counts.resources,
  galleryAlbums: counts.gallery_albums,
  galleryImages: counts.gallery_images,
  media: counts.media,
  personContentLinks: counts.person_content_links,
  registrationForms: counts.registration_forms,
  registrationEntries: counts.registration_entries,
  roleAssignments: counts.role_assignments,
  joinApplications: counts.join_applications,
  achievements: counts.achievements,
  achievementAssignments: counts.achievement_assignments,
  memberAchievements: counts.member_achievements,
};

const apiVsMongoDiff = {};
if (apiCounts) {
  for (const key of Object.keys(mongoListCounts)) {
    if (apiCounts[key] !== mongoListCounts[key]) {
      apiVsMongoDiff[key] = { api: apiCounts[key], mongo: mongoListCounts[key] };
    }
  }
}

const meta = await db.collection('cms_meta').findOne({});

console.log(
  JSON.stringify(
    {
      env: {
        CMS_DRIVER: process.env.CMS_DRIVER,
        NEXT_PUBLIC_CMS_MODE: process.env.NEXT_PUBLIC_CMS_MODE,
      },
      schema: {
        expected: EXPECTED.length,
        present: names.length,
        missing: EXPECTED.filter((n) => !names.includes(n)),
        unexpected: names.filter((n) => !EXPECTED.includes(n)),
      },
      counts,
      totalDocs: Object.values(counts).reduce((a, b) => a + b, 0),
      meta,
      pubsByType,
      researchByStatus,
      integrity: {
        brokenFeaturedRefs: brokenFeatured,
        brokenPersonLinks: brokenLinks.length,
        directorPersonOk: peopleIds.has(featured?.directorPersonId),
        duplicateLinkKeys: (() => {
          const seen = new Set();
          const dups = [];
          for (const link of links) {
            const k = `${link.personId}|${link.entityType}|${link.entityId}`;
            if (seen.has(k)) dups.push(k);
            seen.add(k);
          }
          return dups;
        })(),
      },
      apiAuthenticated: apiRes.ok,
      apiVsMongoDiff,
      notes: {
        emptyByDesign: [
          'gallery_images (seed is intentionally empty — Coming soon album)',
          'registration_entries (inbox starts empty)',
          'join_applications (inbox starts empty)',
          'member_achievements (starts empty)',
          'accounts (auth Phase 2)',
        ],
        notInCmsSeed: [
          'people-demo.ts roster (hardcoded public demo; not CMS/Mongo people)',
        ],
      },
    },
    null,
    2,
  ),
);

await client.close();

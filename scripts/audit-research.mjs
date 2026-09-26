import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'bksr';
const client = new MongoClient(uri);

await client.connect();
const db = client.db(dbName);

const total = await db.collection('research_projects').countDocuments();
const featured = await db
  .collection('research_projects')
  .countDocuments({ featuredOnResearchPage: true });
const noUrl = await db.collection('research_projects').countDocuments({
  $or: [{ url: null }, { url: '' }, { url: { $exists: false } }],
});
const noAuthors = await db.collection('research_projects').countDocuments({
  $or: [
    { leadAuthorNames: { $size: 0 } },
    { leadAuthorNames: { $exists: false } },
  ],
});
const statuses = await db
  .collection('research_projects')
  .aggregate([{ $group: { _id: '$researchStatus', n: { $sum: 1 } } }])
  .toArray();
const pub = await db
  .collection('research_projects')
  .aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }])
  .toArray();

const areaIds = new Set(
  (await db.collection('research_areas').find({}).project({ id: 1 }).toArray()).map(
    (a) => a.id,
  ),
);
const all = await db
  .collection('research_projects')
  .find({})
  .project({ id: 1, areaIds: 1, title: 1, url: 1, featuredOnResearchPage: 1 })
  .toArray();
const orphanAreas = [];
for (const p of all) {
  for (const a of p.areaIds || []) {
    if (!areaIds.has(a)) orphanAreas.push({ project: p.id, area: a });
  }
}

const links = await db
  .collection('person_content_links')
  .countDocuments({ entityType: 'research' });
const featuredDocs = await db
  .collection('research_projects')
  .find({ featuredOnResearchPage: true })
  .project({ id: 1, title: 1, status: 1, researchStatus: 1 })
  .toArray();

console.log(
  JSON.stringify(
    {
      total,
      featured,
      featuredDocs,
      noUrl,
      noAuthors,
      statuses,
      pub,
      links,
      orphanAreaCount: orphanAreas.length,
      orphanAreas: orphanAreas.slice(0, 8),
    },
    null,
    2,
  ),
);

await client.close();

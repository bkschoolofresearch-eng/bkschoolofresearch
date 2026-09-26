import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB || 'bksr');

const p = await db
  .collection('research_projects')
  .findOne({ id: 'project-remittances-rural-development-2026' });
console.log('project publicationIds', p?.publicationIds);

const pub = await db
  .collection('publications')
  .findOne({ id: 'pub-kumar-remittances-rural-development-2026' });
console.log('linked pub', {
  found: Boolean(pub),
  url: pub?.url,
  doi: pub?.doi,
  citation: pub?.citation?.slice?.(0, 140),
});

const withPubIds = await db
  .collection('research_projects')
  .find({ 'publicationIds.0': { $exists: true } })
  .project({ id: 1, publicationIds: 1 })
  .toArray();
console.log('projects with publicationIds', withPubIds.length);

const missingPubs = [];
for (const project of withPubIds) {
  for (const id of project.publicationIds || []) {
    const exists = await db.collection('publications').findOne(
      { id },
      { projection: { id: 1, url: 1, doi: 1 } },
    );
    if (!exists) missingPubs.push({ project: project.id, pubId: id });
  }
}
console.log('missing linked pubs', missingPubs.slice(0, 10), 'count', missingPubs.length);

const pubsWithUrl = await db
  .collection('publications')
  .countDocuments({ url: { $type: 'string' } });
console.log('publications with url string', pubsWithUrl);

await client.close();

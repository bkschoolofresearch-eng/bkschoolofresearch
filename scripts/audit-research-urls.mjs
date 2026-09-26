import { MongoClient } from 'mongodb';

function doiToUrl(doi) {
  if (!doi?.trim()) return null;
  const cleaned = doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  return cleaned ? `https://doi.org/${cleaned}` : null;
}

function asExt(v) {
  const h = v?.trim();
  return h && /^https?:\/\//i.test(h) ? h : null;
}

function extract(text) {
  if (!text?.trim()) return null;
  const absolute = text.match(
    /https?:\/\/(?:dx\.)?doi\.org\/(10\.\d{4,}\/[^\s<>"']+)/i,
  );
  if (absolute?.[1]) return doiToUrl(absolute[1].replace(/[.,;:)]+$/, ''));
  const bare = text.match(/\b(10\.\d{4,}\/[^\s<>"']+)/);
  if (bare?.[1]) return doiToUrl(bare[1].replace(/[.,;:)]+$/, ''));
  return null;
}

function resolve(project, byId) {
  const attached = asExt(project.url);
  if (attached) return { href: attached, via: 'direct' };
  for (const id of project.publicationIds ?? []) {
    const pub = byId.get(id);
    if (!pub) continue;
    const href =
      asExt(pub.url) || doiToUrl(pub.doi) || extract(pub.citation);
    if (href) return { href, via: 'publication' };
  }
  const fromText =
    extract(project.description) || extract(project.summary);
  if (fromText) return { href: fromText, via: 'text' };
  return null;
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB || 'bksr');
const all = await db.collection('research_projects').find({}).toArray();
const pubs = await db.collection('publications').find({}).toArray();
const byId = new Map(pubs.map((p) => [p.id, p]));

const counts = { total: all.length, direct: 0, publication: 0, text: 0, none: 0 };
for (const p of all) {
  const r = resolve(p, byId);
  if (!r) counts.none += 1;
  else counts[r.via] += 1;
}
console.log(JSON.stringify(counts, null, 2));
await client.close();

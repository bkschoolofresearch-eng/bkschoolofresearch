/**
 * One-shot migration: remove prototype /media/prototype/... URLs from MongoDB records.
 * These were hardcoded in seed data and should be replaced by admin via CMS.
 *
 * Usage:
 *   node --env-file=.env.local scripts/clean-prototype-images.mjs --dry-run
 *   node --env-file=.env.local scripts/clean-prototype-images.mjs
 *
 * Requires: MONGODB_URI
 */

import { MongoClient } from 'mongodb';

const dryRun = process.argv.includes('--dry-run');
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'bksr';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

const PROTOTYPE_PREFIX = '/media/prototype/';

const COLLECTIONS_TO_CLEAN = [
  { name: 'research_projects', field: 'featuredImageUrl' },
  { name: 'publications', field: 'coverImageUrl' },
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);

    let totalCleaned = 0;

    for (const { name, field } of COLLECTIONS_TO_CLEAN) {
      const col = db.collection(name);
      const filter = { [field]: { $regex: `^${PROTOTYPE_PREFIX.replace(/\//g, '\\/')}` } };
      const docs = await col.find(filter).toArray();

      if (!docs.length) {
        console.log(`${name}: no prototype ${field} found ✓`);
        continue;
      }

      console.log(`\n${name}: found ${docs.length} records with prototype ${field}`);

      for (const doc of docs) {
        const id = doc.id;
        const oldUrl = doc[field];

        if (dryRun) {
          console.log(`  [DRY RUN] Would clear ${field} on ${id} (was: ${oldUrl})`);
        } else {
          await col.updateOne({ id }, { $set: { [field]: null } });
          console.log(`  ✓ ${id} — ${field} cleared (was: ${oldUrl})`);
        }
        totalCleaned++;
      }
    }

    console.log(`\nDone: ${totalCleaned} records cleaned${dryRun ? ' (dry run)' : ''}`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();

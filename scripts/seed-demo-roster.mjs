/**
 * Upsert the temporary demo people and homepage researcher quotes into Mongo.
 * Does not wipe other CMS records.
 *
 *   node --env-file=.env.local scripts/seed-demo-roster.mjs
 */
import { registerHooks } from 'node:module';
import { MongoClient } from 'mongodb';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      !specifier.endsWith('.ts') &&
      !specifier.endsWith('.js') &&
      !specifier.endsWith('.json')
    ) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { demoPeople, demoResearcherQuotes } = await import(
  '../src/content/seed/demo-roster.ts'
);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'bksr';
if (!uri) {
  console.error('MONGODB_URI is required.');
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);
  const people = db.collection('people');
  const ops = demoPeople.map((person) => ({
    replaceOne: {
      filter: { id: person.id },
      replacement: { ...person, _id: person.id },
      upsert: true,
    },
  }));
  const peopleResult = await people.bulkWrite(ops);
  const homepage = await db.collection('homepage').updateOne(
    { _id: 'default' },
    { $set: { researcherQuotes: demoResearcherQuotes } },
  );
  console.log(
    JSON.stringify({
      peopleMatched: peopleResult.matchedCount,
      peopleUpserted: peopleResult.upsertedCount,
      homepageMatched: homepage.matchedCount,
      homepageModified: homepage.modifiedCount,
      quoteCount: demoResearcherQuotes.length,
      names: demoPeople.map((person) => `${person.name} (${person.category})`),
    }),
  );
} finally {
  await client.close();
}

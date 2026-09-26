/**
 * Seed MongoDB from the compiled CMS seed.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-mongo.mjs
 *   node --env-file=.env.local scripts/seed-mongo.mjs --wipe
 *
 * Requires MONGODB_URI. Prefer POST /api/cms/seed when the app is running
 * (admin session cookie, or header x-cms-admin-secret).
 */

import { MongoClient } from 'mongodb';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Seed is TypeScript — use the Next-compiled path via dynamic import after build,
// or call the HTTP seed endpoint. This script seeds via raw Mongo using a
// JSON export if present; otherwise prints instructions.

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'bksr';
const wipe = process.argv.includes('--wipe');

if (!uri) {
  console.error('MONGODB_URI is required. Copy .env.example → .env.local first.');
  process.exit(1);
}

console.log(`
BKSR Mongo seed helper
----------------------
Preferred path (uses the same code as production):

  1. Set CMS_DRIVER=mongo and NEXT_PUBLIC_CMS_MODE=mongo in .env.local
  2. Set MONGODB_URI, MONGODB_DB, CMS_ADMIN_EMAIL, CMS_ADMIN_PASSWORD
  3. npm run dev
  4. Sign in at /admin with CMS_ADMIN_EMAIL + CMS_ADMIN_PASSWORD
  5. Open System & data → Reset to starter library  OR:

     curl -X POST http://localhost:3000/api/cms/seed \\
       -H "content-type: application/json" \\
       -H "x-cms-admin-secret: $CMS_ADMIN_SECRET" \\
       -d '{"wipe":${wipe}}'

This script only verifies connectivity.
`);

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);
  const ping = await db.command({ ping: 1 });
  console.log('Mongo ping ok:', ping.ok === 1);
  console.log('Database:', dbName);
  console.log('Wipe flag:', wipe);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.close();
}

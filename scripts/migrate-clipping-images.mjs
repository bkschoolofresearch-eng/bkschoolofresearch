/**
 * One-shot migration: upload prototype media-clipping images to Cloudinary
 * and patch MongoDB records with the resulting CDN URLs.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-clipping-images.mjs
 *   node --env-file=.env.local scripts/migrate-clipping-images.mjs --dry-run
 *
 * Requires: MONGODB_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import { readFile } from 'fs/promises';
import { resolve, basename } from 'path';
import { Readable } from 'stream';

const dryRun = process.argv.includes('--dry-run');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'bksr';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

for (const key of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
  if (!process.env[key]) {
    console.error(`${key} is required`);
    process.exit(1);
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const folder = (process.env.CLOUDINARY_FOLDER || 'bksr/media').replace(/^\/+|\/+$/g, '');

/**
 * Mapping: clipping ID → local prototype image file.
 * These are the same assignments that were in the old mediaAppearanceVisualById map.
 */
const CLIPPING_IMAGE_MAP = {
  'press-tbs-bk-school-curiosity-2023': 'bksr-media-spotlight.png',
  'press-deshrupantor-beautiful-future-research-2023': 'bksr-media-broadsheet.png',
  'press-jamuna-cfep-mou-2025': 'bksr-media-broadcast.png',
  'press-deshrupantor-research-as-career-2026': 'bksr-media-digital-news.png',
  'press-ajker-patrika-research-for-students-2023': 'bksr-media-newspaper-desk.png',
  'press-protidiner-bksr-cfep-2025': 'bksr-media-clippings.png',
  'press-dhaka-tribune-joy-bangla-2022': 'bksr-media-spotlight.png',
  'press-tbs-joy-bangla-inspirational-2022': 'bksr-media-digital-news.png',
  'press-risingbd-youth-award-2023': 'bksr-media-broadsheet.png',
  'press-youtube-maasranga-bezon-2023': 'bksr-media-broadcast.png',
  'press-dbangla71-clipping-2022': 'bksr-media-clippings.png',
  'press-bdnews24-rohingya-covid-2022': 'bksr-media-newspaper-desk.png',
  'press-amadershomoy-unicef-feature-2022': 'bksr-media-digital-news.png',
};

const protoDir = resolve(process.cwd(), 'public/media/prototype');

/** Upload a local file to Cloudinary and return the secure URL. */
async function uploadToCloudinary(filePath) {
  const body = await readFile(filePath);
  const name = basename(filePath, '.png').replace(/[^a-z0-9-]/gi, '-');
  const publicIdBase = `media-clipping-${name}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${new Date().toISOString().slice(0, 10)}/${publicIdBase}-${Date.now()}`,
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      },
    );
    Readable.from(body).pipe(stream);
  });
}

/** Dedupe: same file should only upload once. */
const uploadCache = new Map();

async function getCloudinaryUrl(filename) {
  if (uploadCache.has(filename)) return uploadCache.get(filename);
  const filePath = resolve(protoDir, filename);
  console.log(`  ↑ Uploading ${filename} to Cloudinary...`);
  const result = await uploadToCloudinary(filePath);
  console.log(`    → ${result.url}`);
  uploadCache.set(filename, result.url);
  return result.url;
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const col = db.collection('media_clippings');

    const clippings = await col.find({}).toArray();
    console.log(`Found ${clippings.length} media clippings in MongoDB\n`);

    let updated = 0;
    let skipped = 0;

    for (const clip of clippings) {
      const id = clip.id;
      const filename = CLIPPING_IMAGE_MAP[id];

      if (!filename) {
        console.log(`⊘ ${id} — no prototype image mapped, skipping`);
        skipped++;
        continue;
      }

      if (clip.coverImageUrl && clip.coverImageUrl.includes('cloudinary')) {
        console.log(`✓ ${id} — already has Cloudinary URL, skipping`);
        skipped++;
        continue;
      }

      const cdnUrl = await getCloudinaryUrl(filename);

      if (dryRun) {
        console.log(`[DRY RUN] Would set coverImageUrl on ${id} → ${cdnUrl}`);
      } else {
        await col.updateOne({ id }, { $set: { coverImageUrl: cdnUrl } });
        console.log(`✓ ${id} → coverImageUrl set`);
      }
      updated++;
    }

    console.log(`\nDone: ${updated} updated, ${skipped} skipped${dryRun ? ' (dry run)' : ''}`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();

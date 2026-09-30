import 'server-only';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import path from 'path';
import { revalidateTag } from 'next/cache';
import sharp from 'sharp';
import { CMS_CACHE_TAGS } from '@/lib/db/collections';
import { isCloudinaryUrl } from '@/lib/media/cloudinary-url';
import { getCmsDriver } from '@/lib/cms/server-repository';
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from '@/lib/storage/cloudinary';
import type {
  ContentCollectionKey,
  MediaAsset,
  MediaKind,
} from '@/types/content';

const MAX_EDGE = 2000;
const WEBP_QUALITY = 82;
const MAX_BYTES = 12 * 1024 * 1024;

/** Image fields that should live on Cloudinary after a save. */
const IMAGE_FIELDS: Partial<Record<ContentCollectionKey, string[]>> = {
  people: ['photoUrl'],
  researchProjects: ['featuredImageUrl'],
  publications: ['coverImageUrl'],
  mediaClippings: ['coverImageUrl'],
  activities: ['imageUrl'],
  news: ['featuredImageUrl'],
  events: ['featuredImageUrl'],
  notices: ['featuredImageUrl'],
  galleryImages: ['url'],
  registrationForms: ['bannerImageUrl'],
  media: ['url'],
};

const originInflight = new Map<string, Promise<string>>();
const hashInflight = new Map<string, Promise<MediaAsset>>();

function normalizeOrigin(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('/')) return trimmed.split('?')[0] || trimmed;
  try {
    const parsed = new URL(trimmed);
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

export function cloudinaryPublicId(url: string): string | null {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const uploadAt = parts.indexOf('upload');
    if (uploadAt === -1) return null;
    let rest = parts.slice(uploadAt + 1);
    if (rest[0] && /^v\d+$/.test(rest[0])) rest = rest.slice(1);
    const last = rest.at(-1);
    if (!last) return null;
    rest[rest.length - 1] = last.replace(/\.[a-z0-9]+$/i, '');
    return rest.join('/') || null;
  } catch {
    return null;
  }
}

async function listMedia(): Promise<MediaAsset[]> {
  if (getCmsDriver() === 'mongo') {
    const { mongoGetAll } = await import('@/lib/cms/mongo-repository');
    return mongoGetAll('media');
  }
  const { fsGetAll } = await import('@/lib/cms/fs-repository');
  return fsGetAll('media');
}

async function createMedia(
  input: Omit<MediaAsset, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<MediaAsset> {
  if (getCmsDriver() === 'mongo') {
    const { mongoCreate } = await import('@/lib/cms/mongo-repository');
    return mongoCreate('media', input);
  }
  const { fsCreate } = await import('@/lib/cms/fs-repository');
  return fsCreate('media', input);
}

async function removeMedia(id: string): Promise<void> {
  if (getCmsDriver() === 'mongo') {
    const { mongoRemove } = await import('@/lib/cms/mongo-repository');
    await mongoRemove('media', id);
    return;
  }
  const { fsRemove } = await import('@/lib/cms/fs-repository');
  await fsRemove('media', id);
}

async function listCollection(collection: ContentCollectionKey) {
  if (getCmsDriver() === 'mongo') {
    const { mongoGetAll } = await import('@/lib/cms/mongo-repository');
    return mongoGetAll(collection);
  }
  const { fsGetAll } = await import('@/lib/cms/fs-repository');
  return fsGetAll(collection);
}

async function patchCollection(
  collection: ContentCollectionKey,
  id: string,
  patch: Record<string, unknown>,
) {
  if (getCmsDriver() === 'mongo') {
    const { mongoUpdate } = await import('@/lib/cms/mongo-repository');
    await mongoUpdate(collection, id, patch as never);
    return;
  }
  const { fsUpdate } = await import('@/lib/cms/fs-repository');
  await fsUpdate(collection, id, patch as never);
}

function reusable(asset: MediaAsset | undefined): asset is MediaAsset {
  return Boolean(asset?.url && isCloudinaryUrl(asset.url));
}

async function findByOrigin(originUrl: string): Promise<MediaAsset | undefined> {
  const media = await listMedia();
  return media.find(
    (item) => item.originUrl === originUrl && isCloudinaryUrl(item.url),
  );
}

async function findByHash(contentHash: string): Promise<MediaAsset | undefined> {
  const media = await listMedia();
  return media.find(
    (item) => item.contentHash === contentHash && isCloudinaryUrl(item.url),
  );
}

export async function findMediaByUrl(url: string): Promise<MediaAsset | undefined> {
  const media = await listMedia();
  return media.find((item) => item.url === url);
}

async function readLocal(urlPath: string): Promise<Buffer | null> {
  if (!urlPath.startsWith('/') || urlPath.startsWith('//')) return null;
  const rel = decodeURIComponent(urlPath.split('?')[0] || urlPath);
  const root = path.resolve(process.cwd(), 'public');
  const full = path.resolve(root, `.${rel}`);
  if (!full.startsWith(root)) return null;
  try {
    return await readFile(full);
  } catch {
    return null;
  }
}

async function readRemote(url: string): Promise<{ body: Buffer; contentType: string } | null> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return null;
    const length = Number(response.headers.get('content-length') || 0);
    if (length > MAX_BYTES) return null;
    const body = Buffer.from(await response.arrayBuffer());
    if (body.length > MAX_BYTES) return null;
    return {
      body,
      contentType: response.headers.get('content-type') || 'application/octet-stream',
    };
  } catch {
    return null;
  }
}

async function compressImage(
  body: Buffer,
  contentType: string,
): Promise<{ body: Buffer; contentType: string; filenameExt: string }> {
  if (/gif|svg/i.test(contentType)) {
    return { body, contentType, filenameExt: '' };
  }
  try {
    const image = sharp(body, { failOn: 'none' }).rotate();
    const meta = await image.metadata();
    if (!meta.width && !meta.height) {
      return { body, contentType, filenameExt: '' };
    }
    const compressed = await image
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();
    if (compressed.length >= body.length && body.length < 400_000) {
      return { body, contentType, filenameExt: '' };
    }
    return {
      body: compressed,
      contentType: 'image/webp',
      filenameExt: '.webp',
    };
  } catch {
    return { body, contentType, filenameExt: '' };
  }
}

async function uploadFresh(input: {
  body: Buffer;
  contentType: string;
  filename: string;
  contentHash: string;
  originUrl?: string | null;
  title?: string;
  alt?: string;
  kind?: MediaKind;
  folder?: string;
}): Promise<MediaAsset> {
  const prepared = input.contentType.startsWith('image/')
    ? await compressImage(input.body, input.contentType)
    : { body: input.body, contentType: input.contentType, filenameExt: '' };
  const filename = prepared.filenameExt
    ? `${input.filename.replace(/\.[a-z0-9]+$/i, '')}${prepared.filenameExt}`
    : input.filename;
  const uploaded = await uploadToCloudinary({
    body: prepared.body,
    contentType: prepared.contentType,
    filename,
    folder: input.folder,
  });
  return createMedia({
    kind: input.kind ?? 'image',
    title: input.title?.trim() || filename,
    alt: input.alt,
    url: uploaded.url,
    source: `cloudinary:${uploaded.publicId}`,
    contentHash: input.contentHash,
    originUrl: input.originUrl ?? null,
    width: uploaded.width,
    height: uploaded.height,
    status: 'published',
  });
}

async function storeHashed(input: {
  body: Buffer;
  contentType: string;
  filename: string;
  originUrl?: string | null;
  title?: string;
  alt?: string;
  kind?: MediaKind;
  folder?: string;
}): Promise<MediaAsset> {
  const contentHash = createHash('sha256').update(input.body).digest('hex');
  const pending = hashInflight.get(contentHash);
  if (pending) return pending;
  const job = (async () => {
    const existing = await findByHash(contentHash);
    if (reusable(existing)) {
      if (input.originUrl && existing.originUrl !== input.originUrl) {
        await patchCollection('media', existing.id, { originUrl: input.originUrl });
      }
      return existing;
    }
    return uploadFresh({ ...input, contentHash });
  })().finally(() => {
    hashInflight.delete(contentHash);
  });
  hashInflight.set(contentHash, job);
  return job;
}

/** Upload bytes once. The same file returns the existing Cloudinary URL. */
export async function storeImageBuffer(input: {
  body: Buffer;
  contentType: string;
  filename: string;
  title?: string;
  alt?: string;
  kind?: MediaKind;
  folder?: string;
}): Promise<{ item: MediaAsset; reused: boolean }> {
  const before = await findByHash(
    createHash('sha256').update(input.body).digest('hex'),
  );
  const item = await storeHashed(input);
  return { item, reused: Boolean(before && before.id === item.id) };
}

async function ensureCloudinaryImage(url: string): Promise<string> {
  const trimmed = url.trim();
  if (!trimmed || isCloudinaryUrl(trimmed)) return trimmed;
  const origin = normalizeOrigin(trimmed);
  const pending = originInflight.get(origin);
  if (pending) return pending;
  const job = ingestOrigin(trimmed, origin).finally(() => {
    originInflight.delete(origin);
  });
  originInflight.set(origin, job);
  return job;
}

function sniffImage(body: Buffer): string {
  if (body.subarray(0, 6).toString('ascii').startsWith('GIF')) return 'image/gif';
  if (body.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return 'image/png';
  if (
    body.subarray(0, 4).toString('ascii') === 'RIFF' &&
    body.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  if (body.subarray(0, 5).toString('ascii').includes('<svg') || body.subarray(0, 200).toString('utf8').includes('<svg')) {
    return 'image/svg+xml';
  }
  return 'image/jpeg';
}

async function ingestOrigin(url: string, origin: string): Promise<string> {
  const byOrigin = await findByOrigin(origin);
  if (reusable(byOrigin)) return byOrigin.url;

  const loaded = url.startsWith('/')
    ? await readLocal(url).then((body) =>
        body ? { body, contentType: sniffImage(body) } : null,
      )
    : /^https?:\/\//i.test(url)
      ? await readRemote(url)
      : null;
  if (!loaded) return url;
  if (
    loaded.contentType &&
    !loaded.contentType.startsWith('image/') &&
    !loaded.contentType.includes('octet-stream')
  ) {
    return url;
  }

  const filename = origin.split('/').pop() || 'image';
  const stored = await storeHashed({
    body: loaded.body,
    contentType: loaded.contentType || 'image/jpeg',
    filename,
    originUrl: origin,
    title: filename,
    kind: 'image',
  });
  return stored.url;
}

export async function prepareRecordImages<T extends Record<string, unknown>>(
  collection: ContentCollectionKey,
  record: T,
): Promise<T> {
  const fields = IMAGE_FIELDS[collection];
  if (!fields) return record;
  const next: Record<string, unknown> = { ...record };
  for (const field of fields) {
    if (!Object.prototype.hasOwnProperty.call(next, field)) continue;
    const value = next[field];
    if (typeof value !== 'string' || !value.trim()) continue;
    next[field] = await ensureCloudinaryImage(value);
  }
  return next as T;
}

function cloudinaryUrls(
  collection: ContentCollectionKey,
  record: object,
): string[] {
  const fields = IMAGE_FIELDS[collection];
  if (!fields) return [];
  const row = record as Record<string, unknown>;
  const urls: string[] = [];
  for (const field of fields) {
    const value = row[field];
    if (typeof value === 'string' && isCloudinaryUrl(value.trim())) {
      urls.push(value.trim());
    }
  }
  return urls;
}

async function countContentUses(url: string): Promise<number> {
  let count = 0;
  for (const [collection, fields] of Object.entries(IMAGE_FIELDS)) {
    if (collection === 'media' || !fields) continue;
    const rows = await listCollection(collection as ContentCollectionKey);
    for (const row of rows) {
      const record = row as unknown as Record<string, unknown>;
      if (fields.some((field) => record[field] === url)) count += 1;
    }
  }
  return count;
}

async function destroyCloudinaryUrl(url: string): Promise<void> {
  const media = await listMedia();
  const ids = new Set<string>();
  for (const item of media) {
    if (item.url !== url || !item.source?.startsWith('cloudinary:')) continue;
    ids.add(item.source.slice('cloudinary:'.length));
  }
  const parsed = cloudinaryPublicId(url);
  if (parsed) ids.add(parsed);
  for (const id of ids) {
    try {
      await deleteFromCloudinary(id);
    } catch (error) {
      console.error('Cloudinary delete failed', error);
    }
  }
}

async function clearUrlFromContent(url: string): Promise<void> {
  for (const [collection, fields] of Object.entries(IMAGE_FIELDS)) {
    if (collection === 'media' || !fields) continue;
    const key = collection as ContentCollectionKey;
    const rows = await listCollection(key);
    for (const row of rows) {
      const record = row as unknown as Record<string, unknown> & { id: string };
      const patch: Record<string, null> = {};
      for (const field of fields) {
        if (record[field] === url) patch[field] = null;
      }
      if (Object.keys(patch).length) {
        await patchCollection(key, record.id, patch);
      }
    }
  }
  revalidateTag(CMS_CACHE_TAGS.all, 'max');
}

/** Drop a Cloudinary file once nothing on the site still points at it. */
export async function releaseImageIfUnused(url: string): Promise<void> {
  if (!isCloudinaryUrl(url)) return;
  if ((await countContentUses(url)) > 0) return;
  const docs = (await listMedia()).filter((item) => item.url === url);
  await destroyCloudinaryUrl(url);
  for (const doc of docs) {
    await removeMedia(doc.id);
  }
}

export async function afterRecordRemoved(
  collection: ContentCollectionKey,
  record: object,
): Promise<void> {
  if (collection === 'media') {
    const asset = record as MediaAsset;
    const url = asset.url?.trim();
    if (url && isCloudinaryUrl(url)) {
      const publicId = asset.source?.startsWith('cloudinary:')
        ? asset.source.slice('cloudinary:'.length)
        : cloudinaryPublicId(url);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error('Cloudinary delete failed', error);
        }
      }
      await clearUrlFromContent(url);
    }
    return;
  }
  for (const url of cloudinaryUrls(collection, record)) {
    await releaseImageIfUnused(url);
  }
}

export async function afterRecordImagesChanged(
  collection: ContentCollectionKey,
  before: object,
  after: object,
): Promise<void> {
  const next = new Set(cloudinaryUrls(collection, after));
  for (const url of cloudinaryUrls(collection, before)) {
    if (!next.has(url)) await releaseImageIfUnused(url);
  }
}

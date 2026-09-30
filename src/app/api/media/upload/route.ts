import {
  assertCmsAdmin,
  jsonError,
  jsonOk,
  requireCmsDriver,
} from '@/lib/cms/api-guard';
import {
  isCloudinaryConfigured,
} from '@/lib/storage/cloudinary';
import { storeImageBuffer } from '@/lib/media/image-store';

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

/**
 * POST multipart/form-data:
 * - file: binary
 * - title?: string
 * - alt?: string
 * - kind?: image|video|document|audio|other
 *
 * Uploads to Cloudinary, then stores MediaAsset metadata (url = CDN link).
 */
export async function POST(request: Request) {
  const denied = (await assertCmsAdmin(request)) ?? requireCmsDriver();
  if (denied) return denied;

  if (!isCloudinaryConfigured()) {
    return jsonError(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      503,
    );
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return jsonError('Missing file field');
    }
    if (file.size > MAX_BYTES) {
      return jsonError('File too large (max 12 MB)', 413);
    }

    const title =
      (typeof form.get('title') === 'string' && form.get('title')) ||
      file.name ||
      'Untitled media';
    const alt =
      (typeof form.get('alt') === 'string' && (form.get('alt') as string)) ||
      undefined;
    const kindRaw =
      (typeof form.get('kind') === 'string' && (form.get('kind') as string)) ||
      'image';
    const kind = (
      ['image', 'video', 'document', 'audio', 'other'] as const
    ).includes(kindRaw as 'image')
      ? (kindRaw as 'image' | 'video' | 'document' | 'audio' | 'other')
      : 'image';

    const buffer = Buffer.from(await file.arrayBuffer());
    const { item, reused } = await storeImageBuffer({
      body: buffer,
      contentType: file.type || 'application/octet-stream',
      filename: file.name || 'upload.bin',
      title: String(title),
      alt,
      kind,
    });

    return jsonOk(
      {
        item,
        reused,
        storage: {
          url: item.url,
        },
      },
      { status: reused ? 200 : 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return jsonError(message, 500);
  }
}

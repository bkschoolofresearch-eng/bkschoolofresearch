import 'server-only';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function ensureConfigured() {
  cloudinary.config({
    cloud_name: required('CLOUDINARY_CLOUD_NAME'),
    api_key: required('CLOUDINARY_API_KEY'),
    api_secret: required('CLOUDINARY_API_SECRET'),
    secure: true,
  });
}

function defaultFolder(): string {
  return (process.env.CLOUDINARY_FOLDER || 'bksr/media').replace(
    /^\/+|\/+$/g,
    '',
  );
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export type CloudinaryUploadResult = {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  resourceType: string;
};

/**
 * Upload a binary buffer to Cloudinary. Uses resource_type auto
 * so images, PDFs, and video share one path.
 */
export async function uploadToCloudinary(input: {
  body: Buffer | Uint8Array;
  contentType: string;
  filename: string;
  folder?: string;
}): Promise<CloudinaryUploadResult> {
  ensureConfigured();
  const folder = input.folder?.replace(/^\/+|\/+$/g, '') || defaultFolder();
  const publicIdBase = sanitizeFilename(input.filename) || 'file';

  const buffer = Buffer.isBuffer(input.body)
    ? input.body
    : Buffer.from(input.body);

  const result = await new Promise<{
    public_id: string;
    secure_url: string;
    width?: number;
    height?: number;
    format?: string;
    bytes?: number;
    resource_type?: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${new Date().toISOString().slice(0, 10)}/${publicIdBase}-${Date.now()}`,
        resource_type: 'auto',
        overwrite: false,
      },
      (error, uploaded) => {
        if (error || !uploaded) {
          reject(error ?? new Error('Cloudinary upload returned no result'));
          return;
        }
        resolve(uploaded);
      },
    );
    Readable.from(buffer).pipe(stream);
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    resourceType: result.resource_type || 'image',
  };
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'image',
): Promise<void> {
  ensureConfigured();
  const type = resourceType === 'auto' ? 'image' : resourceType;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: type,
      invalidate: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/not found/i.test(message)) return;
    throw error;
  }
}

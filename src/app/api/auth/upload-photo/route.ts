import { jsonError, jsonOk } from '@/lib/cms/api-guard';
import { isCloudinaryConfigured } from '@/lib/storage/cloudinary';
import { storeImageBuffer } from '@/lib/media/image-store';
import { findRegisterToken } from '@/lib/auth/server-ops';

/**
 * Member profile photo during invite registration.
 * Requires a valid registerToken (issued after OTP verify).
 */
export async function POST(request: Request) {
  try {
    if (!isCloudinaryConfigured()) {
      return jsonError(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
        503,
      );
    }

    const form = await request.formData();
    const file = form.get('file');
    const registerToken =
      typeof form.get('registerToken') === 'string'
        ? (form.get('registerToken') as string)
        : '';

    if (!(file instanceof File)) {
      return jsonError('Missing file field');
    }
    if (!registerToken) {
      return jsonError('Missing registration token', 401);
    }

    const tokenOk = await findRegisterToken(registerToken);
    if (!tokenOk) {
      return jsonError('Invalid or expired registration token', 401);
    }

    if (file.size > 12 * 1024 * 1024) {
      return jsonError('File too large (max 12 MB)', 413);
    }
    if (!file.type.startsWith('image/')) {
      return jsonError('Only image uploads are allowed');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { item } = await storeImageBuffer({
      body: buffer,
      contentType: file.type || 'image/jpeg',
      filename: file.name || 'profile.jpg',
      title: file.name || 'Profile photo',
      kind: 'image',
      folder: 'bksr/people',
    });

    return jsonOk({
      url: item.url,
      storage: {
        url: item.url,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return jsonError(message, 500);
  }
}

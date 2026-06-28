/*
 * Purpose: Cloudinary upload and asset management helpers.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { cloudinary } from '../config/cloudinary';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format?: string;
  bytes?: number;
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: unknown;
}

/**
 * Upload a buffer to Cloudinary.
 * @param buffer File buffer.
 * @param options Upload options.
 * @returns Promise resolving to the upload result.
 * @throws Error When the upload fails.
 */
export async function uploadFile(buffer: Buffer, options: UploadOptions = {}): Promise<CloudinaryUploadResult> {
  return await new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder ?? 'open-innovation-marketplace',
        public_id: options.publicId,
        resource_type: options.resourceType ?? 'auto',
        transformation: options.transformation
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          resource_type: result.resource_type,
          format: result.format,
          bytes: result.bytes
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Upload a PDF document.
 * @param buffer PDF file buffer.
 * @param filename Original filename.
 * @returns Promise resolving to the secure URL.
 * @throws Error When the upload fails.
 */
export async function uploadPDF(buffer: Buffer, filename: string): Promise<string> {
  const result = await uploadFile(buffer, { folder: 'open-innovation-marketplace/pdfs', publicId: filename, resourceType: 'raw' });
  return result.secure_url;
}

/**
 * Upload a video.
 * @param buffer Video file buffer.
 * @param filename Original filename.
 * @returns Promise resolving to the secure URL.
 * @throws Error When the upload fails.
 */
export async function uploadVideo(buffer: Buffer, filename: string): Promise<string> {
  const result = await uploadFile(buffer, { folder: 'open-innovation-marketplace/videos', publicId: filename, resourceType: 'video' });
  return result.secure_url;
}

/**
 * Upload an image.
 * @param buffer Image file buffer.
 * @param filename Original filename.
 * @returns Promise resolving to the secure URL.
 * @throws Error When the upload fails.
 */
export async function uploadImage(buffer: Buffer, filename: string): Promise<string> {
  const result = await uploadFile(buffer, {
    folder: 'open-innovation-marketplace/images',
    publicId: filename,
    resourceType: 'image',
    transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }]
  });
  return result.secure_url;
}

/**
 * Delete a Cloudinary asset.
 * @param publicId Public asset identifier.
 * @returns Promise resolving when deletion completes.
 * @throws Error When deletion fails.
 */
export async function deleteFile(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}

/**
 * Generate a signed temporary URL.
 * @param publicId Public asset identifier.
 * @param expiry Expiry timestamp in seconds.
 * @returns A signed URL string.
 * @throws Error When signing fails.
 */
export function generateSignedUrl(publicId: string, expiry: number): string {
  return cloudinary.url(publicId, { sign_url: true, type: 'authenticated', expires_at: expiry });
}

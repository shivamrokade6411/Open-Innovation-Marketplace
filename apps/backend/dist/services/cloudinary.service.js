"use strict";
/*
 * Purpose: Cloudinary upload and asset management helpers.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.uploadPDF = uploadPDF;
exports.uploadVideo = uploadVideo;
exports.uploadImage = uploadImage;
exports.deleteFile = deleteFile;
exports.generateSignedUrl = generateSignedUrl;
const cloudinary_1 = require("../config/cloudinary");
/**
 * Upload a buffer to Cloudinary.
 * @param buffer File buffer.
 * @param options Upload options.
 * @returns Promise resolving to the upload result.
 * @throws Error When the upload fails.
 */
async function uploadFile(buffer, options = {}) {
    return await new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({
            folder: options.folder ?? 'open-innovation-marketplace',
            public_id: options.publicId,
            resource_type: options.resourceType ?? 'auto',
            transformation: options.transformation
        }, (error, result) => {
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
        });
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
async function uploadPDF(buffer, filename) {
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
async function uploadVideo(buffer, filename) {
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
async function uploadImage(buffer, filename) {
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
async function deleteFile(publicId) {
    await cloudinary_1.cloudinary.uploader.destroy(publicId, { invalidate: true });
}
/**
 * Generate a signed temporary URL.
 * @param publicId Public asset identifier.
 * @param expiry Expiry timestamp in seconds.
 * @returns A signed URL string.
 * @throws Error When signing fails.
 */
function generateSignedUrl(publicId, expiry) {
    return cloudinary_1.cloudinary.url(publicId, { sign_url: true, type: 'authenticated', expires_at: expiry });
}

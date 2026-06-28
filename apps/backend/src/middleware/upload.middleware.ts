/*
 * Purpose: File upload middleware with MIME and size validation.
 * Author: Copilot
 * Date: 2026-06-28
 */

import multer from 'multer';
import type { FileFilterCallback } from 'multer';
import { AppError } from './errorHandler.middleware';

const memoryStorage = multer.memoryStorage();

function fileFilter(_req: Express.Request, file: Express.Multer.File, callback: FileFilterCallback): void {
  const pdfTypes = ['application/pdf'];
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const videoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
  const zipTypes = ['application/zip', 'application/x-zip-compressed'];
  const allowed = [...pdfTypes, ...imageTypes, ...videoTypes, ...zipTypes];

  if (!allowed.includes(file.mimetype)) {
    callback(new AppError('Unsupported file type', 400, 'INVALID_FILE_TYPE'));
    return;
  }
  callback(null, true);
}

export const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

/**
 * Upload a single file.
 * @param fieldName The form field name.
 * @returns Multer middleware.
 * @throws AppError when upload validation fails.
 */
export function uploadSingle(fieldName: string) {
  return upload.single(fieldName);
}

/**
 * Upload multiple files.
 * @param fieldName The form field name.
 * @param maxCount Maximum number of files.
 * @returns Multer middleware.
 * @throws AppError when upload validation fails.
 */
export function uploadMultiple(fieldName: string, maxCount: number) {
  return upload.array(fieldName, maxCount);
}

/**
 * Upload mixed file fields.
 * @returns Multer middleware for mixed uploads.
 * @throws AppError when upload validation fails.
 */
export function uploadMixed() {
  return upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'code', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]);
}

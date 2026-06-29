"use strict";
/*
 * Purpose: File upload middleware with MIME and size validation.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.uploadSingle = uploadSingle;
exports.uploadMultiple = uploadMultiple;
exports.uploadMixed = uploadMixed;
const multer_1 = __importDefault(require("multer"));
const errorHandler_middleware_1 = require("./errorHandler.middleware");
const memoryStorage = multer_1.default.memoryStorage();
function fileFilter(_req, file, callback) {
    const pdfTypes = ['application/pdf'];
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const zipTypes = ['application/zip', 'application/x-zip-compressed'];
    const allowed = [...pdfTypes, ...imageTypes, ...videoTypes, ...zipTypes];
    if (!allowed.includes(file.mimetype)) {
        callback(new errorHandler_middleware_1.AppError('Unsupported file type', 400, 'INVALID_FILE_TYPE'));
        return;
    }
    callback(null, true);
}
exports.upload = (0, multer_1.default)({
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
function uploadSingle(fieldName) {
    return exports.upload.single(fieldName);
}
/**
 * Upload multiple files.
 * @param fieldName The form field name.
 * @param maxCount Maximum number of files.
 * @returns Multer middleware.
 * @throws AppError when upload validation fails.
 */
function uploadMultiple(fieldName, maxCount) {
    return exports.upload.array(fieldName, maxCount);
}
/**
 * Upload mixed file fields.
 * @returns Multer middleware for mixed uploads.
 * @throws AppError when upload validation fails.
 */
function uploadMixed() {
    return exports.upload.fields([
        { name: 'pdf', maxCount: 1 },
        { name: 'video', maxCount: 1 },
        { name: 'code', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]);
}

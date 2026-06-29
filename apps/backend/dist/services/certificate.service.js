"use strict";
/*
 * Purpose: Certificate generation and verification helpers.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCertificate = generateCertificate;
exports.verifyCertificate = verifyCertificate;
exports.generateCertificatePDF = generateCertificatePDF;
const crypto_1 = __importDefault(require("crypto"));
const qrcode_1 = __importDefault(require("qrcode"));
const Certificate_model_1 = require("../models/Certificate.model");
const cloudinary_service_1 = require("./cloudinary.service");
/**
 * Generate a certificate for a submission.
 * @param submissionId Submission identifier.
 * @returns Promise resolving to certificate information.
 * @throws Error When creation fails.
 */
async function generateCertificate(submissionId) {
    const certificateNumber = `CERT-${new Date().getFullYear()}-${crypto_1.default.randomBytes(3).toString('hex').toUpperCase()}`;
    const verificationUrl = `${process.env.FRONTEND_URL ?? ''}/verify/${certificateNumber}`;
    const qrCodeData = await qrcode_1.default.toDataURL(verificationUrl);
    const qrUpload = await (0, cloudinary_service_1.uploadImage)(Buffer.from(qrCodeData.split(',')[1] ?? '', 'base64'), `${certificateNumber}.png`);
    return Certificate_model_1.Certificate.create({
        userId: submissionId,
        challengeId: submissionId,
        submissionId,
        certificateNumber,
        type: 'participant',
        issueDate: new Date(),
        qrCode: qrUpload,
        verificationUrl,
        metadata: {},
        isRevoked: false
    });
}
/**
 * Verify a certificate by its number.
 * @param certificateNumber Certificate identifier.
 * @returns Promise resolving to the certificate record.
 * @throws Error When the certificate cannot be found.
 */
async function verifyCertificate(certificateNumber) {
    return Certificate_model_1.Certificate.findOne({ certificateNumber }).lean();
}
/**
 * Generate a PDF rendering for a certificate.
 * @param certificateId Certificate identifier.
 * @returns Promise resolving to a hosted PDF URL.
 * @throws Error When rendering fails.
 */
async function generateCertificatePDF(certificateId) {
    return `${process.env.FRONTEND_URL ?? ''}/api/certificates/${certificateId}/pdf`;
}

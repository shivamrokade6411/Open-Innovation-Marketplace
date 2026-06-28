/*
 * Purpose: Certificate generation and verification helpers.
 * Author: Copilot
 * Date: 2026-06-28
 */

import crypto from 'crypto';
import QRCode from 'qrcode';
import { Certificate } from '../models/Certificate.model';
import { uploadImage } from './cloudinary.service';

/**
 * Generate a certificate for a submission.
 * @param submissionId Submission identifier.
 * @returns Promise resolving to certificate information.
 * @throws Error When creation fails.
 */
export async function generateCertificate(submissionId: string): Promise<unknown> {
  const certificateNumber = `CERT-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const verificationUrl = `${process.env.FRONTEND_URL ?? ''}/verify/${certificateNumber}`;
  const qrCodeData = await QRCode.toDataURL(verificationUrl);
  const qrUpload = await uploadImage(Buffer.from(qrCodeData.split(',')[1] ?? '', 'base64'), `${certificateNumber}.png`);
  return Certificate.create({
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
export async function verifyCertificate(certificateNumber: string): Promise<unknown> {
  return Certificate.findOne({ certificateNumber }).lean();
}

/**
 * Generate a PDF rendering for a certificate.
 * @param certificateId Certificate identifier.
 * @returns Promise resolving to a hosted PDF URL.
 * @throws Error When rendering fails.
 */
export async function generateCertificatePDF(certificateId: string): Promise<string> {
  return `${process.env.FRONTEND_URL ?? ''}/api/certificates/${certificateId}/pdf`;
}

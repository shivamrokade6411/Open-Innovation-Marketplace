/*
 * Purpose: Certificate issuance and verification handlers.
 * Author: Copilot
 * Date: 2026-07-01
 */

import { Response } from 'express';
import { createHash, randomBytes } from 'crypto';
import QRCode from 'qrcode';
import { Certificate } from '../models/Certificate.model';
import { Submission } from '../models/Submission.model';
import { User } from '../models/User.model';
import type { AuthRequest } from '../types/express';

function generateCertificateHash(submissionId: string, userId: string, timestamp: string): string {
  const data = `${submissionId}-${userId}-${timestamp}-${randomBytes(8).toString('hex')}`;
  return createHash('sha256').update(data).digest('hex');
}

function generateCertificateNumber(): string {
  return `CERT-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;
}

export const issueCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId, rewardAmount = 0, type = 'participant' } = req.body;

    if (!submissionId) {
      return res.status(400).json({ success: false, message: 'submissionId is required' });
    }

    // Check if certificate already exists
    const existing = await Certificate.findOne({ submissionId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued for this submission'
      });
    }

    // Get submission details
    const submission = await Submission.findById(submissionId)
      .populate('userId', 'name email')
      .populate('challengeId', 'title');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const timestamp = new Date().toISOString();
    const hash = generateCertificateHash(
      submissionId.toString(),
      submission.userId._id.toString(),
      timestamp
    );
    const certificateNumber = generateCertificateNumber();

    // Generate verification URL
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/verify/${hash}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(verificationUrl);

    // Create certificate
    const certificate = await Certificate.create({
      userId: submission.userId._id,
      challengeId: submission.challengeId,
      submissionId,
      certificateNumber,
      hash,
      type,
      qrCode,
      verificationUrl,
      rewardAmount,
      rewardCurrency: 'USD',
      metadata: {
        submissionTitle: submission.title,
        challenge: submission.challengeId.title,
        submitterName: submission.userId.name,
        submitterEmail: submission.userId.email,
        issuedAt: timestamp,
        submissionScore: submission.score || 0
      }
    });

    // Update submission with certificate reference
    await Submission.findByIdAndUpdate(submissionId, { certificateId: certificate._id });

    res.status(201).json({
      success: true,
      data: certificate,
      message: 'Certificate issued successfully'
    });
  } catch (error) {
    console.error('[Certificate] Issue error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to issue certificate'
    });
  }
};

export const verifyCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { hash } = req.params;

    if (!hash || hash.length !== 64) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate hash format',
        isValid: false
      });
    }

    const certificate = await Certificate.findOne({ hash })
      .populate('userId', 'name email avatar')
      .populate('challengeId', 'title description')
      .populate('submissionId', 'title score');

    if (!certificate) {
      return res.json({
        success: false,
        message: 'Certificate not found',
        isValid: false,
        data: null
      });
    }

    if (certificate.isRevoked) {
      return res.json({
        success: false,
        message: 'Certificate has been revoked',
        isValid: false,
        data: certificate,
        revokedAt: certificate.updatedAt
      });
    }

    res.json({
      success: true,
      isValid: true,
      message: 'Certificate is valid',
      data: {
        certificateNumber: certificate.certificateNumber,
        recipient: certificate.userId.name,
        email: certificate.userId.email,
        challenge: certificate.challengeId.title,
        type: certificate.type,
        issuedAt: certificate.issueDate,
        submissionScore: certificate.submissionId.score,
        rewardAmount: certificate.rewardAmount,
        rewardCurrency: certificate.rewardCurrency,
        payoutStatus: certificate.payoutStatus,
        txRef: certificate.txRef
      }
    });
  } catch (error) {
    console.error('[Certificate] Verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      isValid: false
    });
  }
};

export const getCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user?.id;

    const certificate = await Certificate.findById(certificateId)
      .populate('userId', 'name email avatar')
      .populate('challengeId', 'title description')
      .populate('submissionId');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check access: user owns certificate or is admin
    if (certificate.userId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    res.json({ success: true, data: certificate });
  } catch (error) {
    console.error('[Certificate] Get error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate'
    });
  }
};

export const getUserCertificates = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const certificates = await Certificate.find({ userId })
      .populate('challengeId', 'title')
      .populate('submissionId', 'title score')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      data: certificates,
      count: certificates.length
    });
  } catch (error) {
    console.error('[Certificate] GetUser error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates'
    });
  }
};

export const updatePayoutStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { certificateId } = req.params;
    const { payoutStatus, txRef } = req.body;

    if (!['pending', 'processing', 'completed', 'failed'].includes(payoutStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payout status'
      });
    }

    const certificate = await Certificate.findByIdAndUpdate(
      certificateId,
      { payoutStatus, txRef: txRef || null },
      { new: true }
    );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      data: certificate,
      message: 'Payout status updated'
    });
  } catch (error) {
    console.error('[Certificate] UpdatePayout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payout status'
    });
  }
};

export const revokeCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { certificateId } = req.params;
    const { reason } = req.body;

    const certificate = await Certificate.findByIdAndUpdate(
      certificateId,
      {
        isRevoked: true,
        metadata: {
          ...certificate?.metadata,
          revokedAt: new Date().toISOString(),
          revokeReason: reason
        }
      },
      { new: true }
    );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      data: certificate,
      message: 'Certificate revoked'
    });
  } catch (error) {
    console.error('[Certificate] Revoke error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke certificate'
    });
  }
};

/*
 * Purpose: Certificate API routes.
 * Author: Copilot
 * Date: 2026-07-01
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  issueCertificate,
  verifyCertificate,
  getCertificate,
  getUserCertificates,
  updatePayoutStatus,
  revokeCertificate
} from '../controllers/certificate.controller';

const router = Router();

/**
 * POST /api/certificates
 * Issue a new certificate (requires auth)
 */
router.post('/certificates', authenticateJWT, issueCertificate);

/**
 * GET /api/certificates/verify/:hash
 * Public endpoint to verify a certificate by hash
 */
router.get('/certificates/verify/:hash', verifyCertificate);

/**
 * GET /api/certificates/:certificateId
 * Get certificate details (requires auth + ownership)
 */
router.get('/certificates/:certificateId', authenticateJWT, getCertificate);

/**
 * GET /api/certificates/user/my-certificates
 * Get all certificates for current user
 */
router.get('/certificates/user/my-certificates', authenticateJWT, getUserCertificates);

/**
 * PATCH /api/certificates/:certificateId/payout
 * Update payout status
 */
router.patch('/certificates/:certificateId/payout', authenticateJWT, updatePayoutStatus);

/**
 * POST /api/certificates/:certificateId/revoke
 * Revoke a certificate
 */
router.post('/certificates/:certificateId/revoke', authenticateJWT, revokeCertificate);

export default router;

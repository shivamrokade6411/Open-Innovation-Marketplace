/*
 * Purpose: Routing definitions for platform Admin actions.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  getUsers,
  verifyCompany,
  moderateChallenge,
  moderateSubmission,
  getPaymentsList,
  getPlatformAnalytics
} from '../controllers/admin.controller';

const router = Router();

// Apply auth middleware to protect all admin endpoints
router.use(authenticateJWT);

router.get('/users', getUsers);
router.post('/companies/:companyId/verify', verifyCompany);
router.post('/challenges/:challengeId/moderate', moderateChallenge);
router.post('/submissions/:submissionId/moderate', moderateSubmission);
router.get('/payments', getPaymentsList);
router.get('/analytics', getPlatformAnalytics);

export default router;

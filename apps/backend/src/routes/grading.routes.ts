/*
 * Purpose: Automated AI Grading API routes.
 * Author: Antigravity
 * Date: 2026-08-15
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { companyOrAdmin } from '../middleware/role.middleware';
import {
  gradeSubmission,
  getGradingResult,
  getGradingStats,
  submitSandboxGrading,
  overrideScore,
  getGradingSubmissions
} from '../controllers/grading.controller';

const router = Router();

// Sandbox & general grading submission
router.post('/grading/submit', authenticateJWT, submitSandboxGrading);

// Fetch grading result by id or submissionId
router.get('/grading/:id', authenticateJWT, getGradingResult);

// Manual score override for organizers
router.post('/grading/:submissionId/override', authenticateJWT, companyOrAdmin, overrideScore);

// List all submissions ranked by score
router.get('/grading/submissions', authenticateJWT, getGradingSubmissions);

// Legacy/Alternative compatibility endpoints
router.post('/submissions/:submissionId/grade', authenticateJWT, gradeSubmission);
router.get('/submissions/:submissionId/grade', authenticateJWT, getGradingResult);
router.get('/challenges/:challengeId/grading-stats', authenticateJWT, getGradingStats);

export default router;

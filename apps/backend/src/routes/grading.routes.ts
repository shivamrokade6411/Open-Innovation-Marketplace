/*
 * Purpose: Automated AI Grading API routes.
 * Author: Copilot
 * Date: 2026-07-01
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { gradeSubmission, getGradingResult, getGradingStats } from '../controllers/grading.controller';

const router = Router();

/**
 * POST /api/submissions/:submissionId/grade
 * Trigger AI grading for a submission
 */
router.post('/submissions/:submissionId/grade', authenticateJWT, gradeSubmission);

/**
 * GET /api/submissions/:submissionId/grade
 * Get grading result for a submission
 */
router.get('/submissions/:submissionId/grade', getGradingResult);

/**
 * GET /api/challenges/:challengeId/grading-stats
 * Get aggregated grading statistics for a challenge
 */
router.get('/challenges/:challengeId/grading-stats', getGradingStats);

export default router;

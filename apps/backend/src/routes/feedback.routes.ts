/*
 * Purpose: Expert Mentor Feedback API routes.
 * Author: Copilot
 * Date: 2026-07-01
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { getFeedback, createFeedback, updateFeedback, deleteFeedback } from '../controllers/feedback.controller';

const router = Router();

/**
 * GET /api/submissions/:submissionId/feedback
 * Fetch all feedback for a submission
 */
router.get('/submissions/:submissionId/feedback', getFeedback);

/**
 * POST /api/submissions/:submissionId/feedback
 * Create new feedback (requires auth)
 */
router.post('/submissions/:submissionId/feedback', authenticateJWT, createFeedback);

/**
 * PATCH /api/submissions/:submissionId/feedback/:feedbackId
 * Update feedback (requires auth + ownership)
 */
router.patch('/submissions/:submissionId/feedback/:feedbackId', authenticateJWT, updateFeedback);

/**
 * DELETE /api/submissions/:submissionId/feedback/:feedbackId
 * Delete feedback (requires auth + ownership)
 */
router.delete('/submissions/:submissionId/feedback/:feedbackId', authenticateJWT, deleteFeedback);

export default router;

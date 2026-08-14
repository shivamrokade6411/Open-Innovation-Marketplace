/*
 * Purpose: Evaluation grading and status audit routing.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  submitReview,
  updateSubmissionStatus,
  getReviewsForSubmission,
  getAuditTrailForSubmission
} from '../controllers/review.controller';

export const reviewRouter = Router();

reviewRouter.post('/submissions/:submissionId/reviews', authenticateJWT, submitReview);
reviewRouter.get('/submissions/:submissionId/reviews', authenticateJWT, getReviewsForSubmission);
reviewRouter.post('/submissions/:submissionId/status', authenticateJWT, updateSubmissionStatus);
reviewRouter.get('/submissions/:submissionId/audit-trail', authenticateJWT, getAuditTrailForSubmission);

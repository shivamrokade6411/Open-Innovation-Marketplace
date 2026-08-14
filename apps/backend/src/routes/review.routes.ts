import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  submitReview,
  updateSubmissionStatus,
  getReviewsForSubmission,
  getAuditTrailForSubmission,
  evaluateSustainability,
  getSustainability
} from '../controllers/review.controller';

export const reviewRouter = Router();

reviewRouter.post('/submissions/:submissionId/reviews', authenticateJWT, submitReview);
reviewRouter.get('/submissions/:submissionId/reviews', authenticateJWT, getReviewsForSubmission);
reviewRouter.post('/submissions/:submissionId/status', authenticateJWT, updateSubmissionStatus);
reviewRouter.get('/submissions/:submissionId/audit-trail', authenticateJWT, getAuditTrailForSubmission);
reviewRouter.post('/submissions/:submissionId/sustainability', authenticateJWT, evaluateSustainability);
reviewRouter.get('/submissions/:submissionId/sustainability', authenticateJWT, getSustainability);

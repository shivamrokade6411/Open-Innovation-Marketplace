/*
 * Purpose: Submission route declarations.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { companyOnly, innovatorOnly } from '../middleware/role.middleware';
import { uploadMixed } from '../middleware/upload.middleware';
import { createSubmission, getSubmissionById, updateSubmission, reviewSubmission, shortlistSubmission, selectWinner, getMySubmissions } from '../controllers/submission.controller';

export const submissionRouter = Router();

submissionRouter.post('/', authenticateJWT, innovatorOnly, uploadMixed(), createSubmission);
submissionRouter.get('/my', authenticateJWT, innovatorOnly, getMySubmissions);
submissionRouter.get('/:id', authenticateJWT, getSubmissionById);
submissionRouter.put('/:id', authenticateJWT, innovatorOnly, uploadMixed(), updateSubmission);
submissionRouter.post('/:id/review', authenticateJWT, companyOnly, reviewSubmission);
submissionRouter.post('/:id/shortlist', authenticateJWT, companyOnly, shortlistSubmission);
submissionRouter.post('/:id/winner', authenticateJWT, companyOnly, selectWinner);

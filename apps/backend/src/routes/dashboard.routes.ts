/*
 * Purpose: Dashboard routing declarations.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  getParticipantDashboard,
  getCompanyDashboard,
  toggleSaveChallenge
} from '../controllers/dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.get('/participant', authenticateJWT, getParticipantDashboard);
dashboardRouter.get('/company', authenticateJWT, getCompanyDashboard);
dashboardRouter.post('/challenges/:challengeId/save', authenticateJWT, toggleSaveChallenge);

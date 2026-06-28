/*
 * Purpose: Challenge route declarations.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { companyOnly, companyOrAdmin } from '../middleware/role.middleware';
import { createChallenge, getChallenges, getChallengeById, updateChallenge, deleteChallenge, publishChallenge, getChallengeSubmissions, getMyPostedChallenges, getChallengeAnalytics } from '../controllers/challenge.controller';

export const challengeRouter = Router();

challengeRouter.get('/', getChallenges);
challengeRouter.post('/', authenticateJWT, companyOnly, createChallenge);
challengeRouter.get('/my/posted', authenticateJWT, companyOnly, getMyPostedChallenges);
challengeRouter.get('/:id', getChallengeById);
challengeRouter.put('/:id', authenticateJWT, companyOnly, updateChallenge);
challengeRouter.delete('/:id', authenticateJWT, companyOrAdmin, deleteChallenge);
challengeRouter.post('/:id/publish', authenticateJWT, companyOnly, publishChallenge);
challengeRouter.get('/:id/submissions', authenticateJWT, companyOrAdmin, getChallengeSubmissions);
challengeRouter.get('/:id/analytics', authenticateJWT, companyOnly, getChallengeAnalytics);

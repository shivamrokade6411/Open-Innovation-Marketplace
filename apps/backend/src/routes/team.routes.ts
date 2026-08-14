/*
 * Purpose: Team System routing declarations.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { innovatorOnly } from '../middleware/role.middleware';
import {
  createTeam,
  inviteUser,
  respondInvitation,
  removeMember,
  leaveTeam,
  updateTeam,
  getTeamDetails,
  getMyInvitations
} from '../controllers/team.controller';

export const teamRouter = Router();

teamRouter.post('/', authenticateJWT, innovatorOnly, createTeam);
teamRouter.get('/invites', authenticateJWT, innovatorOnly, getMyInvitations);
teamRouter.post('/:teamId/invite', authenticateJWT, innovatorOnly, inviteUser);
teamRouter.post('/invites/:inviteId/respond', authenticateJWT, innovatorOnly, respondInvitation);
teamRouter.delete('/:teamId/members/:userId', authenticateJWT, innovatorOnly, removeMember);
teamRouter.post('/:teamId/leave', authenticateJWT, innovatorOnly, leaveTeam);
teamRouter.put('/:teamId', authenticateJWT, innovatorOnly, updateTeam);
teamRouter.get('/:teamId', authenticateJWT, getTeamDetails);

/*
 * Purpose: Workspace routing declarations.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { uploadMixed } from '../middleware/upload.middleware';
import {
  getWorkspaceDetails,
  createTask,
  updateTask,
  deleteTask,
  createComment,
  createVersion
} from '../controllers/workspace.controller';

export const workspaceRouter = Router();

workspaceRouter.get('/:submissionId', authenticateJWT, getWorkspaceDetails);
workspaceRouter.post('/:submissionId/tasks', authenticateJWT, createTask);
workspaceRouter.put('/tasks/:taskId', authenticateJWT, updateTask);
workspaceRouter.delete('/tasks/:taskId', authenticateJWT, deleteTask);
workspaceRouter.post('/:submissionId/comments', authenticateJWT, createComment);
workspaceRouter.post('/:submissionId/versions', authenticateJWT, uploadMixed(), createVersion);

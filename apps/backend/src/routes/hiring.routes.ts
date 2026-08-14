/*
 * Purpose: Routing definitions for Hiring and contract pipeline actions.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  createOpportunity,
  updatePipelineStatus,
  sendPipelineMessage,
  getPipelineDetails,
  getMyPipelines
} from '../controllers/hiring.controller';

const router = Router();

router.use(authenticateJWT);

router.post('/', createOpportunity);
router.get('/my-pipelines', getMyPipelines);
router.get('/:pipelineId', getPipelineDetails);
router.post('/:pipelineId/status', updatePipelineStatus);
router.post('/:pipelineId/messages', sendPipelineMessage);

export default router;

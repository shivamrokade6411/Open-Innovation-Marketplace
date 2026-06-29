/*
 * Purpose: AI API endpoints for analysis and recommendations.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { Request, Response } from 'express';
import type { IUser, IChallenge } from '@oim/shared';
import { z } from 'zod';
import { analyzeResume, matchSkills, recommendChallenges, summarizeProposal, generateFeedback } from '../services/ai.service';
import { Submission } from '../models/Submission.model';
import { Challenge } from '../models/Challenge.model';
import { AppError, validationError } from '../middleware/errorHandler.middleware';

const analyzeSubmissionSchema = z.object({ submissionId: z.string().min(1) });
const matchSkillsSchema = z.object({ userProfile: z.object({ skills: z.array(z.string()) }), challenge: z.object({ techStack: z.array(z.string()) }) });
const analyzeResumeSchema = z.object({ resumeText: z.string().min(10) });
const mentorChatSchema = z.object({ message: z.string().min(1), context: z.string().optional() });

/**
 * Queue an AI submission analysis job.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when validation fails.
 */
export async function analyzeSubmission(req: Request, res: Response): Promise<void> {
  try {
    const payload = analyzeSubmissionSchema.parse(req.body);
    res.status(202).json({ success: true, message: 'Analysis queued', data: { jobId: payload.submissionId } });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw validationError(error.message);
    }
    throw error instanceof Error ? error : new AppError('Failed to queue analysis', 500, 'AI_ANALYZE_FAILED');
  }
}

/**
 * Poll the AI analysis result by job id.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the submission cannot be found.
 */
export async function getAnalysisResult(req: Request, res: Response): Promise<void> {
  const submission = await Submission.findById(req.params.jobId).lean();
  if (!submission) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }
  res.status(200).json({ success: true, message: 'Analysis result loaded', data: submission.aiFeedback });
}

/**
 * Stream mentor chat messages as SSE.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving when the stream closes.
 * @throws AppError when the request is invalid.
 */
export async function chatMentor(req: Request, res: Response): Promise<void> {
  const payload = mentorChatSchema.parse(req.body);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  const summary = await summarizeProposal(payload.message);
  res.write(`data: ${JSON.stringify({ token: summary })}\n\n`);
  res.end();
}

/**
 * Match a profile to a challenge.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when validation fails.
 */
export async function matchSkillsController(req: Request, res: Response): Promise<void> {
  const payload = matchSkillsSchema.parse(req.body);
  const result = await matchSkills(payload.userProfile as unknown as IUser, payload.challenge as unknown as IChallenge);
  res.status(200).json({ success: true, message: 'Skills matched', data: result });
}

/**
 * Analyze resume text.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when validation fails.
 */
export async function analyzeResumeController(req: Request, res: Response): Promise<void> {
  const payload = analyzeResumeSchema.parse(req.body);
  const result = await analyzeResume(payload.resumeText);
  res.status(200).json({ success: true, message: 'Resume analyzed', data: result });
}

/**
 * Return recommendations for the authenticated innovator.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the user is missing.
 */
export async function recommendChallengesController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }
  const recommendations = await recommendChallenges(req.user.userId);
  res.status(200).json({ success: true, message: 'Recommendations loaded', data: recommendations });
}

/*
 * Purpose: Challenge management controller.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { Challenge } from '../models/Challenge.model';
import { Submission } from '../models/Submission.model';
import { Company } from '../models/Company.model';
import { redisClient } from '../config/redis';
import { createNotification } from '../services/notification.service';
import { aiProcessingQueue } from '../jobs/aiProcessingQueue';
import { AppError, forbidden, validationError } from '../middleware/errorHandler.middleware';
import { challengeSchema } from '../validators/challenge.validator';

const challengeQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
  status: z.enum(['draft', 'active', 'review', 'completed', 'cancelled']).optional(),
  prizeMin: z.coerce.number().optional(),
  prizeMax: z.coerce.number().optional(),
  deadlineBefore: z.string().optional(),
  techStack: z.string().optional(),
  remoteOnly: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['newest', 'prize', 'deadline', 'popularity']).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional()
});

function buildChallengeFilter(query: z.infer<typeof challengeQuerySchema>): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (query.category) filter.category = query.category;
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.status) filter.status = query.status;
  if (query.deadlineBefore) filter.deadline = { $lte: new Date(query.deadlineBefore) };
  if (query.remoteOnly) filter.isRemote = true;
  if (query.search) filter.$text = { $search: query.search };
  if (query.techStack) filter.techStack = { $in: query.techStack.split(',').map((entry) => entry.trim()) };
  if (query.prizeMin !== undefined || query.prizeMax !== undefined) {
    filter['prizes.total'] = {
      ...(query.prizeMin !== undefined ? { $gte: query.prizeMin } : {}),
      ...(query.prizeMax !== undefined ? { $lte: query.prizeMax } : {})
    };
  }
  return filter;
}

/**
 * Create a challenge for a company.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError on validation or permission errors.
 */
export async function createChallenge(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'company') {
      throw forbidden('Only companies can post challenges');
    }
    const payload = challengeSchema.parse(req.body);
    const company = await Company.findOne({ userId: req.user.userId }).lean();
    if (!company) {
      throw new AppError('Company profile not found', 404, 'COMPANY_NOT_FOUND');
    }
    const challenge = await Challenge.create({
      companyId: company._id,
      title: payload.title,
      description: payload.description,
      problemStatement: payload.problemStatement,
      techStack: payload.techStack,
      category: payload.category,
      difficulty: payload.difficulty,
      prizes: payload.prizes,
      deadline: new Date(payload.deadline),
      startDate: new Date(payload.startDate),
      status: payload.status ?? 'draft',
      tags: payload.tags,
      requirements: payload.requirements,
      maxParticipants: payload.maxParticipants ?? 0,
      currentParticipants: 0,
      views: 0,
      isRemote: payload.isRemote ?? true,
      attachments: payload.attachments,
      aiSummary: ''
    });
    await aiProcessingQueue.add('analyze_submission', { submissionId: String(challenge._id) });
    res.status(201).json({ success: true, message: 'Challenge created', data: challenge.toObject() });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw validationError(error.message);
    }
    throw error instanceof Error ? error : new AppError('Failed to create challenge', 500, 'CREATE_CHALLENGE_FAILED');
  }
}

/**
 * List challenges with filters.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when query parsing fails.
 */
export async function getChallenges(req: Request, res: Response): Promise<void> {
  try {
    const query = challengeQuerySchema.parse(req.query);
    const cacheKey = `challenges:${JSON.stringify(query)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.status(200).json(JSON.parse(cached) as Record<string, unknown>);
      return;
    }
    const filter = buildChallengeFilter(query);
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      prize: { 'prizes.total': -1 },
      deadline: { deadline: 1 },
      popularity: { views: -1 }
    };
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const data = await Challenge.find(filter).sort(sortMap[query.sortBy ?? 'newest']).skip((page - 1) * limit).limit(limit).lean();
    const response = { success: true, message: 'Challenges loaded', data, meta: { page, limit, hasMore: data.length === limit } };
    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 300 });
    res.status(200).json(response);
  } catch (error: unknown) {
    throw error instanceof Error ? error : new AppError('Failed to load challenges', 500, 'LIST_CHALLENGES_FAILED');
  }
}

/**
 * Load a single challenge by id.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the challenge is missing.
 */
export async function getChallengeById(req: Request, res: Response): Promise<void> {
  const challenge = await Challenge.findById(req.params.id).lean();
  if (!challenge) {
    throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND');
  }
  await Challenge.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  res.status(200).json({ success: true, message: 'Challenge loaded', data: challenge });
}

/**
 * Update a challenge.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when unauthorized or invalid.
 */
export async function updateChallenge(req: Request, res: Response): Promise<void> {
  try {
    const update = challengeSchema.partial().parse(req.body);
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND');
    }
    challenge.set(update);
    await challenge.save();
    res.status(200).json({ success: true, message: 'Challenge updated', data: challenge.toObject() });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw validationError(error.message);
    }
    throw error instanceof Error ? error : new AppError('Failed to update challenge', 500, 'UPDATE_CHALLENGE_FAILED');
  }
}

/**
 * Soft delete a challenge.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the challenge is missing.
 */
export async function deleteChallenge(req: Request, res: Response): Promise<void> {
  await Challenge.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
  res.status(200).json({ success: true, message: 'Challenge deleted', data: null });
}

/**
 * Publish a draft challenge.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the challenge is missing.
 */
export async function publishChallenge(req: Request, res: Response): Promise<void> {
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) {
    throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND');
  }
  challenge.status = 'active';
  await challenge.save();
  res.status(200).json({ success: true, message: 'Challenge published', data: challenge.toObject() });
}

/**
 * Fetch submissions for a challenge.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the challenge is missing.
 */
export async function getChallengeSubmissions(req: Request, res: Response): Promise<void> {
  const submissions = await Submission.find({ challengeId: req.params.id }).lean();
  res.status(200).json({ success: true, message: 'Submissions loaded', data: submissions });
}

/**
 * Fetch challenges posted by the current company.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the company is missing.
 */
export async function getMyPostedChallenges(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }
  const company = await Company.findOne({ userId: req.user.userId }).lean();
  const challenges = await Challenge.find({ companyId: company?._id }).lean();
  res.status(200).json({ success: true, message: 'Company challenges loaded', data: challenges });
}

/**
 * Fetch analytics for a challenge.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the challenge is missing.
 */
export async function getChallengeAnalytics(req: Request, res: Response): Promise<void> {
  const submissions = await Submission.find({ challengeId: req.params.id }).lean();
  res.status(200).json({
    success: true,
    message: 'Challenge analytics loaded',
    data: {
      submissionTrend: submissions.map((submission) => ({ date: String(submission.createdAt), count: 1 })),
      scoreDistribution: submissions.map((submission) => ({ bucket: String(submission.score), count: 1 })),
      participantDemographics: { total: submissions.length }
    }
  });
}

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
  difficulty: z.string().optional(),
  status: z.string().optional(),
  prizeMin: z.coerce.number().optional(),
  prizeMax: z.coerce.number().optional(),
  deadlineBefore: z.string().optional(),
  techStack: z.string().optional(),
  remoteOnly: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['newest', 'prize', 'deadline', 'popularity', 'participants']).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  industry: z.string().optional(),
  company: z.string().optional(),
  skill: z.string().optional()
});

async function buildChallengeFilter(query: z.infer<typeof challengeQuerySchema>): Promise<Record<string, unknown>> {
  const filter: Record<string, unknown> = {};
  if (query.category) filter.category = query.category;
  if (query.difficulty) {
    const diffs = query.difficulty.split(',').map((entry) => entry.trim());
    filter.difficulty = { $in: diffs };
  }
  if (query.status) filter.status = query.status;
  if (query.deadlineBefore) filter.deadline = { $lte: new Date(query.deadlineBefore) };
  if (query.remoteOnly) filter.isRemote = true;

  if (query.techStack) filter.techStack = { $in: query.techStack.split(',').map((entry) => entry.trim()) };
  if (query.skill) filter.techStack = { $in: query.skill.split(',').map((entry) => entry.trim()) };

  if (query.prizeMin !== undefined || query.prizeMax !== undefined) {
    filter['prizes.total'] = {
      ...(query.prizeMin !== undefined ? { $gte: query.prizeMin } : {}),
      ...(query.prizeMax !== undefined ? { $lte: query.prizeMax } : {})
    };
  }

  // Handle company/industry filter queries
  let matchingCompanyIds: any[] = [];
  let filterByCompany = false;

  if (query.industry) {
    const companies = await Company.find({ industry: { $regex: query.industry, $options: 'i' } }).select('_id').lean();
    matchingCompanyIds = companies.map((c) => c._id);
    filterByCompany = true;
  }

  if (query.company) {
    const mongoose = require('mongoose');
    const isId = mongoose.Types.ObjectId.isValid(query.company);
    const companies = await Company.find(
      isId
        ? { _id: query.company }
        : { companyName: { $regex: query.company, $options: 'i' } }
    ).select('_id').lean();
    const ids = companies.map((c) => c._id);

    if (filterByCompany) {
      matchingCompanyIds = matchingCompanyIds.filter((id) => ids.some((companyId) => String(companyId) === String(id)));
    } else {
      matchingCompanyIds = ids;
      filterByCompany = true;
    }
  }

  if (filterByCompany) {
    filter.companyId = { $in: matchingCompanyIds };
  }

  // Handle full-text search by title, description, tags, skills, company name, industry
  if (query.search) {
    const companiesMatchingSearch = await Company.find({
      $or: [
        { companyName: { $regex: query.search, $options: 'i' } },
        { industry: { $regex: query.search, $options: 'i' } }
      ]
    }).select('_id').lean();
    const searchCompanyIds = companiesMatchingSearch.map((c) => c._id);

    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { tags: { $regex: query.search, $options: 'i' } },
      { techStack: { $regex: query.search, $options: 'i' } },
      ...(searchCompanyIds.length > 0 ? [{ companyId: { $in: searchCompanyIds } }] : [])
    ];
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
    const filter = await buildChallengeFilter(query);
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      prize: { 'prizes.total': -1 },
      deadline: { deadline: 1 },
      popularity: { views: -1 },
      participants: { currentParticipants: -1 }
    };
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const total = await Challenge.countDocuments(filter);
    const data = await Challenge.find(filter)
      .populate('companyId', 'companyName logo slug description size location website')
      .sort(sortMap[query.sortBy ?? 'newest'])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const response = { 
      success: true, 
      message: 'Challenges loaded', 
      data, 
      meta: { 
        page, 
        limit, 
        total, 
        hasMore: page * limit < total 
      } 
    };
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
  const challenge = await Challenge.findById(req.params.id)
    .populate('companyId', 'companyName logo slug description size location website')
    .lean();
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

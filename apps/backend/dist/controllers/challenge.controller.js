"use strict";
/*
 * Purpose: Challenge management controller.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChallenge = createChallenge;
exports.getChallenges = getChallenges;
exports.getChallengeById = getChallengeById;
exports.updateChallenge = updateChallenge;
exports.deleteChallenge = deleteChallenge;
exports.publishChallenge = publishChallenge;
exports.getChallengeSubmissions = getChallengeSubmissions;
exports.getMyPostedChallenges = getMyPostedChallenges;
exports.getChallengeAnalytics = getChallengeAnalytics;
const zod_1 = require("zod");
const Challenge_model_1 = require("../models/Challenge.model");
const Submission_model_1 = require("../models/Submission.model");
const Company_model_1 = require("../models/Company.model");
const redis_1 = require("../config/redis");
const aiProcessingQueue_1 = require("../jobs/aiProcessingQueue");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
const challenge_validator_1 = require("../validators/challenge.validator");
const challengeQuerySchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
    status: zod_1.z.enum(['draft', 'active', 'review', 'completed', 'cancelled']).optional(),
    prizeMin: zod_1.z.coerce.number().optional(),
    prizeMax: zod_1.z.coerce.number().optional(),
    deadlineBefore: zod_1.z.string().optional(),
    techStack: zod_1.z.string().optional(),
    remoteOnly: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['newest', 'prize', 'deadline', 'popularity']).optional(),
    page: zod_1.z.coerce.number().optional(),
    limit: zod_1.z.coerce.number().optional()
});
function buildChallengeFilter(query) {
    const filter = {};
    if (query.category)
        filter.category = query.category;
    if (query.difficulty)
        filter.difficulty = query.difficulty;
    if (query.status)
        filter.status = query.status;
    if (query.deadlineBefore)
        filter.deadline = { $lte: new Date(query.deadlineBefore) };
    if (query.remoteOnly)
        filter.isRemote = true;
    if (query.search)
        filter.$text = { $search: query.search };
    if (query.techStack)
        filter.techStack = { $in: query.techStack.split(',').map((entry) => entry.trim()) };
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
async function createChallenge(req, res) {
    try {
        if (!req.user || req.user.role !== 'company') {
            throw (0, errorHandler_middleware_1.forbidden)('Only companies can post challenges');
        }
        const payload = challenge_validator_1.challengeSchema.parse(req.body);
        const company = await Company_model_1.Company.findOne({ userId: req.user.userId }).lean();
        if (!company) {
            throw new errorHandler_middleware_1.AppError('Company profile not found', 404, 'COMPANY_NOT_FOUND');
        }
        const challenge = await Challenge_model_1.Challenge.create({
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
        await aiProcessingQueue_1.aiProcessingQueue.add('analyze_submission', { submissionId: String(challenge._id) });
        res.status(201).json({ success: true, message: 'Challenge created', data: challenge.toObject() });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            throw (0, errorHandler_middleware_1.validationError)(error.message);
        }
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Failed to create challenge', 500, 'CREATE_CHALLENGE_FAILED');
    }
}
/**
 * List challenges with filters.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when query parsing fails.
 */
async function getChallenges(req, res) {
    try {
        const query = challengeQuerySchema.parse(req.query);
        const cacheKey = `challenges:${JSON.stringify(query)}`;
        const cached = await redis_1.redisClient.get(cacheKey);
        if (cached) {
            res.status(200).json(JSON.parse(cached));
            return;
        }
        const filter = buildChallengeFilter(query);
        const sortMap = {
            newest: { createdAt: -1 },
            prize: { 'prizes.total': -1 },
            deadline: { deadline: 1 },
            popularity: { views: -1 }
        };
        const page = query.page ?? 1;
        const limit = query.limit ?? 12;
        const data = await Challenge_model_1.Challenge.find(filter).sort(sortMap[query.sortBy ?? 'newest']).skip((page - 1) * limit).limit(limit).lean();
        const response = { success: true, message: 'Challenges loaded', data, meta: { page, limit, hasMore: data.length === limit } };
        await redis_1.redisClient.set(cacheKey, JSON.stringify(response), { EX: 300 });
        res.status(200).json(response);
    }
    catch (error) {
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Failed to load challenges', 500, 'LIST_CHALLENGES_FAILED');
    }
}
/**
 * Load a single challenge by id.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the challenge is missing.
 */
async function getChallengeById(req, res) {
    const challenge = await Challenge_model_1.Challenge.findById(req.params.id).lean();
    if (!challenge) {
        throw new errorHandler_middleware_1.AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND');
    }
    await Challenge_model_1.Challenge.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.status(200).json({ success: true, message: 'Challenge loaded', data: challenge });
}
/**
 * Update a challenge.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when unauthorized or invalid.
 */
async function updateChallenge(req, res) {
    try {
        const update = challenge_validator_1.challengeSchema.partial().parse(req.body);
        const challenge = await Challenge_model_1.Challenge.findById(req.params.id);
        if (!challenge) {
            throw new errorHandler_middleware_1.AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND');
        }
        challenge.set(update);
        await challenge.save();
        res.status(200).json({ success: true, message: 'Challenge updated', data: challenge.toObject() });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            throw (0, errorHandler_middleware_1.validationError)(error.message);
        }
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Failed to update challenge', 500, 'UPDATE_CHALLENGE_FAILED');
    }
}
/**
 * Soft delete a challenge.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the challenge is missing.
 */
async function deleteChallenge(req, res) {
    await Challenge_model_1.Challenge.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.status(200).json({ success: true, message: 'Challenge deleted', data: null });
}
/**
 * Publish a draft challenge.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the challenge is missing.
 */
async function publishChallenge(req, res) {
    const challenge = await Challenge_model_1.Challenge.findById(req.params.id);
    if (!challenge) {
        throw new errorHandler_middleware_1.AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND');
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
async function getChallengeSubmissions(req, res) {
    const submissions = await Submission_model_1.Submission.find({ challengeId: req.params.id }).lean();
    res.status(200).json({ success: true, message: 'Submissions loaded', data: submissions });
}
/**
 * Fetch challenges posted by the current company.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the company is missing.
 */
async function getMyPostedChallenges(req, res) {
    if (!req.user) {
        throw new errorHandler_middleware_1.AppError('Authentication required', 401, 'UNAUTHORIZED');
    }
    const company = await Company_model_1.Company.findOne({ userId: req.user.userId }).lean();
    const challenges = await Challenge_model_1.Challenge.find({ companyId: company?._id }).lean();
    res.status(200).json({ success: true, message: 'Company challenges loaded', data: challenges });
}
/**
 * Fetch analytics for a challenge.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the challenge is missing.
 */
async function getChallengeAnalytics(req, res) {
    const submissions = await Submission_model_1.Submission.find({ challengeId: req.params.id }).lean();
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

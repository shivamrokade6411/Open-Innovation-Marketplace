"use strict";
/*
 * Purpose: AI API endpoints for analysis and recommendations.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeSubmission = analyzeSubmission;
exports.getAnalysisResult = getAnalysisResult;
exports.chatMentor = chatMentor;
exports.matchSkillsController = matchSkillsController;
exports.analyzeResumeController = analyzeResumeController;
exports.recommendChallengesController = recommendChallengesController;
const zod_1 = require("zod");
const ai_service_1 = require("../services/ai.service");
const Submission_model_1 = require("../models/Submission.model");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
const analyzeSubmissionSchema = zod_1.z.object({ submissionId: zod_1.z.string().min(1) });
const matchSkillsSchema = zod_1.z.object({ userProfile: zod_1.z.object({ skills: zod_1.z.array(zod_1.z.string()) }), challenge: zod_1.z.object({ techStack: zod_1.z.array(zod_1.z.string()) }) });
const analyzeResumeSchema = zod_1.z.object({ resumeText: zod_1.z.string().min(10) });
const mentorChatSchema = zod_1.z.object({ message: zod_1.z.string().min(1), context: zod_1.z.string().optional() });
/**
 * Queue an AI submission analysis job.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when validation fails.
 */
async function analyzeSubmission(req, res) {
    try {
        const payload = analyzeSubmissionSchema.parse(req.body);
        res.status(202).json({ success: true, message: 'Analysis queued', data: { jobId: payload.submissionId } });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            throw (0, errorHandler_middleware_1.validationError)(error.message);
        }
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Failed to queue analysis', 500, 'AI_ANALYZE_FAILED');
    }
}
/**
 * Poll the AI analysis result by job id.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the submission cannot be found.
 */
async function getAnalysisResult(req, res) {
    const submission = await Submission_model_1.Submission.findById(req.params.jobId).lean();
    if (!submission) {
        throw new errorHandler_middleware_1.AppError('Job not found', 404, 'JOB_NOT_FOUND');
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
async function chatMentor(req, res) {
    const payload = mentorChatSchema.parse(req.body);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    const summary = await (0, ai_service_1.summarizeProposal)(payload.message);
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
async function matchSkillsController(req, res) {
    const payload = matchSkillsSchema.parse(req.body);
    const result = await (0, ai_service_1.matchSkills)(payload.userProfile, payload.challenge);
    res.status(200).json({ success: true, message: 'Skills matched', data: result });
}
/**
 * Analyze resume text.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when validation fails.
 */
async function analyzeResumeController(req, res) {
    const payload = analyzeResumeSchema.parse(req.body);
    const result = await (0, ai_service_1.analyzeResume)(payload.resumeText);
    res.status(200).json({ success: true, message: 'Resume analyzed', data: result });
}
/**
 * Return recommendations for the authenticated innovator.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the user is missing.
 */
async function recommendChallengesController(req, res) {
    if (!req.user) {
        throw new errorHandler_middleware_1.AppError('Authentication required', 401, 'UNAUTHORIZED');
    }
    const recommendations = await (0, ai_service_1.recommendChallenges)(req.user.userId);
    res.status(200).json({ success: true, message: 'Recommendations loaded', data: recommendations });
}

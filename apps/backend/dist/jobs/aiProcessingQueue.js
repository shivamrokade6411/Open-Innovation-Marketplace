"use strict";
/*
 * Purpose: Bull queue for AI submission processing jobs.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiProcessingQueue = void 0;
const bull_1 = __importDefault(require("bull"));
const Submission_model_1 = require("../models/Submission.model");
const notification_service_1 = require("../services/notification.service");
const ai_service_1 = require("../services/ai.service");
exports.aiProcessingQueue = new bull_1.default('ai-processing', process.env.REDIS_URL ?? 'redis://127.0.0.1:6379');
exports.aiProcessingQueue.process('analyze_submission', async (job) => {
    const submissionId = String(job.data.submissionId);
    const submission = await Submission_model_1.Submission.findById(submissionId).lean();
    if (!submission) {
        throw new Error('Submission not found');
    }
    const feedback = await (0, ai_service_1.generateFeedback)(submission);
    const plagiarism = await (0, ai_service_1.detectPlagiarism)(submissionId);
    await Submission_model_1.Submission.findByIdAndUpdate(submissionId, {
        aiFeedback: {
            summary: String(feedback.summary),
            codeQuality: Number(feedback.score ?? 0),
            innovation: Number(feedback.score ?? 0),
            plagiarismScore: plagiarism.score,
            strengths: feedback.strengths ?? [],
            weaknesses: feedback.weaknesses ?? [],
            suggestions: feedback.suggestions ?? []
        },
        aiScore: Number(feedback.score ?? 0),
        score: Number(feedback.score ?? 0)
    });
    await (0, notification_service_1.createNotification)(String(submission.userId), 'submission', { title: 'AI analysis completed', body: 'Your submission has been analyzed.' });
    return { submissionId, feedback, plagiarism };
});
exports.aiProcessingQueue.process('calculate_score', async (job) => ({ jobId: job.id, status: 'completed' }));
exports.aiProcessingQueue.process('detect_plagiarism', async (job) => ({ jobId: job.id, status: 'completed' }));

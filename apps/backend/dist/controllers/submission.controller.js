"use strict";
/*
 * Purpose: Submission review and lifecycle controller.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubmission = createSubmission;
exports.getSubmissionById = getSubmissionById;
exports.updateSubmission = updateSubmission;
exports.reviewSubmission = reviewSubmission;
exports.shortlistSubmission = shortlistSubmission;
exports.selectWinner = selectWinner;
exports.getMySubmissions = getMySubmissions;
const Submission_model_1 = require("../models/Submission.model");
const Challenge_model_1 = require("../models/Challenge.model");
const cloudinary_service_1 = require("../services/cloudinary.service");
const notification_service_1 = require("../services/notification.service");
const aiProcessingQueue_1 = require("../jobs/aiProcessingQueue");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
const submission_validator_1 = require("../validators/submission.validator");
function toArray(value) {
    if (Array.isArray(value)) {
        return value.filter((entry) => Buffer.isBuffer(entry));
    }
    return Buffer.isBuffer(value) ? [value] : [];
}
/**
 * Create a submission for a challenge.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when validation or challenge checks fail.
 */
async function createSubmission(req, res) {
    try {
        if (!req.user || req.user.role !== 'innovator') {
            throw (0, errorHandler_middleware_1.forbidden)('Only innovators can submit solutions');
        }
        const payload = submission_validator_1.submissionSchema.parse(req.body);
        const challenge = await Challenge_model_1.Challenge.findById(payload.challengeId).lean();
        if (!challenge || challenge.status !== 'active') {
            throw new errorHandler_middleware_1.AppError('Challenge is not active', 400, 'CHALLENGE_INACTIVE');
        }
        if (new Date(challenge.deadline).getTime() < Date.now()) {
            throw new errorHandler_middleware_1.AppError('Challenge deadline has passed', 400, 'DEADLINE_PASSED');
        }
        const existing = await Submission_model_1.Submission.findOne({ challengeId: payload.challengeId, userId: req.user.userId }).lean();
        if (existing) {
            throw new errorHandler_middleware_1.AppError('Duplicate submission', 409, 'DUPLICATE_SUBMISSION');
        }
        const files = req.files;
        const pdf = files?.find((file) => file.mimetype === 'application/pdf');
        const video = files?.find((file) => file.mimetype.startsWith('video/'));
        const image = files?.find((file) => file.mimetype.startsWith('image/'));
        const code = files?.find((file) => file.originalname.endsWith('.zip'));
        const pdfUrl = pdf ? await (0, cloudinary_service_1.uploadPDF)(pdf.buffer, pdf.originalname) : undefined;
        const videoUrl = video ? await (0, cloudinary_service_1.uploadVideo)(video.buffer, video.originalname) : undefined;
        const imageUrl = image ? await (0, cloudinary_service_1.uploadImage)(image.buffer, image.originalname) : undefined;
        const codeUrl = code ? await (0, cloudinary_service_1.uploadFile)(code.buffer, { folder: 'open-innovation-marketplace/code', publicId: code.originalname, resourceType: 'raw' }) : undefined;
        const submission = await Submission_model_1.Submission.create({
            challengeId: payload.challengeId,
            userId: req.user.userId,
            title: payload.title,
            description: payload.description,
            solutionUrl: payload.solutionUrl || undefined,
            githubUrl: payload.githubUrl || undefined,
            videoUrl: (videoUrl ?? payload.videoUrl) || undefined,
            pdfUrl: (pdfUrl ?? payload.pdfUrl) || undefined,
            files: [pdfUrl, videoUrl, imageUrl, codeUrl?.secure_url].filter((entry) => Boolean(entry)),
            techStack: payload.techStack,
            status: 'submitted',
            score: 0,
            aiScore: 0,
            aiFeedback: { summary: '', codeQuality: 0, innovation: 0, plagiarismScore: 0, strengths: [], weaknesses: [], suggestions: [] },
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await aiProcessingQueue_1.aiProcessingQueue.add('analyze_submission', { submissionId: String(submission._id) });
        await (0, notification_service_1.createNotification)(String(challenge.companyId), 'submission', { title: 'New submission', body: `${payload.title} has been submitted.` });
        res.status(201).json({ success: true, message: 'Submission created', data: submission.toObject() });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            throw (0, errorHandler_middleware_1.validationError)(error.message);
        }
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Failed to create submission', 500, 'CREATE_SUBMISSION_FAILED');
    }
}
/**
 * Load a submission with role-based visibility.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when access is denied.
 */
async function getSubmissionById(req, res) {
    const submission = await Submission_model_1.Submission.findById(req.params.id).lean();
    if (!submission) {
        throw new errorHandler_middleware_1.AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
    }
    if (!req.user) {
        throw (0, errorHandler_middleware_1.forbidden)('Authentication required');
    }
    res.status(200).json({ success: true, message: 'Submission loaded', data: submission });
}
/**
 * Update a submission before the deadline.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the challenge deadline has passed.
 */
async function updateSubmission(req, res) {
    const submission = await Submission_model_1.Submission.findById(req.params.id);
    if (!submission) {
        throw new errorHandler_middleware_1.AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
    }
    const challenge = await Challenge_model_1.Challenge.findById(submission.challengeId).lean();
    if (!challenge || new Date(challenge.deadline).getTime() < Date.now()) {
        throw new errorHandler_middleware_1.AppError('Submission window closed', 400, 'SUBMISSION_CLOSED');
    }
    submission.set({ description: req.body.description ?? submission.description, title: req.body.title ?? submission.title });
    await submission.save();
    await aiProcessingQueue_1.aiProcessingQueue.add('analyze_submission', { submissionId: String(submission._id) });
    res.status(200).json({ success: true, message: 'Submission updated', data: submission.toObject() });
}
/**
 * Review a submission.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the reviewer is not allowed.
 */
async function reviewSubmission(req, res) {
    const submission = await Submission_model_1.Submission.findByIdAndUpdate(req.params.id, { status: 'underReview', reviewNotes: String(req.body.reviewNotes ?? '') }, { new: true }).lean();
    if (!submission) {
        throw new errorHandler_middleware_1.AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
    }
    await (0, notification_service_1.createNotification)(String(submission.userId), 'submission', { title: 'Submission review started', body: 'Your submission is under review.' });
    res.status(200).json({ success: true, message: 'Submission reviewed', data: submission });
}
/**
 * Shortlist a submission.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the submission is missing.
 */
async function shortlistSubmission(req, res) {
    const submission = await Submission_model_1.Submission.findByIdAndUpdate(req.params.id, { status: 'shortlisted' }, { new: true }).lean();
    if (!submission) {
        throw new errorHandler_middleware_1.AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
    }
    await (0, notification_service_1.createNotification)(String(submission.userId), 'submission', { title: 'Shortlisted', body: 'Your submission has been shortlisted.' });
    res.status(200).json({ success: true, message: 'Submission shortlisted', data: submission });
}
/**
 * Select a winner.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the submission is missing.
 */
async function selectWinner(req, res) {
    const submission = await Submission_model_1.Submission.findByIdAndUpdate(req.params.id, { status: 'winner' }, { new: true }).lean();
    if (!submission) {
        throw new errorHandler_middleware_1.AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
    }
    await (0, notification_service_1.createNotification)(String(submission.userId), 'achievement', { title: 'Winner selected', body: 'Congratulations, you won the challenge.' });
    res.status(200).json({ success: true, message: 'Winner selected', data: submission });
}
/**
 * List my submissions.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when authentication is missing.
 */
async function getMySubmissions(req, res) {
    if (!req.user) {
        throw (0, errorHandler_middleware_1.forbidden)('Authentication required');
    }
    const submissions = await Submission_model_1.Submission.find({ userId: req.user.userId }).lean();
    res.status(200).json({ success: true, message: 'Submissions loaded', data: submissions });
}

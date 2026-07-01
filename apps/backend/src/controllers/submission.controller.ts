/*
 * Purpose: Submission review and lifecycle controller.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { Request, Response } from 'express';
import { Submission } from '../models/Submission.model';
import { Challenge } from '../models/Challenge.model';
import { Company } from '../models/Company.model';
import { User } from '../models/User.model';
import { uploadPDF, uploadVideo, uploadImage, uploadFile } from '../services/cloudinary.service';
import { createNotification } from '../services/notification.service';
import { aiProcessingQueue } from '../jobs/aiProcessingQueue';
import { AppError, forbidden, validationError } from '../middleware/errorHandler.middleware';
import { submissionSchema } from '../validators/submission.validator';

function toArray(value: unknown): Buffer[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is Buffer => Buffer.isBuffer(entry));
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
export async function createSubmission(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'innovator') {
      throw forbidden('Only innovators can submit solutions');
    }
    const payload = submissionSchema.parse(req.body);
    const challenge = await Challenge.findById(payload.challengeId).lean();
    if (!challenge || challenge.status !== 'active') {
      throw new AppError('Challenge is not active', 400, 'CHALLENGE_INACTIVE');
    }
    if (new Date(challenge.deadline).getTime() < Date.now()) {
      throw new AppError('Challenge deadline has passed', 400, 'DEADLINE_PASSED');
    }
    const existing = await Submission.findOne({ challengeId: payload.challengeId, userId: req.user.userId }).lean();
    if (existing) {
      throw new AppError('Duplicate submission', 409, 'DUPLICATE_SUBMISSION');
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const pdf = files?.find((file) => file.mimetype === 'application/pdf');
    const video = files?.find((file) => file.mimetype.startsWith('video/'));
    const image = files?.find((file) => file.mimetype.startsWith('image/'));
    const code = files?.find((file) => file.originalname.endsWith('.zip'));

    const pdfUrl = pdf ? await uploadPDF(pdf.buffer, pdf.originalname) : undefined;
    const videoUrl = video ? await uploadVideo(video.buffer, video.originalname) : undefined;
    const imageUrl = image ? await uploadImage(image.buffer, image.originalname) : undefined;
    const codeUrl = code ? await uploadFile(code.buffer, { folder: 'open-innovation-marketplace/code', publicId: code.originalname, resourceType: 'raw' }) : undefined;

    const submission = await Submission.create({
      challengeId: payload.challengeId,
      userId: req.user.userId,
      title: payload.title,
      description: payload.description,
      solutionUrl: payload.solutionUrl || undefined,
      githubUrl: payload.githubUrl || undefined,
      videoUrl: (videoUrl ?? payload.videoUrl) || undefined,
      pdfUrl: (pdfUrl ?? payload.pdfUrl) || undefined,
      files: [pdfUrl, videoUrl, imageUrl, codeUrl?.secure_url].filter((entry): entry is string => Boolean(entry)),
      techStack: payload.techStack,
      status: 'submitted',
      score: 0,
      aiScore: 0,
      aiFeedback: { summary: '', codeQuality: 0, innovation: 0, plagiarismScore: 0, strengths: [], weaknesses: [], suggestions: [] },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await aiProcessingQueue.add('analyze_submission', { submissionId: String(submission._id) });
    await createNotification(String(challenge.companyId), 'submission', { title: 'New submission', body: `${payload.title} has been submitted.` });
    res.status(201).json({ success: true, message: 'Submission created', data: submission.toObject() });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw validationError(error.message);
    }
    throw error instanceof Error ? error : new AppError('Failed to create submission', 500, 'CREATE_SUBMISSION_FAILED');
  }
}

/**
 * Load a submission with role-based visibility.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when access is denied.
 */
export async function getSubmissionById(req: Request, res: Response): Promise<void> {
  const submission = await Submission.findById(req.params.id).lean();
  if (!submission) {
    throw new AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
  }
  if (!req.user) {
    throw forbidden('Authentication required');
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
export async function updateSubmission(req: Request, res: Response): Promise<void> {
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    throw new AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
  }
  const challenge = await Challenge.findById(submission.challengeId).lean();
  if (!challenge || new Date(challenge.deadline).getTime() < Date.now()) {
    throw new AppError('Submission window closed', 400, 'SUBMISSION_CLOSED');
  }
  submission.set({ description: req.body.description ?? submission.description, title: req.body.title ?? submission.title });
  await submission.save();
  await aiProcessingQueue.add('analyze_submission', { submissionId: String(submission._id) });
  res.status(200).json({ success: true, message: 'Submission updated', data: submission.toObject() });
}

/**
 * Review a submission.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the reviewer is not allowed.
 */
export async function reviewSubmission(req: Request, res: Response): Promise<void> {
  const submission = await Submission.findByIdAndUpdate(req.params.id, { status: 'underReview', reviewNotes: String(req.body.reviewNotes ?? '') }, { new: true }).lean();
  if (!submission) {
    throw new AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
  }
  await createNotification(String(submission.userId), 'submission', { title: 'Submission review started', body: 'Your submission is under review.' });
  res.status(200).json({ success: true, message: 'Submission reviewed', data: submission });
}

/**
 * Shortlist a submission.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the submission is missing.
 */
export async function shortlistSubmission(req: Request, res: Response): Promise<void> {
  const submission = await Submission.findByIdAndUpdate(req.params.id, { status: 'shortlisted' }, { new: true }).lean();
  if (!submission) {
    throw new AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
  }
  await createNotification(String(submission.userId), 'submission', { title: 'Shortlisted', body: 'Your submission has been shortlisted.' });
  res.status(200).json({ success: true, message: 'Submission shortlisted', data: submission });
}

/**
 * Select a winner.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the submission is missing.
 */
export async function selectWinner(req: Request, res: Response): Promise<void> {
  const submission = await Submission.findByIdAndUpdate(req.params.id, { status: 'winner' }, { new: true }).lean();
  if (!submission) {
    throw new AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
  }
  await createNotification(String(submission.userId), 'achievement', { title: 'Winner selected', body: 'Congratulations, you won the challenge.' });
  res.status(200).json({ success: true, message: 'Winner selected', data: submission });
}

/**
 * List my submissions.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when authentication is missing.
 */
export async function getMySubmissions(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw forbidden('Authentication required');
  }
  const submissions = await Submission.find({ userId: req.user.userId }).lean();
  res.status(200).json({ success: true, message: 'Submissions loaded', data: submissions });
}

/**
 * Get submissions for a challenge (paginated, for tracker).
 * @param req The incoming request with challengeId, page, limit, and optional status filter.
 * @param res The outgoing response.
 * @returns Promise resolving to paginated submissions.
 */
export async function getSubmissionsByChallenge(req: Request, res: Response): Promise<void> {
  const challengeId = req.params.challengeId as string;
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
  const status = (req.query.status as string | undefined)?.split(',').filter(Boolean);

  const query: any = { challengeId };
  if (status && status.length > 0) {
    query.status = { $in: status };
  }

  const skip = (page - 1) * limit;
  const [submissions, total] = await Promise.all([
    Submission.find(query)
      .select('_id title status userId challengeId updatedAt score aiScore sandboxUrl githubUrl')
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 })
      .populate('userId', 'name email avatar'),
    Submission.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    message: 'Submissions loaded',
    data: {
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}

/**
 * Get live submission statistics for a challenge (for dashboard badges).
 * @param req The incoming request with challengeId.
 * @param res The outgoing response.
 * @returns Promise resolving to count breakdown by status.
 */
export async function getLiveSubmissionStats(req: Request, res: Response): Promise<void> {
  const challengeId = req.params.challengeId as string;

  const [
    totalSubmissions,
    draftCount,
    reviewCount,
    prototypeCount,
    acceptedCount,
    rejectedCount
  ] = await Promise.all([
    Submission.countDocuments({ challengeId }),
    Submission.countDocuments({ challengeId, status: 'submitted' }),
    Submission.countDocuments({ challengeId, status: 'underReview' }),
    Submission.countDocuments({ challengeId, status: 'shortlisted' }),
    Submission.countDocuments({ challengeId, status: 'winner' }),
    Submission.countDocuments({ challengeId, status: 'rejected' })
  ]);

  res.status(200).json({
    success: true,
    message: 'Live stats loaded',
    data: {
      challengeId,
      totalSubmissions,
      byStatus: {
        draft: draftCount,
        inReview: reviewCount,
        prototypeTest: prototypeCount,
        accepted: acceptedCount,
        rejected: rejectedCount
      },
      liveCount: draftCount + reviewCount,
      timestamp: new Date()
    }
  });
}


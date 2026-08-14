import type { Request, Response } from 'express';
import { Submission } from '../models/Submission.model';
import { SubmissionReview } from '../models/SubmissionReview.model';
import { SubmissionAuditLog } from '../models/SubmissionAuditLog.model';
import { SustainabilityEvaluation } from '../models/SustainabilityEvaluation.model';
import { Challenge } from '../models/Challenge.model';
import { createNotification } from '../services/notification.service';
import { AppError, forbidden, unauthorized } from '../middleware/errorHandler.middleware';
import { sustainabilityScore } from '../lib/ai/sustainabilityScore';

export async function submitReview(req: Request, res: Response): Promise<void> {
  if (!req.user || (req.user.role !== 'company' && req.user.role !== 'admin')) {
    throw forbidden('Only companies and administrators can review submissions');
  }

  const { submissionId } = req.params;
  const {
    scoreInnovation,
    scoreTechnical,
    scoreImpact,
    scoreFeasibility,
    scorePresentation,
    comments
  } = req.body;

  if (
    scoreInnovation === undefined ||
    scoreTechnical === undefined ||
    scoreImpact === undefined ||
    scoreFeasibility === undefined ||
    scorePresentation === undefined
  ) {
    throw new AppError('All rubric scores are required', 400, 'BAD_REQUEST');
  }

  // Calculate weighted score automatically
  const weightedScore =
    scoreInnovation * 0.25 +
    scoreTechnical * 0.25 +
    scoreImpact * 0.25 +
    scoreFeasibility * 0.15 +
    scorePresentation * 0.10;

  // Find and update or create review
  const review = await SubmissionReview.findOneAndUpdate(
    { submissionId, judgeId: req.user.userId },
    {
      scoreInnovation,
      scoreTechnical,
      scoreImpact,
      scoreFeasibility,
      scorePresentation,
      weightedScore,
      comments: comments || ''
    },
    { new: true, upsert: true }
  );

  // Update submission's overall score with the average of all reviews
  const reviews = await SubmissionReview.find({ submissionId }).lean();
  const avgScore = reviews.reduce((sum, r) => sum + r.weightedScore, 0) / reviews.length;

  await Submission.findByIdAndUpdate(submissionId, { score: Math.round(avgScore * 10) / 10 });

  res.status(200).json({ success: true, message: 'Submission evaluated successfully', data: review });
}

export async function updateSubmissionStatus(req: Request, res: Response): Promise<void> {
  if (!req.user || (req.user.role !== 'company' && req.user.role !== 'admin')) {
    throw forbidden('Only companies and administrators can modify submission status');
  }

  const { submissionId } = req.params;
  const { action, notes } = req.body; // 'submitted' | 'underReview' | 'shortlisted' | 'rejected' | 'finalist' | 'winner' | 'runner_up'

  const validActions = ['submitted', 'underReview', 'shortlisted', 'rejected', 'finalist', 'winner', 'runner_up'];
  if (!validActions.includes(action)) {
    throw new AppError('Invalid status update action', 400, 'BAD_REQUEST');
  }

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
  }

  // Map action to MongoDB status string
  // If 'finalist' or 'runner_up', we store it or map to appropriate enum status
  // Our schema enum: ['submitted', 'underReview', 'shortlisted', 'winner', 'rejected']
  // We can maps runner_up or finalist to shortlisted/winner or extend the database schema if needed.
  // Wait, let's keep status matching the schema enum, and write details in the audit trail.
  let mappedStatus = submission.status;
  if (action === 'submitted') mappedStatus = 'submitted';
  if (action === 'underReview') mappedStatus = 'underReview';
  if (action === 'shortlisted' || action === 'finalist' || action === 'runner_up') mappedStatus = 'shortlisted';
  if (action === 'winner') mappedStatus = 'winner';
  if (action === 'rejected') mappedStatus = 'rejected';

  submission.status = mappedStatus as any;
  await submission.save();

  // Create permanent audit log trail (never delete!)
  const auditLog = await SubmissionAuditLog.create({
    submissionId,
    userId: req.user.userId,
    action,
    notes: notes || `Status updated to ${action}.`
  });

  // Notify the innovator
  await createNotification(String(submission.userId), 'submission', {
    title: `Submission status: ${action}`,
    body: `Your project "${submission.title}" has been updated to ${action}.`
  });

  res.status(200).json({ success: true, message: 'Status updated successfully', data: { submission, auditLog } });
}

export async function getReviewsForSubmission(req: Request, res: Response): Promise<void> {
  const { submissionId } = req.params;
  const reviews = await SubmissionReview.find({ submissionId })
    .populate('judgeId', 'name email avatar')
    .lean();

  res.status(200).json({ success: true, message: 'Reviews loaded', data: reviews });
}

export async function getAuditTrailForSubmission(req: Request, res: Response): Promise<void> {
  const { submissionId } = req.params;
  const auditLogs = await SubmissionAuditLog.find({ submissionId })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, message: 'Audit trail loaded', data: auditLogs });
}

export async function evaluateSustainability(req: Request, res: Response): Promise<void> {
  const { submissionId } = req.params;
  const { projectDescription, technology, environmentalImpact, expectedUsers, resourceConsumption } = req.body;

  if (!projectDescription || !technology || !environmentalImpact || !expectedUsers || !resourceConsumption) {
    throw new AppError('All sustainability parameters are required', 400, 'BAD_REQUEST');
  }

  // Calculate AI Scorer
  const aiResult = await sustainabilityScore(
    projectDescription,
    technology,
    environmentalImpact,
    expectedUsers,
    resourceConsumption
  );

  const evaluation = await SustainabilityEvaluation.create({
    submissionId,
    projectDescription,
    technology,
    environmentalImpact,
    expectedUsers,
    resourceConsumption,
    ...aiResult
  });

  res.status(200).json({ success: true, data: evaluation });
}

export async function getSustainability(req: Request, res: Response): Promise<void> {
  const { submissionId } = req.params;
  const evaluation = await SustainabilityEvaluation.findOne({ submissionId }).sort({ createdAt: -1 }).lean();

  res.status(200).json({ success: true, data: evaluation });
}

/*
 * Purpose: Platform administrator actions controller.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import type { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Company } from '../models/Company.model';
import { Challenge } from '../models/Challenge.model';
import { Submission } from '../models/Submission.model';
import { Payment } from '../models/Payment.model';
import { AppError, forbidden } from '../middleware/errorHandler.middleware';

// Get list of users (Moderator View)
export async function getUsers(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'admin') {
    throw forbidden('Only admins can view user records');
  }

  const { search } = req.query;
  const filter: any = {};
  if (search) {
    filter.name = { $regex: String(search), $options: 'i' };
  }

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, data: users });
}

// Toggle/set company profile verification status
export async function verifyCompany(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'admin') {
    throw forbidden('Only admins can verify companies');
  }

  const { companyId } = req.params;
  const { status } = req.body; // 'pending' | 'verified' | 'rejected'

  if (!status || !['pending', 'verified', 'rejected'].includes(status)) {
    throw new AppError('Invalid verification status', 400, 'INVALID_VERIFICATION_STATUS');
  }

  const company = await Company.findById(companyId);
  if (!company) {
    throw new AppError('Company profile not found', 404, 'COMPANY_NOT_FOUND');
  }

  company.verificationStatus = status;
  await company.save();

  res.status(200).json({ success: true, data: company });
}

// Moderate challenge (active / draft / deleted)
export async function moderateChallenge(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'admin') {
    throw forbidden('Only admins can moderate challenges');
  }

  const { challengeId } = req.params;
  const { status } = req.body; // 'active' | 'draft' | 'completed'

  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND');
  }

  challenge.status = status;
  await challenge.save();

  res.status(200).json({ success: true, data: challenge });
}

// Moderate submission (flag / approve / block)
export async function moderateSubmission(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'admin') {
    throw forbidden('Only admins can moderate submissions');
  }

  const { submissionId } = req.params;
  const { status } = req.body;

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
  }

  submission.status = status;
  await submission.save();

  res.status(200).json({ success: true, data: submission });
}

// Get payment audit trails
export async function getPaymentsList(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'admin') {
    throw forbidden('Only admins can audit payment histories');
  }

  const payments = await Payment.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, data: payments });
}

// Retrieve general platform statistics
export async function getPlatformAnalytics(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'admin') {
    throw forbidden('Only admins can review platform metrics');
  }

  const [usersCount, companiesCount, challengesCount, submissionsCount, payments] = await Promise.all([
    User.countDocuments(),
    Company.countDocuments(),
    Challenge.countDocuments(),
    Submission.countDocuments(),
    Payment.find({ status: { $in: ['success', 'funded', 'released'] } }).lean()
  ]);

  const totalPrizeFunded = payments
    .filter((p) => p.type === 'prize')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeChallenges = await Challenge.countDocuments({ status: 'active' });

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        users: usersCount,
        companies: companiesCount,
        challenges: challengesCount,
        activeChallenges,
        submissions: submissionsCount,
        totalEarningsUSD: totalPrizeFunded
      }
    }
  });
}

/*
 * Purpose: Analytics aggregation controller.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Company } from '../models/Company.model';
import { Challenge } from '../models/Challenge.model';
import { Submission } from '../models/Submission.model';
import { Payment } from '../models/Payment.model';
import { AppError } from '../middleware/errorHandler.middleware';

/**
 * Get platform statistics for admins.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the query fails.
 */
export async function getPlatformStats(req: Request, res: Response): Promise<void> {
  const [users, companies, challenges, submissions, payments] = await Promise.all([
    User.countDocuments(),
    Company.countDocuments(),
    Challenge.countDocuments(),
    Submission.countDocuments(),
    Payment.find().lean()
  ]);
  const revenue = payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  res.status(200).json({ success: true, message: 'Platform stats loaded', data: { totalUsers: users, totalCompanies: companies, totalChallenges: challenges, totalSubmissions: submissions, revenue, growthRate: 0 } });
}

/**
 * Get company dashboard statistics.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when authentication is missing.
 */
export async function getCompanyDashboardStats(req: Request, res: Response): Promise<void> {
  const company = await Company.findOne({ userId: req.user?.userId }).lean();
  if (!company) {
    throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND');
  }
  const challengeCount = await Challenge.countDocuments({ companyId: company._id });
  const submissions = await Submission.countDocuments({});
  res.status(200).json({ success: true, message: 'Company stats loaded', data: { activeChallenges: challengeCount, totalSubmissions: submissions, shortlisted: 0, hiresMade: company.totalHires } });
}

/**
 * Get innovator stats.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when authentication is missing.
 */
export async function getInnovatorStats(req: Request, res: Response): Promise<void> {
  const submissions = await Submission.find({ userId: req.user?.userId }).lean();
  res.status(200).json({ success: true, message: 'Innovator stats loaded', data: { totalSubmissions: submissions.length, activeChallenges: 0, innovationScore: submissions.reduce((sum, submission) => sum + Number(submission.score ?? 0), 0), certificates: 0 } });
}

/**
 * Get leaderboard entries.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when query execution fails.
 */
export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const users = await User.find().sort({ innovationScore: -1 }).skip((page - 1) * limit).limit(limit).lean();
  const data = users.map((user, index) => ({
    rank: (page - 1) * limit + index + 1,
    userId: String(user._id),
    name: user.name,
    avatar: user.avatar,
    innovationScore: user.innovationScore,
    wins: 0,
    submissions: 0
  }));
  res.status(200).json({ success: true, message: 'Leaderboard loaded', data, meta: { page, limit, nextCursor: null } });
}

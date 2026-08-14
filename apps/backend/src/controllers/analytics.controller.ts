/*
 * Purpose: Analytics aggregation controller.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { Company } from '../models/Company.model';
import { Challenge } from '../models/Challenge.model';
import { Submission } from '../models/Submission.model';
import { Payment } from '../models/Payment.model';
import { InnovatorProfile } from '../models/InnovatorProfile.model';
import { Certificate } from '../models/Certificate.model';
import { AppError, unauthorized } from '../middleware/errorHandler.middleware';

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
  if (!req.user) {
    throw unauthorized('Authentication required');
  }
  const submissions = await Submission.find({ userId: req.user.userId }).lean();
  const challengeIds = submissions.map((s) => s.challengeId);
  
  const [activeChallenges, certificatesCount] = await Promise.all([
    Challenge.countDocuments({ _id: { $in: challengeIds }, status: 'active' }),
    Certificate.countDocuments({ userId: req.user.userId, isRevoked: false })
  ]);

  res.status(200).json({
    success: true,
    message: 'Innovator stats loaded',
    data: {
      totalSubmissions: submissions.length,
      activeChallenges,
      innovationScore: submissions.reduce((sum, submission) => sum + Number(submission.score ?? 0), 0),
      certificates: certificatesCount
    }
  });
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
  const category = String(req.query.category ?? 'contributors');

  if (category === 'teams') {
    const Team = mongoose.model('Team');
    const teams = await Team.find().skip((page - 1) * limit).limit(limit).lean();
    const data = teams.map((team: any, index: number) => ({
      rank: (page - 1) * limit + index + 1,
      id: String(team._id),
      name: team.name,
      avatar: team.logo || '',
      score: (team.members || []).length * 15,
      wins: 0,
      skills: []
    }));
    res.status(200).json({ success: true, message: 'Leaderboard loaded', data, meta: { page, limit, nextCursor: null } });
    return;
  }

  let usersQuery = User.find({ role: 'innovator' });
  let sortCriteria: any = { innovationScore: -1 };

  if (category === 'wins') {
    // Get profiles sorted by totalWins
    const profiles = await InnovatorProfile.find().sort({ totalWins: -1 }).skip((page - 1) * limit).limit(limit).lean();
    const userIds = profiles.map((p) => p.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(users.map((u) => [String(u._id), u]));
    const data = profiles.map((profile: any, index: number) => {
      const user = userMap.get(String(profile.userId));
      return {
        rank: (page - 1) * limit + index + 1,
        userId: String(profile.userId),
        name: user?.name || 'Anonymous',
        avatar: user?.avatar || '',
        innovationScore: user?.innovationScore || 0,
        wins: profile.totalWins || 0,
        submissions: profile.totalWins * 2,
        skills: profile.skills || []
      };
    });
    res.status(200).json({ success: true, message: 'Leaderboard loaded', data, meta: { page, limit, nextCursor: null } });
    return;
  }

  // Fallback / default categories sorting by innovationScore
  const users = await User.find({ role: 'innovator' }).sort(sortCriteria).skip((page - 1) * limit).limit(limit).lean();
  const userIds = users.map((u) => u._id);
  const profiles = await InnovatorProfile.find({ userId: { $in: userIds } }).lean();
  const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

  const data = users.map((user, index) => {
    const profile = profileMap.get(String(user._id));
    const wins = profile?.totalWins || 0;
    return {
      rank: (page - 1) * limit + index + 1,
      userId: String(user._id),
      name: user.name,
      avatar: user.avatar,
      innovationScore: user.innovationScore,
      wins,
      submissions: category === 'challenges' ? (user.innovationScore > 0 ? Math.ceil(user.innovationScore / 10) : 0) : wins * 2,
      skills: profile?.skills || []
    };
  });

  res.status(200).json({ success: true, message: 'Leaderboard loaded', data, meta: { page, limit, nextCursor: null } });
}

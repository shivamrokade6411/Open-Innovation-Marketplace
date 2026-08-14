/*
 * Purpose: Participant and Company Dashboard metrics controller.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import type { Request, Response } from 'express';
import { Challenge } from '../models/Challenge.model';
import { Submission } from '../models/Submission.model';
import { Company } from '../models/Company.model';
import { User } from '../models/User.model';
import { SavedChallenge } from '../models/SavedChallenge.model';
import { Notification } from '../models/Notification.model';
import { AppError, forbidden, unauthorized } from '../middleware/errorHandler.middleware';

export async function getParticipantDashboard(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const userId = req.user.userId;

  // 1. Get user details
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // 2. Active submissions
  const submissions = await Submission.find({ userId })
    .populate('challengeId', 'title deadline prizes')
    .lean();

  // 3. Saved challenges
  const saved = await SavedChallenge.find({ userId })
    .populate({
      path: 'challengeId',
      populate: { path: 'companyId', select: 'companyName logo' }
    })
    .lean();
  const savedChallenges = saved.map((s) => s.challengeId).filter(Boolean);

  // 4. Upcoming deadlines
  const activeChallengeIds = submissions.map((s) => (s.challengeId as any)?._id || s.challengeId).filter(Boolean);
  const savedChallengeIds = savedChallenges.map((c: any) => c._id).filter(Boolean);
  const deadlineChallengeIds = Array.from(new Set([...activeChallengeIds, ...savedChallengeIds]));

  const upcomingDeadlines = await Challenge.find({
    _id: { $in: deadlineChallengeIds },
    deadline: { $gt: new Date() }
  })
    .sort({ deadline: 1 })
    .limit(5)
    .lean();

  // 5. Recommended challenges (excluding already submitted)
  const submittedChallengeIds = submissions.map((s) => String((s.challengeId as any)?._id || s.challengeId));
  const recommendedChallenges = await Challenge.find({
    _id: { $nin: submittedChallengeIds },
    status: 'active',
    deadline: { $gt: new Date() }
  })
    .populate('companyId', 'companyName logo')
    .sort({ views: -1 })
    .limit(3)
    .lean();

  // 6. Recent notifications
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // 7. Calculate leaderboard rank
  const usersCountAhead = await User.countDocuments({
    role: 'innovator',
    innovationScore: { $gt: user.innovationScore || 0 }
  });
  const rank = usersCountAhead + 1;

  // 8. Achievements list (derived from score and wins)
  const achievements = [];
  if (user.innovationScore >= 100) {
    achievements.push({ id: 'century', title: 'Centurion', description: 'Reached 100+ innovation score', icon: 'award' });
  }
  const winsCount = submissions.filter((s) => s.status === 'winner').length;
  if (winsCount > 0) {
    achievements.push({ id: 'first_win', title: 'Champion', description: 'Won your first challenge!', icon: 'trophy' });
  }
  achievements.push({ id: 'first_step', title: 'Innovator', description: 'Submitted your first solution', icon: 'zap' });

  // Recent activity feed (union of notifications and updates)
  const recentActivity = notifications.map((n) => ({
    id: n._id,
    type: n.type,
    title: n.title,
    description: n.body,
    timestamp: n.createdAt
  }));

  res.status(200).json({
    success: true,
    message: 'Dashboard stats loaded',
    data: {
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        innovationScore: user.innovationScore || 0,
        rank
      },
      submissions,
      savedChallenges,
      upcomingDeadlines,
      recommendedChallenges,
      notifications,
      achievements,
      recentActivity
    }
  });
}

export async function getCompanyDashboard(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'company') {
    throw forbidden('Only companies can access the company dashboard');
  }

  const company = await Company.findOne({ userId: req.user.userId }).lean();
  if (!company) {
    throw new AppError('Company profile not found', 404, 'COMPANY_NOT_FOUND');
  }

  const challenges = await Challenge.find({ companyId: company._id }).sort({ createdAt: -1 }).lean();
  const challengeIds = challenges.map((c) => c._id);

  // Aggregating statistics
  const totalChallenges = challenges.length;
  const activeChallenges = challenges.filter((c) => c.status === 'active').length;

  const [totalSubmissions, shortlistedSubmissions, winners] = await Promise.all([
    Submission.countDocuments({ challengeId: { $in: challengeIds } }),
    Submission.countDocuments({ challengeId: { $in: challengeIds }, status: 'shortlisted' }),
    Submission.countDocuments({ challengeId: { $in: challengeIds }, status: 'winner' })
  ]);

  const totalViews = challenges.reduce((sum, c) => sum + (c.views || 0), 0);
  const conversionRate = totalViews > 0 ? parseFloat(((totalSubmissions / totalViews) * 100).toFixed(2)) : 0;

  // Build challenges table overview
  const recentChallenges = await Promise.all(
    challenges.map(async (c) => {
      const subCount = await Submission.countDocuments({ challengeId: c._id });
      return {
        _id: c._id,
        title: c.title,
        status: c.status,
        submissions: subCount,
        views: c.views || 0,
        deadline: c.deadline
      };
    })
  );

  res.status(200).json({
    success: true,
    message: 'Company stats loaded',
    data: {
      metrics: {
        totalChallenges,
        activeChallenges,
        totalSubmissions,
        shortlistedSubmissions,
        winners,
        totalViews,
        conversionRate
      },
      recentChallenges
    }
  });
}

export async function toggleSaveChallenge(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { challengeId } = req.params;
  const userId = req.user.userId;

  const existing = await SavedChallenge.findOne({ userId, challengeId });
  if (existing) {
    await SavedChallenge.findByIdAndDelete(existing._id);
    res.status(200).json({ success: true, message: 'Challenge removed from saved list', saved: false });
  } else {
    const saved = await SavedChallenge.create({ userId, challengeId });
    res.status(201).json({ success: true, message: 'Challenge saved to dashboard', saved: true, data: saved });
  }
}

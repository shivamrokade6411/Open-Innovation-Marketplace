/*
 * Purpose: Company profile and directory controller.
 * Author: Antigravity
 * Date: 2026-08-02
 */

import type { Request, Response } from 'express';
import { Company } from '../models/Company.model';
import { Challenge } from '../models/Challenge.model';
import { AppError } from '../middleware/errorHandler.middleware';
import mongoose from 'mongoose';

/**
 * Retrieve all registered/verified companies.
 */
export async function getCompanies(req: Request, res: Response): Promise<void> {
  const companies = await Company.find({ verificationStatus: 'verified' }).lean();
  res.status(200).json({ success: true, data: companies });
}

/**
 * Retrieve a specific company profile by slug, including its challenges, winners, and stats.
 */
export async function getCompanyBySlug(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  const company = await Company.findOne({ slug }).lean();

  if (!company) {
    throw new AppError('Company profile not found', 404, 'COMPANY_NOT_FOUND');
  }

  // Fetch all challenges posted by this company
  const challenges = await Challenge.find({ companyId: company._id }).lean();
  const challengeIds = challenges.map((c) => c._id);

  // Fetch winners for these challenges
  const winners = await mongoose.model('Submission').find({
    challengeId: { $in: challengeIds },
    status: 'winner'
  })
    .populate('userId', 'name email avatar')
    .populate('challengeId', 'title')
    .lean();

  // Aggregate stats
  const totalViews = challenges.reduce((sum, c) => sum + (c.views || 0), 0);
  const totalSubmissions = await mongoose.model('Submission').countDocuments({
    challengeId: { $in: challengeIds }
  });

  res.status(200).json({
    success: true,
    data: {
      company,
      challenges,
      winners,
      stats: {
        totalViews,
        totalSubmissions,
        activeCount: challenges.filter(c => c.status === 'active').length,
        completedCount: challenges.filter(c => c.status === 'completed').length
      }
    }
  });
}

/*
 * Purpose: Company profile and directory controller.
 * Author: Antigravity
 * Date: 2026-08-02
 */

import type { Request, Response } from 'express';
import { Company } from '../models/Company.model';
import { Challenge } from '../models/Challenge.model';
import { AppError } from '../middleware/errorHandler.middleware';

/**
 * Retrieve all registered/verified companies.
 */
export async function getCompanies(req: Request, res: Response): Promise<void> {
  const companies = await Company.find({ verificationStatus: 'verified' }).lean();
  res.status(200).json({ success: true, data: companies });
}

/**
 * Retrieve a specific company profile by slug, including its active challenges.
 */
export async function getCompanyBySlug(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  const company = await Company.findOne({ slug }).lean();

  if (!company) {
    throw new AppError('Company profile not found', 404, 'COMPANY_NOT_FOUND');
  }

  // Fetch active challenges posted by this company
  const challenges = await Challenge.find({ companyId: company._id, status: 'active' }).lean();

  res.status(200).json({
    success: true,
    data: {
      company,
      challenges
    }
  });
}

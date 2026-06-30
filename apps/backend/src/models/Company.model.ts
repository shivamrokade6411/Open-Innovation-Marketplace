/*
 * Purpose: Company profile persistence model.
 * Author: Copilot
 * Date: 2026-06-28
 */

import mongoose, { Schema } from 'mongoose';
import type { ICompany } from '@oim/shared';

const companySchema = new Schema<any>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true, trim: true },
    logo: { type: String },
    description: { type: String },
    industry: { type: String, index: true },
    website: { type: String },
    size: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
    location: { type: String },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
    totalChallenges: { type: Number, default: 0 },
    totalHires: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    subscriptionPlan: { type: String },
    subscriptionExpiry: { type: Date },
    socialLinks: { type: Map, of: String, default: {} }
  },
  { timestamps: true }
);

export const Company: mongoose.Model<ICompany> = mongoose.models.Company || mongoose.model<ICompany>('Company', companySchema);

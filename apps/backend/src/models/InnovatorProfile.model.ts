/*
 * Purpose: Innovator profile persistence model.
 * Author: Antigravity
 * Date: 2026-08-12
 */

import mongoose, { Schema } from 'mongoose';
import type { IInnovatorProfile } from '@oim/shared';

const innovatorProfileSchema = new Schema<any>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [], index: true },
    portfolioLinks: { type: [String], default: [] },
    totalWins: { type: Number, default: 0, min: 0, index: true }
  },
  { timestamps: true }
);

export const InnovatorProfile: mongoose.Model<IInnovatorProfile> = 
  mongoose.models.InnovatorProfile || mongoose.model<IInnovatorProfile>('InnovatorProfile', innovatorProfileSchema);

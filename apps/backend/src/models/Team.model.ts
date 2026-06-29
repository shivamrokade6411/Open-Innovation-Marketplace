/*
 * Purpose: Team persistence model for challenge collaboration.
 * Author: Copilot
 * Date: 2026-06-28
 */

import mongoose, { Schema } from 'mongoose';
import type { ITeam } from '@oim/shared';

const teamSchema = new Schema<any>(
  {
    name: { type: String, required: true, trim: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    leaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    inviteCode: { type: String, required: true, unique: true },
    maxMembers: { type: Number, default: 5 },
    status: { type: String, default: 'active' },
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission' }
  },
  { timestamps: true }
);

teamSchema.index({ challengeId: 1 });
teamSchema.index({ leaderId: 1 });

export const Team: mongoose.Model<ITeam> = mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema);

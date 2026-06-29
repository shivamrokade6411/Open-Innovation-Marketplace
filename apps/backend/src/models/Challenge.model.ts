/*
 * Purpose: Challenge persistence model.
 * Author: Copilot
 * Date: 2026-06-28
 */

import mongoose, { Schema } from 'mongoose';
import type { IChallenge } from '@oim/shared';

const challengeSchema = new Schema<IChallenge>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    problemStatement: { type: String, required: true },
    techStack: { type: [String], default: [] },
    category: { type: String, required: true, index: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true, index: true },
    prizes: {
      first: { type: Number, default: 0 },
      second: { type: Number, default: 0 },
      third: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    deadline: { type: Date, required: true },
    startDate: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'active', 'review', 'completed', 'cancelled'], default: 'draft', index: true },
    tags: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    maxParticipants: { type: Number, default: 0 },
    currentParticipants: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isRemote: { type: Boolean, default: true },
    attachments: { type: [String], default: [] },
    aiSummary: { type: String }
  },
  { timestamps: true }
);

challengeSchema.index({ title: 'text', description: 'text', tags: 'text' });
challengeSchema.index({ status: 1, deadline: 1 });
challengeSchema.index({ category: 1, difficulty: 1 });

export const Challenge = mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', challengeSchema);

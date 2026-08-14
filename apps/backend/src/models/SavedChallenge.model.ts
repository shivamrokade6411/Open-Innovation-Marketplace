/*
 * Purpose: Saved/Bookmarked challenges persistence model.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import mongoose, { Schema } from 'mongoose';

const savedChallengeSchema = new Schema<any>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true }
  },
  { timestamps: true }
);

savedChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export const SavedChallenge: mongoose.Model<any> = mongoose.models.SavedChallenge || mongoose.model<any>('SavedChallenge', savedChallengeSchema);

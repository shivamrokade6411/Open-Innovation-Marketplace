/*
 * Purpose: Rubrics-based submission review and scoring persistence model.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import mongoose, { Schema } from 'mongoose';

const submissionReviewSchema = new Schema<any>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
    judgeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scoreInnovation: { type: Number, required: true, min: 0, max: 100 },
    scoreTechnical: { type: Number, required: true, min: 0, max: 100 },
    scoreImpact: { type: Number, required: true, min: 0, max: 100 },
    scoreFeasibility: { type: Number, required: true, min: 0, max: 100 },
    scorePresentation: { type: Number, required: true, min: 0, max: 100 },
    weightedScore: { type: Number, required: true, default: 0 },
    comments: { type: String, default: '' }
  },
  { timestamps: true }
);

submissionReviewSchema.index({ submissionId: 1, judgeId: 1 }, { unique: true });

export const SubmissionReview: mongoose.Model<any> = mongoose.models.SubmissionReview || mongoose.model<any>('SubmissionReview', submissionReviewSchema);

/*
 * Purpose: Expert Mentor Feedback persistence model.
 * Author: Copilot
 * Date: 2026-07-01
 */

import mongoose, { Schema } from 'mongoose';

const feedbackSchema = new Schema<any>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    nextSteps: { type: [String], default: [] },
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String, required: true },
    isThreaded: { type: Boolean, default: false },
    parentFeedbackId: { type: Schema.Types.ObjectId, ref: 'Feedback', default: null },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Feedback' }],
    status: { type: String, enum: ['draft', 'submitted', 'archived'], default: 'submitted' },
    visibility: { type: String, enum: ['private', 'mentor-only', 'public'], default: 'private' }
  },
  { timestamps: true }
);

feedbackSchema.index({ submissionId: 1, createdAt: -1 });
feedbackSchema.index({ mentorId: 1 });
feedbackSchema.index({ submissionId: 1, parentFeedbackId: 1 });

export const Feedback: mongoose.Model<any> = mongoose.models.Feedback || mongoose.model<any>('Feedback', feedbackSchema);

/*
 * Purpose: Permanent audit log for submission status changes.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import mongoose, { Schema } from 'mongoose';

const submissionAuditLogSchema = new Schema<any>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['submitted', 'underReview', 'shortlisted', 'rejected', 'finalist', 'winner', 'runner_up'], required: true },
    notes: { type: String, default: '' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

submissionAuditLogSchema.index({ submissionId: 1, createdAt: -1 });

export const SubmissionAuditLog: mongoose.Model<any> = mongoose.models.SubmissionAuditLog || mongoose.model<any>('SubmissionAuditLog', submissionAuditLogSchema);

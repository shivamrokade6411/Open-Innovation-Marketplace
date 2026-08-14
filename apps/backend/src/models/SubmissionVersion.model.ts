/*
 * Purpose: Submission version control history model.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import mongoose, { Schema } from 'mongoose';

const submissionVersionSchema = new Schema<any>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
    version: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    solutionUrl: { type: String },
    githubUrl: { type: String },
    videoUrl: { type: String },
    pdfUrl: { type: String },
    files: { type: [String], default: [] },
    changeSummary: { type: String, default: '' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

submissionVersionSchema.index({ submissionId: 1, version: 1 }, { unique: true });

export const SubmissionVersion: mongoose.Model<any> = mongoose.models.SubmissionVersion || mongoose.model<any>('SubmissionVersion', submissionVersionSchema);

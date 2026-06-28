/*
 * Purpose: Submission persistence model.
 * Author: Copilot
 * Date: 2026-06-28
 */

import mongoose, { Schema } from 'mongoose';
import type { ISubmission } from '@oim/shared';

const submissionSchema = new Schema<ISubmission>(
  {
    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    solutionUrl: { type: String },
    githubUrl: { type: String },
    videoUrl: { type: String },
    pdfUrl: { type: String },
    files: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    status: { type: String, enum: ['submitted', 'underReview', 'shortlisted', 'winner', 'rejected'], default: 'submitted', index: true },
    score: { type: Number, default: 0, index: true },
    aiScore: { type: Number, default: 0 },
    aiFeedback: {
      summary: { type: String, default: '' },
      codeQuality: { type: Number, default: 0 },
      innovation: { type: Number, default: 0 },
      plagiarismScore: { type: Number, default: 0 },
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      suggestions: { type: [String], default: [] }
    },
    reviewNotes: { type: String },
    rank: { type: Number },
    certificateId: { type: Schema.Types.ObjectId, ref: 'Certificate' }
  },
  { timestamps: true }
);

submissionSchema.index({ challengeId: 1, userId: 1 }, { unique: true });
submissionSchema.index({ status: 1 });
submissionSchema.index({ score: -1 });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);

/*
 * Purpose: AI Grading Result persistence model.
 * Author: Copilot
 * Date: 2026-07-01
 */

import mongoose, { Schema } from 'mongoose';

const gradingResultSchema = new Schema<any>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true, unique: true },
    codeQualityScore: { type: Number, min: 0, max: 100, required: true },
    uniquenessScore: { type: Number, min: 0, max: 100, required: true },
    securityScore: { type: Number, min: 0, max: 100, required: true },
    innovationScore: { type: Number, min: 0, max: 100, default: 0 },
    overallScore: { type: Number, min: 0, max: 100, required: true },
    summary: { type: String, required: true },
    strengths: { type: [String], default: [] },
    vulnerabilities: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    plagiarismScore: { type: Number, default: 0 },
    plagiarismMatches: {
      type: [
        {
          source: { type: String, required: true },
          similarity: { type: Number, min: 0, max: 100, required: true },
          matchType: { type: String, default: 'external' } // 'internal' or 'external'
        }
      ],
      default: []
    },
    model: { type: String, default: 'gpt-4o-mini' },
    processedAt: { type: Date, default: Date.now },
    processingTime: { type: Number } // in milliseconds
  },
  { timestamps: true }
);

gradingResultSchema.index({ overallScore: -1 });
gradingResultSchema.index({ createdAt: -1 });

export const GradingResult: mongoose.Model<any> = mongoose.models.GradingResult || mongoose.model<any>('GradingResult', gradingResultSchema);

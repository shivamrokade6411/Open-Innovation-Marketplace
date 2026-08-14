/*
 * Purpose: AI Sustainability Evaluation rating persistence model.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import mongoose, { Schema } from 'mongoose';

const sustainabilityEvaluationSchema = new Schema<any>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
    projectDescription: { type: String, required: true },
    technology: { type: String, required: true },
    environmentalImpact: { type: String, required: true },
    expectedUsers: { type: String, required: true },
    resourceConsumption: { type: String, required: true },
    sustainabilityScore: { type: Number, required: true, min: 0, max: 100 },
    estimatedImpact: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendations: { type: [String], default: [] }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SustainabilityEvaluation: mongoose.Model<any> = mongoose.models.SustainabilityEvaluation || mongoose.model<any>('SustainabilityEvaluation', sustainabilityEvaluationSchema);

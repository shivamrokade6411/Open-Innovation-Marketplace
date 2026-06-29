/*
 * Purpose: Certificate persistence model.
 * Author: Copilot
 * Date: 2026-06-28
 */

import mongoose, { Schema } from 'mongoose';
import type { ICertificate } from '@oim/shared';

const certificateSchema = new Schema<ICertificate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true },
    certificateNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['winner', 'participant', 'finalist'], required: true },
    issueDate: { type: Date, default: Date.now },
    qrCode: { type: String, required: true },
    verificationUrl: { type: String, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    isRevoked: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

certificateSchema.index({ certificateNumber: 1 }, { unique: true });
certificateSchema.index({ userId: 1 });

export const Certificate = mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', certificateSchema);

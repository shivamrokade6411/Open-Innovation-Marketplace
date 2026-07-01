/*
 * Purpose: Certificate persistence model.
 * Author: Copilot
 * Date: 2026-06-28
 */

import mongoose, { Schema } from 'mongoose';
import type { ICertificate } from '@oim/shared';

const certificateSchema = new Schema<any>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true },
    certificateNumber: { type: String, required: true, unique: true },
    hash: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['winner', 'participant', 'finalist'], required: true },
    issueDate: { type: Date, default: Date.now },
    qrCode: { type: String, required: true },
    verificationUrl: { type: String, required: true },
    rewardAmount: { type: Number, default: 0 },
    rewardCurrency: { type: String, default: 'USD' },
    payoutStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    txRef: { type: String, default: null },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    isRevoked: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Certificate: mongoose.Model<ICertificate> = mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', certificateSchema);

/*
 * Purpose: Hiring and contract pipeline persistence model.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import mongoose, { Schema } from 'mongoose';

const hiringPipelineSchema = new Schema<any>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    participantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['job', 'internship', 'freelance', 'consulting'], required: true, index: true },
    status: { type: String, enum: ['winner', 'opportunity_created', 'invited', 'applied', 'interview', 'offer', 'accepted', 'contracted'], default: 'opportunity_created', index: true },
    salary: { type: Number, default: 0 },
    description: { type: String, default: '' },
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        sentAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const HiringPipeline: mongoose.Model<any> = mongoose.models.HiringPipeline || mongoose.model<any>('HiringPipeline', hiringPipelineSchema);

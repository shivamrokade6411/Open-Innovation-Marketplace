/*
 * Purpose: Payment persistence model.
 * Author: Copilot
 * Date: 2026-06-28
 */

import mongoose, { Schema } from 'mongoose';
import type { IPayment } from '@oim/shared';

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['subscription', 'prize', 'withdrawal'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
    gateway: { type: String, enum: ['razorpay', 'stripe'], required: true },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    gatewaySignature: { type: String },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

paymentSchema.index({ userId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

/*
 * Purpose: Notification persistence model.
 * Author: Copilot
 * Date: 2026-06-28
 */

import mongoose, { Schema } from 'mongoose';
import type { INotification } from '@oim/shared';

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['challenge', 'submission', 'message', 'payment', 'system', 'achievement'], required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Map, of: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

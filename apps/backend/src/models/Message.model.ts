/*
 * Purpose: Message and conversation persistence model.
 * Author: Copilot
 * Date: 2026-06-28
 */

import mongoose, { Schema } from 'mongoose';
import type { IConversation, IMessage } from '@oim/shared';

const conversationSchema = new Schema<any>(
  {
    participants: { type: [Schema.Types.ObjectId], ref: 'User', required: true, index: true },
    lastMessage: { type: String },
    lastActivity: { type: Date, default: Date.now },
    unreadCounts: { type: Map, of: Number, default: {} }
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastActivity: -1 });

const messageSchema = new Schema<any>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'file', 'image', 'system'], default: 'text' },
    fileUrl: { type: String },
    fileName: { type: String },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });

export const Conversation: mongoose.Model<IConversation> = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', conversationSchema);
export const Message: mongoose.Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

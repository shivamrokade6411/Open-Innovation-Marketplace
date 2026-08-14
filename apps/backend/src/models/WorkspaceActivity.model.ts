/*
 * Purpose: Workspace activity logging persistence model.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import mongoose, { Schema } from 'mongoose';

const workspaceActivitySchema = new Schema<any>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    description: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

workspaceActivitySchema.index({ submissionId: 1, createdAt: -1 });

export const WorkspaceActivity: mongoose.Model<any> = mongoose.models.WorkspaceActivity || mongoose.model<any>('WorkspaceActivity', workspaceActivitySchema);

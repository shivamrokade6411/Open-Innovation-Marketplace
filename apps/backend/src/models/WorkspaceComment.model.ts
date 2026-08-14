/*
 * Purpose: Workspace comments persistence model.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import mongoose, { Schema } from 'mongoose';

const workspaceCommentSchema = new Schema<any>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true },
    attachments: { type: [String], default: [] },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'WorkspaceComment', default: null }
  },
  { timestamps: true }
);

workspaceCommentSchema.index({ submissionId: 1, createdAt: -1 });

export const WorkspaceComment: mongoose.Model<any> = mongoose.models.WorkspaceComment || mongoose.model<any>('WorkspaceComment', workspaceCommentSchema);

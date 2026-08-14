/*
 * Purpose: Workspace task persistence model.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import mongoose, { Schema } from 'mongoose';

const workspaceTaskSchema = new Schema<any>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo', index: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

export const WorkspaceTask: mongoose.Model<any> = mongoose.models.WorkspaceTask || mongoose.model<any>('WorkspaceTask', workspaceTaskSchema);

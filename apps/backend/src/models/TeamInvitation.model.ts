/*
 * Purpose: Team System invitations persistence model.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import mongoose, { Schema } from 'mongoose';

const teamInvitationSchema = new Schema<any>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    inviterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    inviteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending', index: true }
  },
  { timestamps: true }
);

teamInvitationSchema.index({ teamId: 1, inviteeId: 1 }, { unique: true });

export const TeamInvitation: mongoose.Model<any> = mongoose.models.TeamInvitation || mongoose.model<any>('TeamInvitation', teamInvitationSchema);

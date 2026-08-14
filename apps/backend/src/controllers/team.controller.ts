/*
 * Purpose: Team System operations controller.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import type { Request, Response } from 'express';
import { Team } from '../models/Team.model';
import { Challenge } from '../models/Challenge.model';
import { User } from '../models/User.model';
import { TeamInvitation } from '../models/TeamInvitation.model';
import { AppError, forbidden, unauthorized } from '../middleware/errorHandler.middleware';
import crypto from 'crypto';

export async function createTeam(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'innovator') {
    throw forbidden('Only innovators can create teams');
  }

  const { name, challengeId } = req.body;
  if (!name || !challengeId) {
    throw new AppError('Team name and challengeId are required', 400, 'BAD_REQUEST');
  }

  const challenge = await Challenge.findById(challengeId).lean();
  if (!challenge) {
    throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND');
  }

  // Check if user already on a team for this challenge
  const existingTeam = await Team.findOne({
    challengeId,
    'members.userId': req.user.userId,
    status: { $ne: 'disbanded' }
  }).lean();

  if (existingTeam) {
    throw new AppError('You are already part of a team for this challenge', 400, 'ALREADY_IN_TEAM');
  }

  const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  const team = await Team.create({
    name,
    challengeId,
    leaderId: req.user.userId,
    maxMembers: challenge.maxTeamSize || 5,
    members: [
      {
        userId: req.user.userId,
        role: 'leader',
        joinedAt: new Date()
      }
    ],
    inviteCode,
    status: 'active',
    logo: ''
  });

  res.status(201).json({ success: true, message: 'Team created successfully', data: team });
}

export async function inviteUser(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { teamId } = req.params;
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400, 'BAD_REQUEST');
  }

  const team = await Team.findById(teamId);
  if (!team || team.status === 'disbanded') {
    throw new AppError('Team not found or inactive', 404, 'TEAM_NOT_FOUND');
  }

  if (String(team.leaderId) !== req.user.userId) {
    throw forbidden('Only the team leader can invite users');
  }

  const invitee = await User.findOne({ email }).lean();
  if (!invitee) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (invitee.role !== 'innovator') {
    throw new AppError('Only innovators can be invited to teams', 400, 'INVALID_ROLE');
  }

  // Check if already member
  const isMember = team.members.some((m: any) => String(m.userId) === String(invitee._id));
  if (isMember) {
    throw new AppError('User is already a member of this team', 400, 'ALREADY_MEMBER');
  }

  // Respect challenge maxTeamSize / team maxMembers
  if (team.members.length >= team.maxMembers) {
    throw new AppError('Team has reached maximum allowed members count', 400, 'TEAM_FULL');
  }

  // Check if invite already exists
  const existingInvite = await TeamInvitation.findOne({
    teamId: team._id,
    inviteeId: invitee._id,
    status: 'pending'
  }).lean();

  if (existingInvite) {
    throw new AppError('Invitation already sent to this user', 400, 'DUPLICATE_INVITATION');
  }

  const invitation = await TeamInvitation.create({
    teamId: team._id,
    inviterId: req.user.userId,
    inviteeId: invitee._id,
    status: 'pending'
  });

  res.status(201).json({ success: true, message: 'Invitation sent', data: invitation });
}

export async function respondInvitation(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { inviteId } = req.params;
  const { action } = req.body; // 'accepted' | 'declined'

  if (action !== 'accepted' && action !== 'declined') {
    throw new AppError('Action must be accepted or declined', 400, 'BAD_REQUEST');
  }

  const invite = await TeamInvitation.findById(inviteId);
  if (!invite) {
    throw new AppError('Invitation not found', 404, 'INVITATION_NOT_FOUND');
  }

  if (String(invite.inviteeId) !== req.user.userId) {
    throw forbidden('This invitation is not for you');
  }

  if (invite.status !== 'pending') {
    throw new AppError('Invitation has already been responded to', 400, 'INVITATION_CLOSED');
  }

  if (action === 'declined') {
    invite.status = 'declined';
    await invite.save();
    res.status(200).json({ success: true, message: 'Invitation declined', data: invite });
    return;
  }

  const team = await Team.findById(invite.teamId);
  if (!team || team.status === 'disbanded') {
    invite.status = 'declined';
    await invite.save();
    throw new AppError('Team no longer exists or is inactive', 400, 'TEAM_INACTIVE');
  }

  // Enforce maxTeamSize check
  if (team.members.length >= team.maxMembers) {
    throw new AppError('Team is full', 400, 'TEAM_FULL');
  }

  // Check if invitee is already in any active team for this challenge
  const alreadyInTeam = await Team.findOne({
    challengeId: team.challengeId,
    'members.userId': req.user.userId,
    status: { $ne: 'disbanded' }
  }).lean();

  if (alreadyInTeam) {
    throw new AppError('You are already part of a team for this challenge', 400, 'ALREADY_IN_TEAM');
  }

  // Accept invite and add member
  invite.status = 'accepted';
  await invite.save();

  team.members.push({
    userId: req.user.userId,
    role: 'member',
    joinedAt: new Date()
  });

  await team.save();

  res.status(200).json({ success: true, message: 'Invitation accepted', data: team });
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { teamId, userId } = req.params;

  const team = await Team.findById(teamId);
  if (!team || team.status === 'disbanded') {
    throw new AppError('Team not found', 404, 'TEAM_NOT_FOUND');
  }

  if (String(team.leaderId) !== req.user.userId) {
    throw forbidden('Only the team leader can remove members');
  }

  if (String(team.leaderId) === userId) {
    throw new AppError('You cannot remove the leader of the team', 400, 'INVALID_OPERATION');
  }

  const memberIndex = team.members.findIndex((m: any) => String(m.userId) === userId);
  if (memberIndex === -1) {
    throw new AppError('User is not a member of this team', 404, 'MEMBER_NOT_FOUND');
  }

  team.members.splice(memberIndex, 1);
  await team.save();

  res.status(200).json({ success: true, message: 'Member removed successfully', data: team });
}

export async function leaveTeam(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { teamId } = req.params;

  const team = await Team.findById(teamId);
  if (!team || team.status === 'disbanded') {
    throw new AppError('Team not found', 404, 'TEAM_NOT_FOUND');
  }

  const userId = req.user.userId;
  const memberIndex = team.members.findIndex((m: any) => String(m.userId) === userId);
  if (memberIndex === -1) {
    throw new AppError('You are not a member of this team', 400, 'NOT_MEMBER');
  }

  if (String(team.leaderId) === userId) {
    // If leader is leaving
    if (team.members.length <= 1) {
      // Disband team if leader is the only member
      team.status = 'disbanded';
      team.members = [];
    } else {
      // Promote the next member to leader
      team.members.splice(memberIndex, 1);
      const nextMember = team.members[0];
      team.leaderId = nextMember.userId;
      nextMember.role = 'leader';
    }
  } else {
    // Regular member leaving
    team.members.splice(memberIndex, 1);
  }

  await team.save();

  res.status(200).json({ success: true, message: 'Left team successfully', data: team });
}

export async function updateTeam(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { teamId } = req.params;
  const { name, logo } = req.body;

  const team = await Team.findById(teamId);
  if (!team || team.status === 'disbanded') {
    throw new AppError('Team not found', 404, 'TEAM_NOT_FOUND');
  }

  if (String(team.leaderId) !== req.user.userId) {
    throw forbidden('Only the team leader can modify team settings');
  }

  if (name) team.name = name;
  if (logo !== undefined) team.logo = logo;

  await team.save();

  res.status(200).json({ success: true, message: 'Team settings updated', data: team });
}

export async function getTeamDetails(req: Request, res: Response): Promise<void> {
  const { teamId } = req.params;

  const team = await Team.findById(teamId)
    .populate('members.userId', 'name email avatar')
    .lean();

  if (!team || team.status === 'disbanded') {
    throw new AppError('Team not found', 404, 'TEAM_NOT_FOUND');
  }

  res.status(200).json({ success: true, message: 'Team loaded', data: team });
}

export async function getMyInvitations(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const invites = await TeamInvitation.find({
    inviteeId: req.user.userId,
    status: 'pending'
  })
    .populate({
      path: 'teamId',
      select: 'name logo challengeId',
      populate: { path: 'challengeId', select: 'title' }
    })
    .populate('inviterId', 'name avatar')
    .lean();

  res.status(200).json({ success: true, message: 'Invitations loaded', data: invites });
}

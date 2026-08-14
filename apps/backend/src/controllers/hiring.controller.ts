/*
 * Purpose: Hiring and contract pipeline controller.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import type { Request, Response } from 'express';
import { HiringPipeline } from '../models/HiringPipeline.model';
import { Submission } from '../models/Submission.model';
import { Challenge } from '../models/Challenge.model';
import { AppError, unauthorized, forbidden } from '../middleware/errorHandler.middleware';
import mongoose from 'mongoose';

// Create a new hiring opportunity
export async function createOpportunity(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'company') {
    throw forbidden('Only companies can initiate a hiring pipeline');
  }

  const { submissionId, title, type, salary, description } = req.body;

  if (!submissionId || !title || !type) {
    throw new AppError('Missing required fields: submissionId, title, type', 400, 'MISSING_FIELDS');
  }

  const submission = await Submission.findById(submissionId).populate('challengeId');
  if (!submission) {
    throw new AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
  }

  const challenge = submission.challengeId as any;
  if (!challenge) {
    throw new AppError('Challenge details not found for submission', 404, 'CHALLENGE_NOT_FOUND');
  }

  // Verify company owns the challenge
  const company = await mongoose.model('Company').findOne({ userId: req.user.userId });
  if (!company || String(challenge.companyId) !== String(company._id)) {
    throw forbidden('You are not authorized to create opportunities for this challenge');
  }

  const pipeline = await HiringPipeline.create({
    submissionId,
    companyId: company._id,
    participantId: submission.userId,
    title,
    type,
    salary: salary || 0,
    description: description || '',
    status: 'opportunity_created',
    messages: []
  });

  res.status(201).json({ success: true, data: pipeline });
}

// Update pipeline stage / status
export async function updatePipelineStatus(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { pipelineId } = req.params;
  const { status } = req.body;

  const pipeline = await HiringPipeline.findById(pipelineId);
  if (!pipeline) {
    throw new AppError('Pipeline opportunity not found', 404, 'PIPELINE_NOT_FOUND');
  }

  // Verify ownership (participant or company)
  const isParticipant = String(pipeline.participantId) === req.user.userId;
  const company = await mongoose.model('Company').findOne({ userId: req.user.userId });
  const isCompany = company && String(pipeline.companyId) === String(company._id);

  if (!isParticipant && !isCompany) {
    throw forbidden('You do not have permission to modify this pipeline');
  }

  pipeline.status = status;
  await pipeline.save();

  res.status(200).json({ success: true, data: pipeline });
}

// Send chat message in interview discussion
export async function sendPipelineMessage(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { pipelineId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new AppError('Content is required', 400, 'MISSING_CONTENT');
  }

  const pipeline = await HiringPipeline.findById(pipelineId);
  if (!pipeline) {
    throw new AppError('Pipeline not found', 404, 'PIPELINE_NOT_FOUND');
  }

  const isParticipant = String(pipeline.participantId) === req.user.userId;
  const company = await mongoose.model('Company').findOne({ userId: req.user.userId });
  const isCompany = company && String(pipeline.companyId) === String(company._id);

  if (!isParticipant && !isCompany) {
    throw forbidden('You do not have access to this pipeline chat');
  }

  pipeline.messages.push({
    senderId: req.user.userId,
    content,
    sentAt: new Date()
  });

  await pipeline.save();

  res.status(200).json({ success: true, data: pipeline });
}

// Fetch single pipeline details
export async function getPipelineDetails(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { pipelineId } = req.params;
  const pipeline = await HiringPipeline.findById(pipelineId)
    .populate('participantId', 'name email avatar')
    .populate('companyId', 'companyName logo');

  if (!pipeline) {
    throw new AppError('Pipeline details not found', 404, 'PIPELINE_NOT_FOUND');
  }

  res.status(200).json({ success: true, data: pipeline });
}

// Fetch all pipeline opportunities for current user
export async function getMyPipelines(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  let filter = {};
  if (req.user.role === 'company') {
    const company = await mongoose.model('Company').findOne({ userId: req.user.userId });
    if (!company) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    filter = { companyId: company._id };
  } else {
    filter = { participantId: req.user.userId };
  }

  const pipelines = await HiringPipeline.find(filter)
    .populate('participantId', 'name email avatar')
    .populate('companyId', 'companyName logo')
    .sort({ updatedAt: -1 });

  res.status(200).json({ success: true, data: pipelines });
}

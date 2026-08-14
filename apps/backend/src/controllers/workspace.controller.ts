/*
 * Purpose: Workspace and submission collaboration controller.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import type { Request, Response } from 'express';
import { Submission } from '../models/Submission.model';
import { Team } from '../models/Team.model';
import { User } from '../models/User.model';
import { WorkspaceTask } from '../models/WorkspaceTask.model';
import { WorkspaceComment } from '../models/WorkspaceComment.model';
import { SubmissionVersion } from '../models/SubmissionVersion.model';
import { WorkspaceActivity } from '../models/WorkspaceActivity.model';
import { AppError, forbidden, unauthorized } from '../middleware/errorHandler.middleware';
import { uploadPDF, uploadVideo, uploadImage, uploadFile } from '../services/cloudinary.service';

export async function getWorkspaceDetails(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { submissionId } = req.params;
  const submission = await Submission.findById(submissionId).lean();
  if (!submission) {
    throw new AppError('Workspace not found', 404, 'SUBMISSION_NOT_FOUND');
  }

  // Find team associated with this submission
  let team = await Team.findOne({ submissionId })
    .populate('members.userId', 'name email avatar')
    .lean();

  if (!team) {
    // Check if the user is in a team for this challenge
    team = await Team.findOne({
      challengeId: submission.challengeId,
      'members.userId': req.user.userId,
      status: { $ne: 'disbanded' }
    })
      .populate('members.userId', 'name email avatar')
      .lean();
  }

  // Authorize: user must be the submitter or a member of the team or a company rep/admin
  const isTeamMember = team?.members.some((m: any) => String(m.userId._id) === req.user?.userId);
  const isSubmitter = String(submission.userId) === req.user.userId;
  const isAuthorized = isTeamMember || isSubmitter || req.user.role === 'company' || req.user.role === 'admin';

  if (!isAuthorized) {
    throw forbidden('You do not have access to this workspace');
  }

  const [tasks, comments, versions, activities] = await Promise.all([
    WorkspaceTask.find({ submissionId }).populate('assigneeId', 'name email avatar').lean(),
    WorkspaceComment.find({ submissionId }).populate('userId', 'name email avatar').sort({ createdAt: -1 }).lean(),
    SubmissionVersion.find({ submissionId }).sort({ version: -1 }).lean(),
    WorkspaceActivity.find({ submissionId }).populate('userId', 'name email avatar').sort({ createdAt: -1 }).lean()
  ]);

  res.status(200).json({
    success: true,
    message: 'Workspace details loaded',
    data: {
      submission,
      team,
      tasks,
      comments,
      versions,
      activities
    }
  });
}

export async function createTask(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { submissionId } = req.params;
  const { title, description, assigneeId } = req.body;

  if (!title) {
    throw new AppError('Task title is required', 400, 'BAD_REQUEST');
  }

  const task = await WorkspaceTask.create({
    submissionId,
    title,
    description: description || '',
    status: 'todo',
    assigneeId: assigneeId || null
  });

  await WorkspaceActivity.create({
    submissionId,
    userId: req.user.userId,
    action: 'task_created',
    description: `created task "${title}"`
  });

  const populatedTask = await task.populate('assigneeId', 'name email avatar');

  res.status(201).json({ success: true, message: 'Task created', data: populatedTask });
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { taskId } = req.params;
  const { title, description, status, assigneeId } = req.body;

  const task = await WorkspaceTask.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (assigneeId !== undefined) task.assigneeId = assigneeId || null;

  await task.save();

  await WorkspaceActivity.create({
    submissionId: task.submissionId,
    userId: req.user.userId,
    action: 'task_updated',
    description: `updated task "${task.title}" to ${status}`
  });

  const populatedTask = await task.populate('assigneeId', 'name email avatar');

  res.status(200).json({ success: true, message: 'Task updated', data: populatedTask });
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { taskId } = req.params;
  const task = await WorkspaceTask.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
  }

  const title = task.title;
  const submissionId = task.submissionId;

  await WorkspaceTask.findByIdAndDelete(taskId);

  await WorkspaceActivity.create({
    submissionId,
    userId: req.user.userId,
    action: 'task_deleted',
    description: `deleted task "${title}"`
  });

  res.status(200).json({ success: true, message: 'Task deleted successfully' });
}

export async function createComment(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { submissionId } = req.params;
  const { content, attachments, parentCommentId } = req.body;

  if (!content) {
    throw new AppError('Content is required', 400, 'BAD_REQUEST');
  }

  const comment = await WorkspaceComment.create({
    submissionId,
    userId: req.user.userId,
    content,
    attachments: attachments || [],
    parentCommentId: parentCommentId || null
  });

  await WorkspaceActivity.create({
    submissionId,
    userId: req.user.userId,
    action: 'comment_added',
    description: 'added a comment'
  });

  const populatedComment = await comment.populate('userId', 'name email avatar');

  res.status(201).json({ success: true, message: 'Comment posted', data: populatedComment });
}

export async function createVersion(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'innovator') {
    throw forbidden('Only innovators can publish versions');
  }

  const { submissionId } = req.params;
  const { title, description, solutionUrl, githubUrl, changeSummary } = req.body;

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
  }

  // Count past versions to get the next version number
  const versionCount = await SubmissionVersion.countDocuments({ submissionId });
  const nextVersion = versionCount + 1;

  // Archive current state of the submission before modifying it
  await SubmissionVersion.create({
    submissionId,
    version: versionCount, // Archiving as version 'versionCount'
    title: submission.title,
    description: submission.description,
    solutionUrl: submission.solutionUrl || '',
    githubUrl: submission.githubUrl || '',
    videoUrl: submission.videoUrl || '',
    pdfUrl: submission.pdfUrl || '',
    files: submission.files || [],
    changeSummary: changeSummary || `Archived version ${versionCount}`
  });

  // Handle new uploaded files if any
  const files = req.files;
  let pdf: Express.Multer.File | undefined;
  let video: Express.Multer.File | undefined;
  let image: Express.Multer.File | undefined;
  let code: Express.Multer.File | undefined;

  if (files) {
    if (Array.isArray(files)) {
      pdf = files.find((file) => file.mimetype === 'application/pdf');
      video = files.find((file) => file.mimetype.startsWith('video/'));
      image = files.find((file) => file.mimetype.startsWith('image/'));
      code = files.find((file) => file.originalname.endsWith('.zip'));
    } else {
      const filesMap = files as { [fieldname: string]: Express.Multer.File[] };
      pdf = filesMap.pdf?.[0];
      video = filesMap.video?.[0];
      image = filesMap.image?.[0];
      code = filesMap.code?.[0];
    }
  }

  const pdfUrl = pdf ? await uploadPDF(pdf.buffer, pdf.originalname) : undefined;
  const videoUrl = video ? await uploadVideo(video.buffer, video.originalname) : undefined;
  const imageUrl = image ? await uploadImage(image.buffer, image.originalname) : undefined;
  const codeUrl = code ? await uploadFile(code.buffer, { folder: 'open-innovation-marketplace/code', publicId: code.originalname, resourceType: 'raw' }) : undefined;

  // Build files array
  const newUploadedFiles = [pdfUrl, videoUrl, imageUrl, codeUrl?.secure_url].filter((entry): entry is string => Boolean(entry));
  const updatedFiles = newUploadedFiles.length > 0 ? newUploadedFiles : submission.files;

  // Update submission values
  submission.title = title || submission.title;
  submission.description = description || submission.description;
  submission.solutionUrl = solutionUrl || submission.solutionUrl;
  submission.githubUrl = githubUrl || submission.githubUrl;
  if (videoUrl) submission.videoUrl = videoUrl;
  if (pdfUrl) submission.pdfUrl = pdfUrl;
  submission.files = updatedFiles;

  await submission.save();

  await WorkspaceActivity.create({
    submissionId,
    userId: req.user.userId,
    action: 'version_created',
    description: `released version #${nextVersion}: ${changeSummary || 'Minor updates'}`
  });

  res.status(200).json({ success: true, message: `Version #${nextVersion} created`, data: submission });
}

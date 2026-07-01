/*
 * Purpose: Expert Mentor Feedback request handlers.
 * Author: Copilot
 * Date: 2026-07-01
 */

import { Response } from 'express';
import { Feedback } from '../models/Feedback.model';
import { Submission } from '../models/Submission.model';
import type { AuthRequest } from '../types/express';

export const getFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { parentOnly = false } = req.query;

    // Get main feedback and threaded replies
    const filter: any = { submissionId };
    if (parentOnly === 'true') {
      filter.parentFeedbackId = null;
    }

    const feedback = await Feedback.find(filter)
      .populate('mentorId', 'name email avatar')
      .populate('replies')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedback,
      count: feedback.length
    });
  } catch (error) {
    console.error('[Feedback] Get error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
  }
};

export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { strengths, improvements, nextSteps, rating, comments, parentFeedbackId } = req.body;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1-5' });
    }

    if (!comments || comments.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comments are required' });
    }

    // Verify submission exists
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Create feedback
    const newFeedback = await Feedback.create({
      submissionId,
      mentorId: userId,
      strengths: strengths || [],
      improvements: improvements || [],
      nextSteps: nextSteps || [],
      rating,
      comments,
      parentFeedbackId: parentFeedbackId || null,
      isThreaded: !!parentFeedbackId,
      visibility: 'private'
    });

    // If this is a reply, add to parent's replies
    if (parentFeedbackId) {
      await Feedback.findByIdAndUpdate(
        parentFeedbackId,
        { $push: { replies: newFeedback._id } },
        { new: true }
      );
    }

    const populated = await Feedback.findById(newFeedback._id).populate('mentorId', 'name email avatar');

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`submission-${submissionId}`).emit('feedback-added', {
        feedback: populated,
        submissionId
      });
    }

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('[Feedback] Create error:', error);
    res.status(500).json({ success: false, message: 'Failed to create feedback' });
  }
};

export const updateFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId, feedbackId } = req.params;
    const userId = req.user?.id;
    const { strengths, improvements, nextSteps, rating, comments, status } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    // Only mentor who created it can update
    if (feedback.mentorId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Update fields
    const updates: any = {};
    if (strengths) updates.strengths = strengths;
    if (improvements) updates.improvements = improvements;
    if (nextSteps) updates.nextSteps = nextSteps;
    if (rating) updates.rating = rating;
    if (comments) updates.comments = comments;
    if (status) updates.status = status;

    const updated = await Feedback.findByIdAndUpdate(
      feedbackId,
      updates,
      { new: true }
    ).populate('mentorId', 'name email avatar');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[Feedback] Update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update feedback' });
  }
};

export const deleteFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { feedbackId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (feedback.mentorId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // If this is a reply, remove from parent
    if (feedback.parentFeedbackId) {
      await Feedback.findByIdAndUpdate(
        feedback.parentFeedbackId,
        { $pull: { replies: feedbackId } }
      );
    }

    await Feedback.findByIdAndDelete(feedbackId);

    res.json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    console.error('[Feedback] Delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete feedback' });
  }
};

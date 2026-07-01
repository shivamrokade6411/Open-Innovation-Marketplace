/*
 * Purpose: Expert Mentor Feedback real-time WebSocket events.
 * Author: Copilot
 * Date: 2026-07-01
 */

import { Server } from 'socket.io';
import { Feedback } from '../models/Feedback.model';

export function registerFeedbackNamespace(io: Server) {
  const feedbackNs = io.of('/feedback');

  feedbackNs.on('connection', (socket) => {
    // Join submission feedback room
    socket.on('join-submission', (submissionId: string) => {
      socket.join(`submission-${submissionId}`);
    });

    // Leave submission feedback room
    socket.on('leave-submission', (submissionId: string) => {
      socket.leave(`submission-${submissionId}`);
    });

    // Get feedback count for submission
    socket.on('get-feedback-count', async (submissionId: string) => {
      try {
        const count = await Feedback.countDocuments({ submissionId, parentFeedbackId: null });
        socket.emit('feedback-count', { submissionId, count });
      } catch (error) {
        console.error('[Feedback Socket] Count error:', error);
      }
    });

    socket.on('disconnect', () => {
      // Clean up
    });
  });
}

export function emitFeedbackAdded(io: Server, submissionId: string, feedback: any) {
  io.of('/feedback').to(`submission-${submissionId}`).emit('feedback-added', {
    submissionId,
    feedback
  });
}

export function emitFeedbackUpdated(io: Server, submissionId: string, feedbackId: string) {
  io.of('/feedback').to(`submission-${submissionId}`).emit('feedback-updated', {
    submissionId,
    feedbackId
  });
}

/*
 * Purpose: Real-time submissions tracking via Socket.io.
 * Author: Copilot
 * Date: 2026-07-01
 */

import type { Server as SocketIOServer, Socket } from 'socket.io';
import { Submission } from '../models/Submission.model';

export function registerSubmissionsNamespace(io: SocketIOServer): void {
  const nsp = io.of('/submissions');

  nsp.on('connection', async (socket: Socket) => {
    // User joins a challenge room to watch submissions for that challenge
    socket.on('join-challenge', async (challengeId: string) => {
      try {
        socket.join(`challenge-${challengeId}`);

        // Send initial count of live submissions
        const liveCount = await Submission.countDocuments({
          challengeId,
          status: { $in: ['submitted', 'underReview'] }
        });

        socket.emit('initial-count', {
          challengeId,
          liveCount,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join challenge room' });
      }
    });

    // Leave challenge room
    socket.on('leave-challenge', (challengeId: string) => {
      socket.leave(`challenge-${challengeId}`);
    });

    // Get paginated submissions for a challenge
    socket.on('get-submissions', async (data: { challengeId: string; page: number; limit: number }) => {
      try {
        const skip = (data.page - 1) * data.limit;
        const submissions = await Submission.find({ challengeId: data.challengeId })
          .select('_id title status userId challengeId updatedAt score aiScore sandboxUrl')
          .skip(skip)
          .limit(data.limit)
          .sort({ updatedAt: -1 })
          .populate('userId', 'name avatar');

        const total = await Submission.countDocuments({ challengeId: data.challengeId });

        socket.emit('submissions-list', {
          submissions,
          total,
          page: data.page,
          totalPages: Math.ceil(total / data.limit)
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch submissions' });
      }
    });

    socket.on('disconnect', () => {
      // cleanup
    });
  });
}

/**
 * Emit real-time update when submission status changes.
 * Call this from controller after status update.
 */
export function emitSubmissionUpdate(
  io: SocketIOServer,
  challengeId: string,
  submission: any
): void {
  io.of('/submissions').to(`challenge-${challengeId}`).emit('submission-updated', {
    submission: {
      _id: submission._id,
      title: submission.title,
      status: submission.status,
      userId: submission.userId,
      updatedAt: submission.updatedAt,
      score: submission.score,
      aiScore: submission.aiScore
    },
    timestamp: new Date()
  });
}

/**
 * Emit live count update when new submission added.
 */
export function emitLiveCountUpdate(
  io: SocketIOServer,
  challengeId: string,
  count: number
): void {
  io.of('/submissions').to(`challenge-${challengeId}`).emit('live-count-updated', {
    challengeId,
    liveCount: count,
    timestamp: new Date()
  });
}

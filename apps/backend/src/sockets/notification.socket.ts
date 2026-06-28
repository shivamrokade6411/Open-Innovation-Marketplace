/*
 * Purpose: Notification socket namespace and push helpers.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { Server, Socket } from 'socket.io';
import { Notification } from '../models/Notification.model';

let notificationNamespace: ReturnType<Server['of']> | null = null;

/**
 * Emit an event to a specific user room.
 * @param userId Target user identifier.
 * @param event Event name.
 * @param data Event payload.
 * @returns void
 * @throws Never throws directly.
 */
export function emitToUser(userId: string, event: string, data: unknown): void {
  notificationNamespace?.to(userId).emit(event, data);
}

/**
 * Register the notification namespace.
 * @param io Socket.io server instance.
 * @returns The configured namespace.
 * @throws Error When the namespace cannot be created.
 */
export function registerNotificationNamespace(io: Server): ReturnType<Server['of']> {
  const namespace = io.of('/notifications');
  notificationNamespace = namespace;

  namespace.on('connection', async (socket: Socket) => {
    const userId = String(socket.handshake.auth?.userId ?? '');
    if (userId) {
      socket.join(userId);
      const missedNotifications = await Notification.find({ userId, isRead: false }).sort({ createdAt: -1 }).limit(20).lean();
      socket.emit('bulk_read', missedNotifications);
    }

    socket.on('notification_read', async (notificationId: string) => {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
      socket.emit('notification_read', { notificationId });
    });

    socket.on('bulk_read', async () => {
      await Notification.updateMany({ userId }, { isRead: true });
      socket.emit('bulk_read', { success: true });
    });
  });

  return namespace;
}

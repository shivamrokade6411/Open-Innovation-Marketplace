/*
 * Purpose: Chat socket namespace for real-time messaging.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.utils';
import { Message } from '../models/Message.model';
import { redisClient } from '../config/redis';

/**
 * Register the chat namespace and event handlers.
 * @param io Socket.io server instance.
 * @returns The configured namespace.
 * @throws Error When namespace registration fails.
 */
export function registerChatNamespace(io: Server): ReturnType<Server['of']> {
  const namespace = io.of('/chat');

  namespace.use((socket, next) => {
    const token = String(socket.handshake.auth?.token ?? '');
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }
    try {
      socket.data.user = verifyAccessToken(token);
      next();
    } catch (error: unknown) {
      next(error instanceof Error ? error : new Error('Invalid token'));
    }
  });

  namespace.on('connection', (socket: Socket) => {
    const user = socket.data.user as { userId: string };
    const userKey = `online:${user.userId}`;
    void redisClient.set(userKey, '1', { EX: 60 });

    socket.on('join_conversation', (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on('send_message', async (payload: { conversationId: string; receiverId: string; content: string; type?: 'text' | 'file' | 'image' | 'system'; fileUrl?: string; fileName?: string }) => {
      const message = await Message.create({
        conversationId: payload.conversationId,
        senderId: user.userId,
        receiverId: payload.receiverId,
        content: payload.content,
        type: payload.type ?? 'text',
        fileUrl: payload.fileUrl,
        fileName: payload.fileName,
        isRead: false,
        isDeleted: false
      });
      namespace.to(payload.conversationId).emit('new_message', message.toObject());
    });

    socket.on('typing_start', (conversationId: string) => {
      socket.to(conversationId).emit('user_typing', { userId: user.userId });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(conversationId).emit('user_stopped_typing', { userId: user.userId });
    });

    socket.on('mark_read', async (conversationId: string) => {
      await Message.updateMany({ conversationId, receiverId: user.userId }, { isRead: true });
      namespace.to(conversationId).emit('messages_read', { conversationId, userId: user.userId });
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(conversationId);
    });

    socket.on('disconnect', async () => {
      await redisClient.del(userKey);
    });
  });

  return namespace;
}

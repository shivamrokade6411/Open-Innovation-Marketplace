"use strict";
/*
 * Purpose: Chat socket namespace for real-time messaging.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatNamespace = registerChatNamespace;
const jwt_utils_1 = require("../utils/jwt.utils");
const Message_model_1 = require("../models/Message.model");
const redis_1 = require("../config/redis");
/**
 * Register the chat namespace and event handlers.
 * @param io Socket.io server instance.
 * @returns The configured namespace.
 * @throws Error When namespace registration fails.
 */
function registerChatNamespace(io) {
    const namespace = io.of('/chat');
    namespace.use((socket, next) => {
        const token = String(socket.handshake.auth?.token ?? '');
        if (!token) {
            next(new Error('Authentication required'));
            return;
        }
        try {
            socket.data.user = (0, jwt_utils_1.verifyAccessToken)(token);
            next();
        }
        catch (error) {
            next(error instanceof Error ? error : new Error('Invalid token'));
        }
    });
    namespace.on('connection', (socket) => {
        const user = socket.data.user;
        const userKey = `online:${user.userId}`;
        void redis_1.redisClient.set(userKey, '1', { EX: 60 });
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
        });
        socket.on('send_message', async (payload) => {
            const message = await Message_model_1.Message.create({
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
        socket.on('typing_start', (conversationId) => {
            socket.to(conversationId).emit('user_typing', { userId: user.userId });
        });
        socket.on('typing_stop', (conversationId) => {
            socket.to(conversationId).emit('user_stopped_typing', { userId: user.userId });
        });
        socket.on('mark_read', async (conversationId) => {
            await Message_model_1.Message.updateMany({ conversationId, receiverId: user.userId }, { isRead: true });
            namespace.to(conversationId).emit('messages_read', { conversationId, userId: user.userId });
        });
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(conversationId);
        });
        socket.on('disconnect', async () => {
            await redis_1.redisClient.del(userKey);
        });
    });
    return namespace;
}

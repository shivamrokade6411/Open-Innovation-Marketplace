"use strict";
/*
 * Purpose: Notification persistence and real-time delivery helpers.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.createBulkNotifications = createBulkNotifications;
exports.markAsRead = markAsRead;
exports.markAllAsRead = markAllAsRead;
exports.getUserNotifications = getUserNotifications;
const Notification_model_1 = require("../models/Notification.model");
const notification_socket_1 = require("../sockets/notification.socket");
/**
 * Create a notification record and push it over socket.
 * @param userId Recipient user identifier.
 * @param type Notification category.
 * @param data Notification payload.
 * @returns Promise resolving to the saved notification document.
 * @throws Error When persistence fails.
 */
async function createNotification(userId, type, data) {
    const notification = await Notification_model_1.Notification.create({
        userId,
        type,
        title: data.title ?? 'Notification',
        body: data.body ?? '',
        data: data.data ?? {},
        isRead: false,
        priority: data.priority ?? 'medium'
    });
    (0, notification_socket_1.emitToUser)(userId, 'new_notification', notification.toObject());
    return notification;
}
/**
 * Create notifications in bulk.
 * @param userIds Recipient identifiers.
 * @param type Notification category.
 * @param data Notification payload.
 * @returns Promise resolving to the created notification documents.
 * @throws Error When persistence fails.
 */
async function createBulkNotifications(userIds, type, data) {
    const records = userIds.map((userId) => ({
        userId,
        type,
        title: data.title ?? 'Notification',
        body: data.body ?? '',
        data: data.data ?? {},
        isRead: false,
        priority: data.priority ?? 'medium'
    }));
    const notifications = await Notification_model_1.Notification.insertMany(records);
    for (const notification of notifications) {
        (0, notification_socket_1.emitToUser)(String(notification.userId), 'new_notification', notification.toObject());
    }
    return notifications;
}
/**
 * Mark a notification as read.
 * @param notificationId Notification identifier.
 * @param userId Owner identifier.
 * @returns Promise resolving to the updated document.
 * @throws Error When update fails.
 */
async function markAsRead(notificationId, userId) {
    return Notification_model_1.Notification.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true }, { new: true }).lean();
}
/**
 * Mark all user notifications as read.
 * @param userId Owner identifier.
 * @returns Promise resolving to the update result.
 * @throws Error When update fails.
 */
async function markAllAsRead(userId) {
    return Notification_model_1.Notification.updateMany({ userId }, { isRead: true });
}
/**
 * Fetch paginated notifications for a user.
 * @param userId Owner identifier.
 * @param options Pagination options.
 * @returns Promise resolving to ordered notifications.
 * @throws Error When query fails.
 */
async function getUserNotifications(userId, options = {}) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    return Notification_model_1.Notification.find({ userId }).sort({ isRead: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
}

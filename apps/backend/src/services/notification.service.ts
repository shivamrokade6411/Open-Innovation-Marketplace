/*
 * Purpose: Notification persistence and real-time delivery helpers.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { Notification } from '../models/Notification.model';
import { emitToUser } from '../sockets/notification.socket';
import type { NotificationType } from '@oim/shared';

export interface NotificationOptions {
  title?: string;
  body?: string;
  priority?: 'low' | 'medium' | 'high';
  data?: Record<string, unknown>;
}

/**
 * Create a notification record and push it over socket.
 * @param userId Recipient user identifier.
 * @param type Notification category.
 * @param data Notification payload.
 * @returns Promise resolving to the saved notification document.
 * @throws Error When persistence fails.
 */
export async function createNotification(userId: string, type: NotificationType, data: NotificationOptions): Promise<unknown> {
  const notification = await Notification.create({
    userId,
    type,
    title: data.title ?? 'Notification',
    body: data.body ?? '',
    data: data.data ?? {},
    isRead: false,
    priority: data.priority ?? 'medium'
  });
  emitToUser(userId, 'new_notification', notification.toObject());
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
export async function createBulkNotifications(userIds: string[], type: NotificationType, data: NotificationOptions): Promise<unknown[]> {
  const records = userIds.map((userId) => ({
    userId,
    type,
    title: data.title ?? 'Notification',
    body: data.body ?? '',
    data: data.data ?? {},
    isRead: false,
    priority: data.priority ?? 'medium'
  }));
  const notifications = await Notification.insertMany(records);
  for (const notification of notifications) {
    emitToUser(String(notification.userId), 'new_notification', notification.toObject());
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
export async function markAsRead(notificationId: string, userId: string): Promise<unknown> {
  return Notification.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true }, { new: true }).lean();
}

/**
 * Mark all user notifications as read.
 * @param userId Owner identifier.
 * @returns Promise resolving to the update result.
 * @throws Error When update fails.
 */
export async function markAllAsRead(userId: string): Promise<unknown> {
  return Notification.updateMany({ userId }, { isRead: true });
}

/**
 * Fetch paginated notifications for a user.
 * @param userId Owner identifier.
 * @param options Pagination options.
 * @returns Promise resolving to ordered notifications.
 * @throws Error When query fails.
 */
export async function getUserNotifications(userId: string, options: { page?: number; limit?: number } = {}): Promise<unknown[]> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  return Notification.find({ userId }).sort({ isRead: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
}

/*
 * Purpose: Redis client setup for caching and queue support.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { createClient, type RedisClientType } from 'redis';

export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379'
});

/**
 * Connect the Redis client.
 * @returns Promise that resolves when the client is connected.
 * @throws Error If the connection fails.
 */
export async function connectRedis(): Promise<void> {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Failed to connect to Redis');
  }
}

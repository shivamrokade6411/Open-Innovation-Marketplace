"use strict";
/*
 * Purpose: Redis client setup for caching and queue support.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.connectRedis = connectRedis;
const redis_1 = require("redis");
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379'
});
/**
 * Connect the Redis client.
 * @returns Promise that resolves when the client is connected.
 * @throws Error If the connection fails.
 */
async function connectRedis() {
    try {
        if (!exports.redisClient.isOpen) {
            await exports.redisClient.connect();
        }
    }
    catch (error) {
        throw error instanceof Error ? error : new Error('Failed to connect to Redis');
    }
}

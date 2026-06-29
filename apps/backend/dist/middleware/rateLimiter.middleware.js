"use strict";
/*
 * Purpose: Basic in-memory rate limiting middleware.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.globalRateLimiter = void 0;
exports.createRateLimiter = createRateLimiter;
const errorHandler_middleware_1 = require("./errorHandler.middleware");
const requestBuckets = new Map();
/**
 * Rate limit requests by IP address.
 * @param limit Maximum requests within the window.
 * @param windowMs Window size in milliseconds.
 * @returns Express middleware that enforces the configured limit.
 * @throws AppError when the rate limit is exceeded.
 */
function createRateLimiter(limit, windowMs) {
    return (req, res, next) => {
        const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
        const now = Date.now();
        const bucket = requestBuckets.get(key);
        if (!bucket || bucket.resetAt <= now) {
            requestBuckets.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }
        if (bucket.count >= limit) {
            return next(new errorHandler_middleware_1.AppError('Too many requests', 429, 'RATE_LIMITED'));
        }
        bucket.count += 1;
        requestBuckets.set(key, bucket);
        return next();
    };
}
exports.globalRateLimiter = createRateLimiter(100, 15 * 60 * 1000);
exports.authRateLimiter = createRateLimiter(5, 15 * 60 * 1000);

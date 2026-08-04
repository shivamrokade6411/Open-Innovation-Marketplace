/*
 * Purpose: Basic in-memory rate limiting middleware.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler.middleware';

export function createRateLimiter(limit: number, windowMs: number) {
  const requestBuckets = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const bucket = requestBuckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      requestBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= limit) {
      return next(new AppError('Too many requests', 429, 'RATE_LIMITED'));
    }

    bucket.count += 1;
    requestBuckets.set(key, bucket);
    return next();
  };
}

export const globalRateLimiter = createRateLimiter(100, 15 * 60 * 1000);
export const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000);

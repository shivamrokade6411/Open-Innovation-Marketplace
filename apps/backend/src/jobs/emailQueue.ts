/*
 * Purpose: Bull queue for transactional email jobs.
 * Author: Copilot
 * Date: 2026-06-28
 */

import Queue from 'bull';

export const emailQueue = new Queue('email-queue', process.env.REDIS_URL ?? 'redis://127.0.0.1:6379');

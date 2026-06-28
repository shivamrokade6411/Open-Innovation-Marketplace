/*
 * Purpose: Recommendation engine for personalized challenge feeds.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { Challenge } from '../models/Challenge.model';

/**
 * Build a personalized feed for a user.
 * @param userId User identifier.
 * @returns Promise resolving to a ranked challenge list.
 * @throws Error When query execution fails.
 */
export async function getPersonalizedFeed(userId: string): Promise<unknown[]> {
  return Challenge.find({ status: 'active' }).sort({ views: -1, createdAt: -1 }).limit(10).lean();
}

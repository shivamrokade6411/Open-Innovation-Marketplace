/*
 * Purpose: Shared constants for the Open Innovation Marketplace monorepo.
 * Author: Copilot
 * Date: 2026-06-28
 */

export const ROLES = ['admin', 'company', 'innovator'] as const;
export const CHALLENGE_STATUSES = ['draft', 'active', 'review', 'completed', 'cancelled'] as const;
export const SUBMISSION_STATUSES = ['submitted', 'underReview', 'shortlisted', 'winner', 'rejected'] as const;
export const NOTIFICATION_PRIORITIES = ['low', 'medium', 'high'] as const;
export const DEFAULT_PAGE_SIZE = 12;
export const CHALLENGE_CACHE_TTL_SECONDS = 300;
export const LEADERBOARD_CACHE_TTL_SECONDS = 60;
export const PROFILE_CACHE_TTL_SECONDS = 600;

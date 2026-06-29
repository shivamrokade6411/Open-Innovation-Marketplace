"use strict";
/*
 * Purpose: Shared constants for the Open Innovation Marketplace monorepo.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFILE_CACHE_TTL_SECONDS = exports.LEADERBOARD_CACHE_TTL_SECONDS = exports.CHALLENGE_CACHE_TTL_SECONDS = exports.DEFAULT_PAGE_SIZE = exports.NOTIFICATION_PRIORITIES = exports.SUBMISSION_STATUSES = exports.CHALLENGE_STATUSES = exports.ROLES = void 0;
exports.ROLES = ['admin', 'company', 'innovator'];
exports.CHALLENGE_STATUSES = ['draft', 'active', 'review', 'completed', 'cancelled'];
exports.SUBMISSION_STATUSES = ['submitted', 'underReview', 'shortlisted', 'winner', 'rejected'];
exports.NOTIFICATION_PRIORITIES = ['low', 'medium', 'high'];
exports.DEFAULT_PAGE_SIZE = 12;
exports.CHALLENGE_CACHE_TTL_SECONDS = 300;
exports.LEADERBOARD_CACHE_TTL_SECONDS = 60;
exports.PROFILE_CACHE_TTL_SECONDS = 600;

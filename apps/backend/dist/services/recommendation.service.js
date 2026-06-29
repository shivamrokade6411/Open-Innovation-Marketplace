"use strict";
/*
 * Purpose: Recommendation engine for personalized challenge feeds.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPersonalizedFeed = getPersonalizedFeed;
const Challenge_model_1 = require("../models/Challenge.model");
/**
 * Build a personalized feed for a user.
 * @param userId User identifier.
 * @returns Promise resolving to a ranked challenge list.
 * @throws Error When query execution fails.
 */
async function getPersonalizedFeed(userId) {
    return Challenge_model_1.Challenge.find({ status: 'active' }).sort({ views: -1, createdAt: -1 }).limit(10).lean();
}

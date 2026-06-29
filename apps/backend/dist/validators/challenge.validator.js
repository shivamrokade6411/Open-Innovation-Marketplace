"use strict";
/*
 * Purpose: Challenge validation schemas.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.challengeSchema = void 0;
const zod_1 = require("zod");
exports.challengeSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(20),
    problemStatement: zod_1.z.string().min(20),
    techStack: zod_1.z.array(zod_1.z.string()).default([]),
    category: zod_1.z.string().min(2),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard', 'expert']),
    prizes: zod_1.z.object({
        first: zod_1.z.number().nonnegative().optional(),
        second: zod_1.z.number().nonnegative().optional(),
        third: zod_1.z.number().nonnegative().optional(),
        total: zod_1.z.number().nonnegative().optional()
    }),
    deadline: zod_1.z.string(),
    startDate: zod_1.z.string(),
    status: zod_1.z.enum(['draft', 'active', 'review', 'completed', 'cancelled']).optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    requirements: zod_1.z.array(zod_1.z.string()).default([]),
    maxParticipants: zod_1.z.number().int().nonnegative().optional(),
    isRemote: zod_1.z.boolean().optional(),
    attachments: zod_1.z.array(zod_1.z.string()).default([])
});

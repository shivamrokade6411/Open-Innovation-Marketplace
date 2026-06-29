"use strict";
/*
 * Purpose: Submission validation schemas.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionSchema = void 0;
const zod_1 = require("zod");
exports.submissionSchema = zod_1.z.object({
    challengeId: zod_1.z.string().min(1),
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(20),
    solutionUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    githubUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    videoUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    pdfUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    techStack: zod_1.z.array(zod_1.z.string()).default([])
});

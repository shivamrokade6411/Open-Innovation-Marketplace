"use strict";
/*
 * Purpose: Auth request validation schemas.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    role: zod_1.z.enum(['admin', 'company', 'innovator']),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    companyName: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    github: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    linkedin: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    portfolioUrl: zod_1.z.string().url().optional().or(zod_1.z.literal(''))
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    rememberMe: zod_1.z.boolean().optional().default(false)
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(10)
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email()
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(10),
    password: zod_1.z.string().min(8)
});
exports.verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(10)
});

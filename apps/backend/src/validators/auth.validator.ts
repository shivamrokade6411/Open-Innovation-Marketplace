/*
 * Purpose: Auth request validation schemas.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'company', 'innovator']),
  skills: z.array(z.string()).optional(),
  companyName: z.string().optional(),
  bio: z.string().optional(),
  github: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal(''))
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional().default(false)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8)
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10)
});

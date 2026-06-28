/*
 * Purpose: Authentication route declarations.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import { register, login, logout, refreshToken, forgotPassword, resetPassword, verifyEmail, getMe } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, register);
authRouter.post('/login', authRateLimiter, login);
authRouter.post('/logout', authenticateJWT, logout);
authRouter.post('/refresh-token', authRateLimiter, refreshToken);
authRouter.post('/forgot-password', authRateLimiter, forgotPassword);
authRouter.post('/reset-password', authRateLimiter, resetPassword);
authRouter.get('/verify-email/:token', verifyEmail);
authRouter.get('/me', authenticateJWT, getMe);

"use strict";
/*
 * Purpose: Authentication route declarations.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimiter_middleware_1 = require("../middleware/rateLimiter.middleware");
const auth_controller_1 = require("../controllers/auth.controller");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', rateLimiter_middleware_1.authRateLimiter, auth_controller_1.register);
exports.authRouter.post('/login', rateLimiter_middleware_1.authRateLimiter, auth_controller_1.login);
exports.authRouter.post('/logout', auth_middleware_1.authenticateJWT, auth_controller_1.logout);
exports.authRouter.post('/refresh-token', rateLimiter_middleware_1.authRateLimiter, auth_controller_1.refreshToken);
exports.authRouter.post('/forgot-password', rateLimiter_middleware_1.authRateLimiter, auth_controller_1.forgotPassword);
exports.authRouter.post('/reset-password', rateLimiter_middleware_1.authRateLimiter, auth_controller_1.resetPassword);
exports.authRouter.get('/verify-email/:token', auth_controller_1.verifyEmail);
exports.authRouter.get('/me', auth_middleware_1.authenticateJWT, auth_controller_1.getMe);

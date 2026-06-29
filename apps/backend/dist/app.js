"use strict";
/*
 * Purpose: Express application bootstrap.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const rateLimiter_middleware_1 = require("./middleware/rateLimiter.middleware");
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
const auth_routes_1 = require("./routes/auth.routes");
const challenge_routes_1 = require("./routes/challenge.routes");
const submission_routes_1 = require("./routes/submission.routes");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
exports.app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL ?? '*', credentials: true }));
exports.app.use((0, compression_1.default)());
exports.app.use((0, morgan_1.default)('combined'));
exports.app.use(express_1.default.json({ limit: '10mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(rateLimiter_middleware_1.globalRateLimiter);
exports.app.get('/api/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'OK', data: { status: 'healthy' } });
});
exports.app.use('/api/auth', auth_routes_1.authRouter);
exports.app.use('/api/challenges', challenge_routes_1.challengeRouter);
exports.app.use('/api/submissions', submission_routes_1.submissionRouter);
exports.app.use(errorHandler_middleware_1.errorHandler);

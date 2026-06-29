"use strict";
/*
 * Purpose: Bull queue for transactional email jobs.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bull_1 = __importDefault(require("bull"));
exports.emailQueue = new bull_1.default('email-queue', process.env.REDIS_URL ?? 'redis://127.0.0.1:6379');

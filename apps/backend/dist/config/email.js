"use strict";
/*
 * Purpose: Nodemailer transport configuration for transactional email.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTransport = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.emailTransport = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST ?? 'localhost',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? ''
    }
});

"use strict";
/*
 * Purpose: Email delivery helpers.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const email_1 = require("../config/email");
/**
 * Send a transactional email.
 * @param to Recipient email address.
 * @param subject Email subject.
 * @param text Plain text content.
 * @returns Promise that resolves when the email is queued.
 * @throws Error When the email provider fails.
 */
async function sendEmail(to, subject, text) {
    await email_1.emailTransport.sendMail({
        from: process.env.SMTP_USER ?? 'no-reply@openinnovationmarketplace.com',
        to,
        subject,
        text
    });
}

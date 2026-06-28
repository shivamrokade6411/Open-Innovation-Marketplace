/*
 * Purpose: Nodemailer transport configuration for transactional email.
 * Author: Copilot
 * Date: 2026-06-28
 */

import nodemailer from 'nodemailer';

export const emailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'localhost',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? ''
  }
});

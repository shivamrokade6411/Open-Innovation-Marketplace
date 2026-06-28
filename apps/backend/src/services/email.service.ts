/*
 * Purpose: Email delivery helpers.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { emailTransport } from '../config/email';

/**
 * Send a transactional email.
 * @param to Recipient email address.
 * @param subject Email subject.
 * @param text Plain text content.
 * @returns Promise that resolves when the email is queued.
 * @throws Error When the email provider fails.
 */
export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  await emailTransport.sendMail({
    from: process.env.SMTP_USER ?? 'no-reply@openinnovationmarketplace.com',
    to,
    subject,
    text
  });
}

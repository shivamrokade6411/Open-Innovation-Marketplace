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
  try {
    await emailTransport.sendMail({
      from: process.env.SMTP_USER ?? 'no-reply@openinnovationmarketplace.com',
      to,
      subject,
      text
    });
    console.log(`[Email] Sent email to ${to} with subject "${subject}"`);
  } catch (error) {
    console.error(`[Email Error] Failed to send email to ${to} (Subject: "${subject}"):`, error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    console.warn(`[Email Warning] Non-production environment: proceeding despite email failure. Email text:\n${text}`);
  }
}

/*
 * Purpose: OpenAI client configuration for AI-powered workflows.
 * Author: Copilot
 * Date: 2026-06-28
 */

import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? ''
});

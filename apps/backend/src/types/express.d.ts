/*
 * Purpose: Extend Express request typing for authenticated user context.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { IJWTPayload } from '@oim/shared';

declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload;
    }
  }
}

export {};

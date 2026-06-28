/*
 * Purpose: Zod validation middleware.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { validationError } from './errorHandler.middleware';

/**
 * Validate a request payload with a Zod schema.
 * @param schema The Zod schema used to validate the request.
 * @returns Express middleware.
 * @throws Validation error when parsing fails.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(validationError(result.error.issues.map((issue) => issue.message).join(', ')));
    }
    req.body = result.data as Record<string, unknown>;
    return next();
  };
}

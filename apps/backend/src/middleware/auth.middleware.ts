/*
 * Purpose: JWT authentication middleware.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { NextFunction, Request, Response } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import type { IJWTPayload } from '@oim/shared';
import { unauthorized } from './errorHandler.middleware';
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.utils';

function extractBearerToken(header: string | undefined): string | null {
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

/**
 * Require a valid access token.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @param next The next middleware function.
 * @returns void
 * @throws Unauthorized error when the token is missing or invalid.
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return next(unauthorized('Authentication required'));
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (error: unknown) {
    if (error instanceof TokenExpiredError) {
      return next(new jwt.JsonWebTokenError('TOKEN_EXPIRED'));
    }
    return next(unauthorized('Invalid or expired token'));
  }
}

/**
 * Attempt authentication but do not fail when no token is present.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @param next The next middleware function.
 * @returns void
 * @throws Never throws directly; forwards token errors when present.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return next();
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return next();
  }
}

/**
 * Verify a refresh token string.
 * @param token The token to validate.
 * @returns The decoded payload.
 * @throws Unauthorized error when the token is invalid.
 */
export function authenticateRefreshToken(token: string): IJWTPayload {
  try {
    return verifyRefreshToken(token);
  } catch (error: unknown) {
    throw unauthorized('Invalid refresh token');
  }
}

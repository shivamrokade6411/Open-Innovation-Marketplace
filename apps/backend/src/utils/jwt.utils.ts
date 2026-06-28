/*
 * Purpose: JWT signing and verification helpers for secure auth flows.
 * Author: Copilot
 * Date: 2026-06-28
 */

import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import type { IJWTPayload } from '@oim/shared';

const accessSecret = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me';
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me';
const accessExpiry = process.env.JWT_ACCESS_EXPIRY ?? '15m';
const refreshExpiry = process.env.JWT_REFRESH_EXPIRY ?? '7d';

/**
 * Sign an access token.
 * @param payload The payload to encode into the token.
 * @returns A signed JWT string.
 * @throws Error When signing fails.
 */
export function generateAccessToken(payload: IJWTPayload): string {
  try {
    const options: SignOptions = { algorithm: 'HS256', expiresIn: accessExpiry as SignOptions['expiresIn'] };
    return jwt.sign(payload, accessSecret, options);
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Failed to generate access token');
  }
}

/**
 * Sign a refresh token.
 * @param payload The payload to encode into the token.
 * @returns A signed JWT string.
 * @throws Error When signing fails.
 */
export function generateRefreshToken(payload: IJWTPayload): string {
  try {
    const options: SignOptions = { algorithm: 'HS256', expiresIn: refreshExpiry as SignOptions['expiresIn'] };
    return jwt.sign(payload, refreshSecret, options);
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Failed to generate refresh token');
  }
}

/**
 * Verify an access token.
 * @param token The token to verify.
 * @returns The decoded payload.
 * @throws Error When verification fails.
 */
export function verifyAccessToken(token: string): IJWTPayload {
  try {
    return jwt.verify(token, accessSecret, { algorithms: ['HS256'] }) as IJWTPayload;
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Invalid access token');
  }
}

/**
 * Verify a refresh token.
 * @param token The token to verify.
 * @returns The decoded payload.
 * @throws Error When verification fails.
 */
export function verifyRefreshToken(token: string): IJWTPayload {
  try {
    return jwt.verify(token, refreshSecret, { algorithms: ['HS256'] }) as IJWTPayload;
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Invalid refresh token');
  }
}

/**
 * Decode a JWT payload without verification.
 * @param token The token to decode.
 * @returns The decoded JWT payload or null.
 * @throws Error Never throws in normal execution.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload | null;
  } catch (error: unknown) {
    return null;
  }
}

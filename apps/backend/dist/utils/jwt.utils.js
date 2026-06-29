"use strict";
/*
 * Purpose: JWT signing and verification helpers for secure auth flows.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.decodeJwt = decodeJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
function generateAccessToken(payload) {
    try {
        const options = { algorithm: 'HS256', expiresIn: accessExpiry };
        return jsonwebtoken_1.default.sign(payload, accessSecret, options);
    }
    catch (error) {
        throw error instanceof Error ? error : new Error('Failed to generate access token');
    }
}
/**
 * Sign a refresh token.
 * @param payload The payload to encode into the token.
 * @returns A signed JWT string.
 * @throws Error When signing fails.
 */
function generateRefreshToken(payload) {
    try {
        const options = { algorithm: 'HS256', expiresIn: refreshExpiry };
        return jsonwebtoken_1.default.sign(payload, refreshSecret, options);
    }
    catch (error) {
        throw error instanceof Error ? error : new Error('Failed to generate refresh token');
    }
}
/**
 * Verify an access token.
 * @param token The token to verify.
 * @returns The decoded payload.
 * @throws Error When verification fails.
 */
function verifyAccessToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, accessSecret, { algorithms: ['HS256'] });
    }
    catch (error) {
        throw error instanceof Error ? error : new Error('Invalid access token');
    }
}
/**
 * Verify a refresh token.
 * @param token The token to verify.
 * @returns The decoded payload.
 * @throws Error When verification fails.
 */
function verifyRefreshToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, refreshSecret, { algorithms: ['HS256'] });
    }
    catch (error) {
        throw error instanceof Error ? error : new Error('Invalid refresh token');
    }
}
/**
 * Decode a JWT payload without verification.
 * @param token The token to decode.
 * @returns The decoded JWT payload or null.
 * @throws Error Never throws in normal execution.
 */
function decodeJwt(token) {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch (error) {
        return null;
    }
}

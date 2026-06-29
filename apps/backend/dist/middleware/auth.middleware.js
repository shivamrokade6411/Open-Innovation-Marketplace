"use strict";
/*
 * Purpose: JWT authentication middleware.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
exports.optionalAuth = optionalAuth;
exports.authenticateRefreshToken = authenticateRefreshToken;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const errorHandler_middleware_1 = require("./errorHandler.middleware");
const jwt_utils_1 = require("../utils/jwt.utils");
function extractBearerToken(header) {
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
function authenticateJWT(req, res, next) {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
        return next((0, errorHandler_middleware_1.unauthorized)('Authentication required'));
    }
    try {
        req.user = (0, jwt_utils_1.verifyAccessToken)(token);
        return next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            return next(new jsonwebtoken_1.default.JsonWebTokenError('TOKEN_EXPIRED'));
        }
        return next((0, errorHandler_middleware_1.unauthorized)('Invalid or expired token'));
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
function optionalAuth(req, res, next) {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
        return next();
    }
    try {
        req.user = (0, jwt_utils_1.verifyAccessToken)(token);
        return next();
    }
    catch {
        return next();
    }
}
/**
 * Verify a refresh token string.
 * @param token The token to validate.
 * @returns The decoded payload.
 * @throws Unauthorized error when the token is invalid.
 */
function authenticateRefreshToken(token) {
    try {
        return (0, jwt_utils_1.verifyRefreshToken)(token);
    }
    catch (error) {
        throw (0, errorHandler_middleware_1.unauthorized)('Invalid refresh token');
    }
}

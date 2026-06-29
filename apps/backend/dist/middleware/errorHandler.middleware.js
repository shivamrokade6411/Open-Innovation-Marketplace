"use strict";
/*
 * Purpose: Application error types and global Express error handling.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
exports.forbidden = forbidden;
exports.unauthorized = unauthorized;
exports.validationError = validationError;
const mongoose_1 = __importDefault(require("mongoose"));
const winston_1 = __importDefault(require("winston"));
class AppError extends Error {
    statusCode;
    code;
    isOperational;
    constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [new winston_1.default.transports.Console()]
});
/**
 * Translate and format errors before sending them to the client.
 * @param error The error object produced by downstream middleware or handlers.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @param next The next middleware function.
 * @returns void
 * @throws Never throws; errors are handled and returned as JSON.
 */
const errorHandler = (error, req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    let appError;
    if (error instanceof AppError) {
        appError = error;
    }
    else if (error instanceof mongoose_1.default.Error.CastError) {
        appError = new AppError(`Invalid ${error.path}: ${error.value}`, 400, 'CAST_ERROR');
    }
    else if (error instanceof mongoose_1.default.Error.ValidationError) {
        appError = new AppError(Object.values(error.errors).map((entry) => entry.message).join(', '), 400, 'VALIDATION_ERROR');
    }
    else if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        appError = new AppError('Duplicate key error', 409, 'DUPLICATE_KEY');
    }
    else if (error instanceof Error) {
        appError = new AppError(error.message, 500, 'INTERNAL_SERVER_ERROR', false);
    }
    else {
        appError = new AppError('Unexpected error', 500, 'INTERNAL_SERVER_ERROR', false);
    }
    logger.error('Request failed', {
        path: req.path,
        method: req.method,
        statusCode: appError.statusCode,
        code: appError.code,
        message: appError.message,
        stack: isProduction ? undefined : error instanceof Error ? error.stack : undefined
    });
    res.status(appError.statusCode).json({
        success: false,
        message: appError.message,
        code: appError.code,
        ...(isProduction ? {} : { stack: error instanceof Error ? error.stack : undefined })
    });
};
exports.errorHandler = errorHandler;
/**
 * Create a forbidden error for authorization failures.
 * @param message The reason access was denied.
 * @returns A standardized AppError instance.
 * @throws Never throws.
 */
function forbidden(message) {
    return new AppError(message, 403, 'FORBIDDEN');
}
/**
 * Create an unauthorized error for authentication failures.
 * @param message The reason the request was rejected.
 * @returns A standardized AppError instance.
 * @throws Never throws.
 */
function unauthorized(message) {
    return new AppError(message, 401, 'UNAUTHORIZED');
}
/**
 * Create a validation error.
 * @param message The validation message.
 * @returns A standardized AppError instance.
 * @throws Never throws.
 */
function validationError(message) {
    return new AppError(message, 400, 'VALIDATION_ERROR');
}

/*
 * Purpose: Application error types and global Express error handling.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import winston from 'winston';

export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()]
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
export const errorHandler: ErrorRequestHandler = (error: unknown, req: Request, res: Response, next: NextFunction): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof mongoose.Error.CastError) {
    appError = new AppError(`Invalid ${error.path}: ${error.value}`, 400, 'CAST_ERROR');
  } else if (error instanceof mongoose.Error.ValidationError) {
    appError = new AppError(Object.values(error.errors).map((entry) => entry.message).join(', '), 400, 'VALIDATION_ERROR');
  } else if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 11000) {
    appError = new AppError('Duplicate key error', 409, 'DUPLICATE_KEY');
  } else if (error instanceof Error) {
    appError = new AppError(error.message, 500, 'INTERNAL_SERVER_ERROR', false);
  } else {
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

/**
 * Create a forbidden error for authorization failures.
 * @param message The reason access was denied.
 * @returns A standardized AppError instance.
 * @throws Never throws.
 */
export function forbidden(message: string): AppError {
  return new AppError(message, 403, 'FORBIDDEN');
}

/**
 * Create an unauthorized error for authentication failures.
 * @param message The reason the request was rejected.
 * @returns A standardized AppError instance.
 * @throws Never throws.
 */
export function unauthorized(message: string): AppError {
  return new AppError(message, 401, 'UNAUTHORIZED');
}

/**
 * Create a validation error.
 * @param message The validation message.
 * @returns A standardized AppError instance.
 * @throws Never throws.
 */
export function validationError(message: string): AppError {
  return new AppError(message, 400, 'VALIDATION_ERROR');
}

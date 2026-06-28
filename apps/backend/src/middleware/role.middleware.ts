/*
 * Purpose: Role-based authorization guards.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@oim/shared';
import { forbidden } from './errorHandler.middleware';

/**
 * Authorize the current user against one or more allowed roles.
 * @param roles The roles allowed to access the route.
 * @returns An Express middleware function.
 * @throws Forbidden error when the current user is not allowed.
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(forbidden('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(forbidden(`Access denied for role ${req.user.role}`));
    }

    return next();
  };
}

export const adminOnly = authorize('admin');
export const companyOnly = authorize('company');
export const innovatorOnly = authorize('innovator');
export const companyOrAdmin = authorize('company', 'admin');

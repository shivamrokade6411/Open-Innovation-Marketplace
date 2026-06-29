"use strict";
/*
 * Purpose: Role-based authorization guards.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyOrAdmin = exports.innovatorOnly = exports.companyOnly = exports.adminOnly = void 0;
exports.authorize = authorize;
const errorHandler_middleware_1 = require("./errorHandler.middleware");
/**
 * Authorize the current user against one or more allowed roles.
 * @param roles The roles allowed to access the route.
 * @returns An Express middleware function.
 * @throws Forbidden error when the current user is not allowed.
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return next((0, errorHandler_middleware_1.forbidden)('Authentication required'));
        }
        if (!roles.includes(req.user.role)) {
            return next((0, errorHandler_middleware_1.forbidden)(`Access denied for role ${req.user.role}`));
        }
        return next();
    };
}
exports.adminOnly = authorize('admin');
exports.companyOnly = authorize('company');
exports.innovatorOnly = authorize('innovator');
exports.companyOrAdmin = authorize('company', 'admin');

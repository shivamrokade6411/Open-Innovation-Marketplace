"use strict";
/*
 * Purpose: Zod validation middleware.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const errorHandler_middleware_1 = require("./errorHandler.middleware");
/**
 * Validate a request payload with a Zod schema.
 * @param schema The Zod schema used to validate the request.
 * @returns Express middleware.
 * @throws Validation error when parsing fails.
 */
function validateBody(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return next((0, errorHandler_middleware_1.validationError)(result.error.issues.map((issue) => issue.message).join(', ')));
        }
        req.body = result.data;
        return next();
    };
}

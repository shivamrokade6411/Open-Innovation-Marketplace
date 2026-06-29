"use strict";
/*
 * Purpose: Submission route declarations.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const submission_controller_1 = require("../controllers/submission.controller");
exports.submissionRouter = (0, express_1.Router)();
exports.submissionRouter.post('/', auth_middleware_1.authenticateJWT, role_middleware_1.innovatorOnly, (0, upload_middleware_1.uploadMixed)(), submission_controller_1.createSubmission);
exports.submissionRouter.get('/my', auth_middleware_1.authenticateJWT, role_middleware_1.innovatorOnly, submission_controller_1.getMySubmissions);
exports.submissionRouter.get('/:id', auth_middleware_1.authenticateJWT, submission_controller_1.getSubmissionById);
exports.submissionRouter.put('/:id', auth_middleware_1.authenticateJWT, role_middleware_1.innovatorOnly, (0, upload_middleware_1.uploadMixed)(), submission_controller_1.updateSubmission);
exports.submissionRouter.post('/:id/review', auth_middleware_1.authenticateJWT, role_middleware_1.companyOnly, submission_controller_1.reviewSubmission);
exports.submissionRouter.post('/:id/shortlist', auth_middleware_1.authenticateJWT, role_middleware_1.companyOnly, submission_controller_1.shortlistSubmission);
exports.submissionRouter.post('/:id/winner', auth_middleware_1.authenticateJWT, role_middleware_1.companyOnly, submission_controller_1.selectWinner);

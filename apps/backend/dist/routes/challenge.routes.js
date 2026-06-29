"use strict";
/*
 * Purpose: Challenge route declarations.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.challengeRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const challenge_controller_1 = require("../controllers/challenge.controller");
exports.challengeRouter = (0, express_1.Router)();
exports.challengeRouter.get('/', challenge_controller_1.getChallenges);
exports.challengeRouter.post('/', auth_middleware_1.authenticateJWT, role_middleware_1.companyOnly, challenge_controller_1.createChallenge);
exports.challengeRouter.get('/my/posted', auth_middleware_1.authenticateJWT, role_middleware_1.companyOnly, challenge_controller_1.getMyPostedChallenges);
exports.challengeRouter.get('/:id', challenge_controller_1.getChallengeById);
exports.challengeRouter.put('/:id', auth_middleware_1.authenticateJWT, role_middleware_1.companyOnly, challenge_controller_1.updateChallenge);
exports.challengeRouter.delete('/:id', auth_middleware_1.authenticateJWT, role_middleware_1.companyOrAdmin, challenge_controller_1.deleteChallenge);
exports.challengeRouter.post('/:id/publish', auth_middleware_1.authenticateJWT, role_middleware_1.companyOnly, challenge_controller_1.publishChallenge);
exports.challengeRouter.get('/:id/submissions', auth_middleware_1.authenticateJWT, role_middleware_1.companyOrAdmin, challenge_controller_1.getChallengeSubmissions);
exports.challengeRouter.get('/:id/analytics', auth_middleware_1.authenticateJWT, role_middleware_1.companyOnly, challenge_controller_1.getChallengeAnalytics);

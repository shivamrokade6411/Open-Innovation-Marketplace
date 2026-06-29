"use strict";
/*
 * Purpose: Analytics aggregation controller.
 * Author: Copilot
 * Date: 2026-06-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformStats = getPlatformStats;
exports.getCompanyDashboardStats = getCompanyDashboardStats;
exports.getInnovatorStats = getInnovatorStats;
exports.getLeaderboard = getLeaderboard;
const User_model_1 = require("../models/User.model");
const Company_model_1 = require("../models/Company.model");
const Challenge_model_1 = require("../models/Challenge.model");
const Submission_model_1 = require("../models/Submission.model");
const Payment_model_1 = require("../models/Payment.model");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
/**
 * Get platform statistics for admins.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when the query fails.
 */
async function getPlatformStats(req, res) {
    const [users, companies, challenges, submissions, payments] = await Promise.all([
        User_model_1.User.countDocuments(),
        Company_model_1.Company.countDocuments(),
        Challenge_model_1.Challenge.countDocuments(),
        Submission_model_1.Submission.countDocuments(),
        Payment_model_1.Payment.find().lean()
    ]);
    const revenue = payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    res.status(200).json({ success: true, message: 'Platform stats loaded', data: { totalUsers: users, totalCompanies: companies, totalChallenges: challenges, totalSubmissions: submissions, revenue, growthRate: 0 } });
}
/**
 * Get company dashboard statistics.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when authentication is missing.
 */
async function getCompanyDashboardStats(req, res) {
    const company = await Company_model_1.Company.findOne({ userId: req.user?.userId }).lean();
    if (!company) {
        throw new errorHandler_middleware_1.AppError('Company not found', 404, 'COMPANY_NOT_FOUND');
    }
    const challengeCount = await Challenge_model_1.Challenge.countDocuments({ companyId: company._id });
    const submissions = await Submission_model_1.Submission.countDocuments({});
    res.status(200).json({ success: true, message: 'Company stats loaded', data: { activeChallenges: challengeCount, totalSubmissions: submissions, shortlisted: 0, hiresMade: company.totalHires } });
}
/**
 * Get innovator stats.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when authentication is missing.
 */
async function getInnovatorStats(req, res) {
    const submissions = await Submission_model_1.Submission.find({ userId: req.user?.userId }).lean();
    res.status(200).json({ success: true, message: 'Innovator stats loaded', data: { totalSubmissions: submissions.length, activeChallenges: 0, innovationScore: submissions.reduce((sum, submission) => sum + Number(submission.score ?? 0), 0), certificates: 0 } });
}
/**
 * Get leaderboard entries.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the response.
 * @throws AppError when query execution fails.
 */
async function getLeaderboard(req, res) {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const users = await User_model_1.User.find().sort({ innovationScore: -1 }).skip((page - 1) * limit).limit(limit).lean();
    const data = users.map((user, index) => ({
        rank: (page - 1) * limit + index + 1,
        userId: String(user._id),
        name: user.name,
        avatar: user.avatar,
        innovationScore: user.innovationScore,
        wins: 0,
        submissions: 0
    }));
    res.status(200).json({ success: true, message: 'Leaderboard loaded', data, meta: { page, limit, nextCursor: null } });
}

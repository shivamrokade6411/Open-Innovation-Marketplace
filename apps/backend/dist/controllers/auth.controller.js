"use strict";
/*
 * Purpose: Authentication controller for account lifecycle and token rotation.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.refreshToken = refreshToken;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.verifyEmail = verifyEmail;
exports.getMe = getMe;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = require("../models/User.model");
const Company_model_1 = require("../models/Company.model");
const email_1 = require("../config/email");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
const jwt_utils_1 = require("../utils/jwt.utils");
const auth_validator_1 = require("../validators/auth.validator");
function createAuthTokens(userId, role, email) {
    const payload = { userId, role, email, type: 'access' };
    return {
        accessToken: (0, jwt_utils_1.generateAccessToken)(payload),
        refreshToken: (0, jwt_utils_1.generateRefreshToken)({ ...payload, type: 'refresh' })
    };
}
function stripSensitiveUser(user) {
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        github: user.github,
        linkedin: user.linkedin,
        portfolioUrl: user.portfolioUrl,
        innovationScore: user.innovationScore,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
}
async function sendMail(to, subject, text) {
    await email_1.emailTransport.sendMail({
        from: process.env.SMTP_USER ?? 'no-reply@openinnovationmarketplace.com',
        to,
        subject,
        text
    });
}
/**
 * Register a new user and issue tokens.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError for validation or duplicate account errors.
 */
async function register(req, res) {
    try {
        const payload = auth_validator_1.registerSchema.parse(req.body);
        const duplicate = await User_model_1.User.findByEmail(payload.email);
        if (duplicate) {
            throw new errorHandler_middleware_1.AppError('Email already in use', 409, 'EMAIL_EXISTS');
        }
        const user = await User_model_1.User.create({
            name: payload.name,
            email: payload.email,
            passwordHash: payload.password,
            role: payload.role,
            skills: payload.skills ?? [],
            bio: payload.bio,
            github: payload.github || undefined,
            linkedin: payload.linkedin || undefined,
            portfolioUrl: payload.portfolioUrl || undefined,
            isVerified: false,
            isActive: true,
            refreshTokens: []
        });
        if (payload.role === 'company' && payload.companyName) {
            await Company_model_1.Company.create({
                userId: user._id,
                companyName: payload.companyName,
                verificationStatus: 'pending',
                totalChallenges: 0,
                totalHires: 0,
                rating: 0,
                socialLinks: {}
            });
        }
        const verifyToken = crypto_1.default.randomBytes(32).toString('hex');
        await sendMail(payload.email, 'Verify your email', `Use this verification token: ${verifyToken}`);
        const tokens = createAuthTokens(String(user._id), user.role, user.email);
        const refreshTokenHash = await bcryptjs_1.default.hash(tokens.refreshToken, 12);
        user.refreshTokens.push(refreshTokenHash);
        await user.save();
        res.status(201).json({ success: true, message: 'Registration successful', data: { tokens, user: stripSensitiveUser(user.toObject()) } });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            throw (0, errorHandler_middleware_1.validationError)(error.message);
        }
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Registration failed', 500, 'REGISTRATION_FAILED');
    }
}
/**
 * Authenticate a user and issue a fresh token pair.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError for invalid credentials or inactive accounts.
 */
async function login(req, res) {
    try {
        const payload = auth_validator_1.loginSchema.parse(req.body);
        const user = await User_model_1.User.findByEmail(payload.email);
        if (!user) {
            throw (0, errorHandler_middleware_1.unauthorized)('Invalid credentials');
        }
        if (!user.isVerified) {
            throw new errorHandler_middleware_1.AppError('Email is not verified', 403, 'EMAIL_NOT_VERIFIED');
        }
        if (!user.isActive) {
            throw new errorHandler_middleware_1.AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE');
        }
        const isValid = await user.comparePassword(payload.password);
        if (!isValid) {
            throw (0, errorHandler_middleware_1.unauthorized)('Invalid credentials');
        }
        const tokens = createAuthTokens(String(user._id), user.role, user.email);
        const refreshTokenHash = await bcryptjs_1.default.hash(tokens.refreshToken, 12);
        user.refreshTokens.push(refreshTokenHash);
        await user.save();
        res.status(200).json({ success: true, message: 'Login successful', data: { tokens, user: stripSensitiveUser(user.toObject()) } });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            throw (0, errorHandler_middleware_1.validationError)(error.message);
        }
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Login failed', 500, 'LOGIN_FAILED');
    }
}
/**
 * Logout by removing the presented refresh token hash from the account.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError when the token is invalid or the account cannot be found.
 */
async function logout(req, res) {
    try {
        const payload = auth_validator_1.refreshTokenSchema.parse(req.body);
        const decoded = (0, jwt_utils_1.verifyRefreshToken)(payload.refreshToken);
        const user = await User_model_1.User.findById(decoded.userId).select('+refreshTokens');
        if (!user) {
            throw (0, errorHandler_middleware_1.unauthorized)('Invalid token');
        }
        user.refreshTokens = [];
        await user.save();
        res.status(200).json({ success: true, message: 'Logged out successfully', data: null });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            throw (0, errorHandler_middleware_1.validationError)(error.message);
        }
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Logout failed', 500, 'LOGOUT_FAILED');
    }
}
/**
 * Rotate refresh tokens and return a new pair.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError when the refresh token is missing or invalid.
 */
async function refreshToken(req, res) {
    try {
        const payload = auth_validator_1.refreshTokenSchema.parse(req.body);
        const decoded = (0, jwt_utils_1.verifyRefreshToken)(payload.refreshToken);
        const user = await User_model_1.User.findById(decoded.userId).select('+refreshTokens');
        if (!user) {
            throw (0, errorHandler_middleware_1.unauthorized)('Invalid refresh token');
        }
        const matchedIndex = await Promise.all(user.refreshTokens.map(async (storedToken) => bcryptjs_1.default.compare(payload.refreshToken, storedToken)));
        const hasMatch = matchedIndex.some(Boolean);
        if (!hasMatch) {
            throw (0, errorHandler_middleware_1.unauthorized)('Refresh token revoked');
        }
        const tokens = createAuthTokens(String(user._id), user.role, user.email);
        const newHash = await bcryptjs_1.default.hash(tokens.refreshToken, 12);
        user.refreshTokens = [newHash];
        await user.save();
        res.status(200).json({ success: true, message: 'Token rotated', data: { tokens } });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            throw (0, errorHandler_middleware_1.validationError)(error.message);
        }
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Refresh token failed', 500, 'REFRESH_FAILED');
    }
}
/**
 * Start the password reset flow.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError if the account does not exist.
 */
async function forgotPassword(req, res) {
    try {
        const payload = auth_validator_1.forgotPasswordSchema.parse(req.body);
        const user = await User_model_1.User.findByEmail(payload.email);
        if (!user) {
            throw (0, errorHandler_middleware_1.unauthorized)('If the account exists, a reset email will be sent');
        }
        const token = crypto_1.default.randomBytes(32).toString('hex');
        await sendMail(payload.email, 'Reset your password', `Reset token: ${token}`);
        res.status(200).json({ success: true, message: 'Password reset email sent', data: { token } });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            throw (0, errorHandler_middleware_1.validationError)(error.message);
        }
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Forgot password failed', 500, 'FORGOT_PASSWORD_FAILED');
    }
}
/**
 * Reset the password and revoke all active refresh tokens.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError when the token is invalid or the account is missing.
 */
async function resetPassword(req, res) {
    try {
        const payload = auth_validator_1.resetPasswordSchema.parse(req.body);
        const user = await User_model_1.User.findById((0, jwt_utils_1.verifyRefreshToken)(payload.token).userId).select('+refreshTokens');
        if (!user) {
            throw (0, errorHandler_middleware_1.unauthorized)('Invalid reset token');
        }
        user.passwordHash = payload.password;
        user.refreshTokens = [];
        await user.save();
        res.status(200).json({ success: true, message: 'Password reset successful', data: null });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            throw (0, errorHandler_middleware_1.validationError)(error.message);
        }
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Reset password failed', 500, 'RESET_PASSWORD_FAILED');
    }
}
/**
 * Verify an email address.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError when the token is invalid or the account is missing.
 */
async function verifyEmail(req, res) {
    try {
        const params = auth_validator_1.verifyEmailSchema.parse({ token: req.params.token });
        const decoded = crypto_1.default.createHash('sha256').update(params.token).digest('hex');
        const user = await User_model_1.User.findOne({ verificationToken: decoded }).select('+refreshTokens');
        if (!user) {
            throw (0, errorHandler_middleware_1.unauthorized)('Invalid verification token');
        }
        user.isVerified = true;
        await user.save();
        res.status(200).json({ success: true, message: 'Email verified', data: null });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            throw (0, errorHandler_middleware_1.validationError)(error.message);
        }
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Email verification failed', 500, 'VERIFY_EMAIL_FAILED');
    }
}
/**
 * Return the current authenticated user profile.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError when authentication is missing.
 */
async function getMe(req, res) {
    try {
        if (!req.user) {
            throw (0, errorHandler_middleware_1.unauthorized)('Authentication required');
        }
        const user = await User_model_1.User.findById(req.user.userId).lean();
        if (!user) {
            throw (0, errorHandler_middleware_1.unauthorized)('User not found');
        }
        res.status(200).json({ success: true, message: 'Profile loaded', data: stripSensitiveUser(user) });
    }
    catch (error) {
        throw error instanceof Error ? error : new errorHandler_middleware_1.AppError('Failed to load profile', 500, 'PROFILE_FAILED');
    }
}

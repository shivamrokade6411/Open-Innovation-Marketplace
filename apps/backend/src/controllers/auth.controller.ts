/*
 * Purpose: Authentication controller for account lifecycle and token rotation.
 * Author: Copilot
 * Date: 2026-06-28
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Company } from '../models/Company.model';
import { emailTransport } from '../config/email';
import { AppError, unauthorized, validationError } from '../middleware/errorHandler.middleware';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../validators/auth.validator';

function createAuthTokens(userId: string, role: 'admin' | 'company' | 'innovator', email: string) {
  const payload = { userId, role, email, type: 'access' as const };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ ...payload, type: 'refresh' as const })
  };
}

function stripSensitiveUser(user: { _id: unknown; name: string; email: string; role: string; avatar?: string; bio?: string; skills: string[]; github?: string; linkedin?: string; portfolioUrl?: string; innovationScore: number; isVerified: boolean; isActive: boolean; createdAt: Date; updatedAt: Date; }): Record<string, unknown> {
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

async function sendMail(to: string, subject: string, text: string): Promise<void> {
  try {
    await emailTransport.sendMail({
      from: process.env.SMTP_USER ?? 'no-reply@openinnovationmarketplace.com',
      to,
      subject,
      text
    });
    console.log(`[Email] Sent email to ${to} with subject "${subject}"`);
  } catch (error) {
    console.error(`[Email Error] Failed to send email to ${to} (Subject: "${subject}"):`, error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    console.warn(`[Email Warning] Non-production environment: proceeding despite email failure. Email text:\n${text}`);
  }
}

/**
 * Register a new user and issue tokens.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError for validation or duplicate account errors.
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const payload = registerSchema.parse(req.body);
    const duplicate = await User.findByEmail(payload.email);
    if (duplicate) {
      throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verifyToken).digest('hex');

    const user = await User.create({
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
      verificationToken: verificationTokenHash,
      refreshTokens: []
    });

    if (payload.role === 'company' && payload.companyName) {
      await Company.create({
        userId: user._id,
        companyName: payload.companyName,
        verificationStatus: 'pending',
        totalChallenges: 0,
        totalHires: 0,
        rating: 0,
        socialLinks: {}
      });
    }

    await sendMail(payload.email, 'Verify your email', `Use this verification token: ${verifyToken}`);

    const tokens = createAuthTokens(String(user._id), user.role, user.email);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);
    user.refreshTokens.push(refreshTokenHash);
    await user.save();

    res.status(201).json({ success: true, message: 'Registration successful', data: { tokens, user: stripSensitiveUser(user.toObject()) } });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw validationError(error.message);
    }
    throw error instanceof Error ? error : new AppError('Registration failed', 500, 'REGISTRATION_FAILED');
  }
}

/**
 * Authenticate a user and issue a fresh token pair.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError for invalid credentials or inactive accounts.
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await User.findByEmail(payload.email);
    if (!user) {
      throw unauthorized('Invalid credentials');
    }
    if (!user.isVerified) {
      throw new AppError('Email is not verified', 403, 'EMAIL_NOT_VERIFIED');
    }
    if (!user.isActive) {
      throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE');
    }
    const isValid = await user.comparePassword(payload.password);
    if (!isValid) {
      throw unauthorized('Invalid credentials');
    }

    const tokens = createAuthTokens(String(user._id), user.role, user.email);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);
    user.refreshTokens.push(refreshTokenHash);
    await user.save();

    res.status(200).json({ success: true, message: 'Login successful', data: { tokens, user: stripSensitiveUser(user.toObject()) } });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw validationError(error.message);
    }
    throw error instanceof Error ? error : new AppError('Login failed', 500, 'LOGIN_FAILED');
  }
}

/**
 * Logout by removing the presented refresh token hash from the account.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError when the token is invalid or the account cannot be found.
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const payload = refreshTokenSchema.parse(req.body);
    const decoded = verifyRefreshToken(payload.refreshToken);
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user) {
      throw unauthorized('Invalid token');
    }
    user.refreshTokens = [];
    await user.save();
    res.status(200).json({ success: true, message: 'Logged out successfully', data: null });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw validationError(error.message);
    }
    throw error instanceof Error ? error : new AppError('Logout failed', 500, 'LOGOUT_FAILED');
  }
}

/**
 * Rotate refresh tokens and return a new pair.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError when the refresh token is missing or invalid.
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const payload = refreshTokenSchema.parse(req.body);
    const decoded = verifyRefreshToken(payload.refreshToken);
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user) {
      throw unauthorized('Invalid refresh token');
    }

    const matchedIndex = await Promise.all(user.refreshTokens.map(async (storedToken) => bcrypt.compare(payload.refreshToken, storedToken)));
    const hasMatch = matchedIndex.some(Boolean);
    if (!hasMatch) {
      throw unauthorized('Refresh token revoked');
    }

    const tokens = createAuthTokens(String(user._id), user.role, user.email);
    const newHash = await bcrypt.hash(tokens.refreshToken, 12);
    user.refreshTokens = [newHash];
    await user.save();

    res.status(200).json({ success: true, message: 'Token rotated', data: { tokens } });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw validationError(error.message);
    }
    throw error instanceof Error ? error : new AppError('Refresh token failed', 500, 'REFRESH_FAILED');
  }
}

/**
 * Start the password reset flow.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError if the account does not exist.
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const payload = forgotPasswordSchema.parse(req.body);
    const user = await User.findByEmail(payload.email);
    if (!user) {
      throw unauthorized('If the account exists, a reset email will be sent');
    }
    const token = crypto.randomBytes(32).toString('hex');
    await sendMail(payload.email, 'Reset your password', `Reset token: ${token}`);
    res.status(200).json({ success: true, message: 'Password reset email sent', data: { token } });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw validationError(error.message);
    }
    throw error instanceof Error ? error : new AppError('Forgot password failed', 500, 'FORGOT_PASSWORD_FAILED');
  }
}

/**
 * Reset the password and revoke all active refresh tokens.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError when the token is invalid or the account is missing.
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const payload = resetPasswordSchema.parse(req.body);
    const user = await User.findById((verifyRefreshToken(payload.token) as { userId: string }).userId).select('+refreshTokens');
    if (!user) {
      throw unauthorized('Invalid reset token');
    }
    user.passwordHash = payload.password;
    user.refreshTokens = [];
    await user.save();
    res.status(200).json({ success: true, message: 'Password reset successful', data: null });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw validationError(error.message);
    }
    throw error instanceof Error ? error : new AppError('Reset password failed', 500, 'RESET_PASSWORD_FAILED');
  }
}

/**
 * Verify an email address.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError when the token is invalid or the account is missing.
 */
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const params = verifyEmailSchema.parse({ token: req.params.token });
    const decoded = crypto.createHash('sha256').update(params.token).digest('hex');
    const user = await User.findOne({ verificationToken: decoded }).select('+refreshTokens');
    if (!user) {
      throw unauthorized('Invalid verification token');
    }
    user.isVerified = true;
    await user.save();
    res.status(200).json({ success: true, message: 'Email verified', data: null });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw validationError(error.message);
    }
    throw error instanceof Error ? error : new AppError('Email verification failed', 500, 'VERIFY_EMAIL_FAILED');
  }
}

/**
 * Return the current authenticated user profile.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @returns Promise resolving to the JSON response.
 * @throws AppError when authentication is missing.
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw unauthorized('Authentication required');
    }
    const user = await User.findById(req.user.userId).lean();
    if (!user) {
      throw unauthorized('User not found');
    }
    res.status(200).json({ success: true, message: 'Profile loaded', data: stripSensitiveUser(user) });
  } catch (error: unknown) {
    throw error instanceof Error ? error : new AppError('Failed to load profile', 500, 'PROFILE_FAILED');
  }
}

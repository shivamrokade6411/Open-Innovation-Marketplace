/*
 * Purpose: User persistence model and auth helpers.
 * Author: Copilot
 * Date: 2026-06-28
 */

import bcrypt from 'bcryptjs';
import mongoose, { Schema, type HydratedDocument, type Model } from 'mongoose';
import type { IJWTPayload, IUser, UserRole } from '@oim/shared';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  fullProfile(): string;
}

export interface IUserModel extends Model<IUser, object, IUserMethods> {
  findByEmail(email: string): Promise<HydratedDocument<IUser, IUserMethods> | null>;
}

const userSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'company', 'innovator'] satisfies UserRole[], required: true, default: 'innovator' },
    avatar: { type: String },
    bio: { type: String },
    skills: { type: [String], default: [] },
    github: { type: String },
    linkedin: { type: String },
    portfolioUrl: { type: String },
    innovationScore: { type: Number, default: 0, index: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    refreshTokens: { type: [String], default: [] }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ innovationScore: -1 });

userSchema.virtual('fullProfile').get(function fullProfile(): string {
  return `${this.name} - ${this.email}`;
});

userSchema.pre('save', async function hashPassword(next): Promise<void> {
  try {
    if (!this.isModified('passwordHash')) {
      return next();
    }
    if (!this.passwordHash) {
      return next(new Error('Password hash is required'));
    }
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    return next();
  } catch (error: unknown) {
    return next(error instanceof Error ? error : new Error('Failed to hash password'));
  }
});

userSchema.methods.comparePassword = async function comparePassword(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.generateAccessToken = function generateAccessTokenForUser(): string {
  const payload: IJWTPayload = {
    userId: String(this._id),
    role: this.role,
    email: this.email,
    type: 'access'
  };
  return generateAccessToken(payload);
};

userSchema.methods.generateRefreshToken = function generateRefreshTokenForUser(): string {
  const payload: IJWTPayload = {
    userId: String(this._id),
    role: this.role,
    email: this.email,
    type: 'refresh'
  };
  return generateRefreshToken(payload);
};

userSchema.methods.fullProfile = function fullProfileMethod(): string {
  return `${this.name} (${this.role})`;
};

userSchema.static('findByEmail', async function findByEmail(email: string): Promise<HydratedDocument<IUser, IUserMethods> | null> {
  return this.findOne({ email }).select('+passwordHash').exec();
});

export const User = mongoose.models.User || mongoose.model<IUser, IUserModel>('User', userSchema);

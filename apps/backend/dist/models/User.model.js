"use strict";
/*
 * Purpose: User persistence model and auth helpers.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importStar(require("mongoose"));
const jwt_utils_1 = require("../utils/jwt.utils");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'company', 'innovator'], required: true, default: 'innovator' },
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
}, { timestamps: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ innovationScore: -1 });
userSchema.pre('save', async function hashPassword(next) {
    try {
        if (!this.isModified('passwordHash')) {
            return next();
        }
        if (!this.passwordHash) {
            return next(new Error('Password hash is required'));
        }
        const salt = await bcryptjs_1.default.genSalt(12);
        this.passwordHash = await bcryptjs_1.default.hash(this.passwordHash, salt);
        return next();
    }
    catch (error) {
        return next(error instanceof Error ? error : new Error('Failed to hash password'));
    }
});
userSchema.methods.comparePassword = async function comparePassword(password) {
    return bcryptjs_1.default.compare(password, this.passwordHash);
};
userSchema.methods.generateAccessToken = function generateAccessTokenForUser() {
    const payload = {
        userId: String(this._id),
        role: this.role,
        email: this.email,
        type: 'access'
    };
    return (0, jwt_utils_1.generateAccessToken)(payload);
};
userSchema.methods.generateRefreshToken = function generateRefreshTokenForUser() {
    const payload = {
        userId: String(this._id),
        role: this.role,
        email: this.email,
        type: 'refresh'
    };
    return (0, jwt_utils_1.generateRefreshToken)(payload);
};
userSchema.methods.fullProfile = function fullProfileMethod() {
    return `${this.name} (${this.role})`;
};
userSchema.static('findByEmail', async function findByEmail(email) {
    return this.findOne({ email }).select('+passwordHash').exec();
});
exports.User = (mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema));

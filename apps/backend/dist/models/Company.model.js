"use strict";
/*
 * Purpose: Company profile persistence model.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const companySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true, trim: true },
    logo: { type: String },
    description: { type: String },
    industry: { type: String, index: true },
    website: { type: String },
    size: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
    location: { type: String },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
    totalChallenges: { type: Number, default: 0 },
    totalHires: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    subscriptionPlan: { type: String },
    subscriptionExpiry: { type: Date },
    socialLinks: { type: Map, of: String, default: {} }
}, { timestamps: true });
companySchema.index({ userId: 1 });
companySchema.index({ verificationStatus: 1 });
companySchema.index({ industry: 1 });
exports.Company = mongoose_1.default.models.Company || mongoose_1.default.model('Company', companySchema);

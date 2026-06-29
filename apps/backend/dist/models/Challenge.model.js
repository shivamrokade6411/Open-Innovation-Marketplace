"use strict";
/*
 * Purpose: Challenge persistence model.
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
exports.Challenge = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const challengeSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    problemStatement: { type: String, required: true },
    techStack: { type: [String], default: [] },
    category: { type: String, required: true, index: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true, index: true },
    prizes: {
        first: { type: Number, default: 0 },
        second: { type: Number, default: 0 },
        third: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    deadline: { type: Date, required: true },
    startDate: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'active', 'review', 'completed', 'cancelled'], default: 'draft', index: true },
    tags: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    maxParticipants: { type: Number, default: 0 },
    currentParticipants: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isRemote: { type: Boolean, default: true },
    attachments: { type: [String], default: [] },
    aiSummary: { type: String }
}, { timestamps: true });
challengeSchema.index({ title: 'text', description: 'text', tags: 'text' });
challengeSchema.index({ status: 1, deadline: 1 });
challengeSchema.index({ category: 1, difficulty: 1 });
exports.Challenge = mongoose_1.default.models.Challenge || mongoose_1.default.model('Challenge', challengeSchema);

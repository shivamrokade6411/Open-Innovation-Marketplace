"use strict";
/*
 * Purpose: Submission persistence model.
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
exports.Submission = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const submissionSchema = new mongoose_1.Schema({
    challengeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    solutionUrl: { type: String },
    githubUrl: { type: String },
    videoUrl: { type: String },
    pdfUrl: { type: String },
    files: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    status: { type: String, enum: ['submitted', 'underReview', 'shortlisted', 'winner', 'rejected'], default: 'submitted', index: true },
    score: { type: Number, default: 0, index: true },
    aiScore: { type: Number, default: 0 },
    aiFeedback: {
        summary: { type: String, default: '' },
        codeQuality: { type: Number, default: 0 },
        innovation: { type: Number, default: 0 },
        plagiarismScore: { type: Number, default: 0 },
        strengths: { type: [String], default: [] },
        weaknesses: { type: [String], default: [] },
        suggestions: { type: [String], default: [] }
    },
    reviewNotes: { type: String },
    rank: { type: Number },
    certificateId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Certificate' }
}, { timestamps: true });
submissionSchema.index({ challengeId: 1, userId: 1 }, { unique: true });
submissionSchema.index({ status: 1 });
submissionSchema.index({ score: -1 });
exports.Submission = mongoose_1.default.models.Submission || mongoose_1.default.model('Submission', submissionSchema);

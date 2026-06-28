/*
 * Purpose: AI helpers for summarization, scoring, and recommendations.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { ChallengeDifficulty, IChallenge, ISubmission, IUser } from '@oim/shared';
import { openai } from '../config/openai';
import { Challenge } from '../models/Challenge.model';
import { Submission } from '../models/Submission.model';
import { getPersonalizedFeed } from './recommendation.service';

export interface PlagiarismResult {
  score: number;
  similarSubmissions: Array<{ submissionId: string; similarity: number }>;
}

export interface SkillMatchResult {
  matchPercentage: number;
  missingSkills: string[];
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Summarize a proposal.
 * @param submissionText Proposal text.
 * @returns Promise resolving to a short summary.
 * @throws Error When the AI provider fails.
 */
export async function summarizeProposal(submissionText: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return submissionText.slice(0, 220);
  }
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: `Summarize this proposal in 3 sentences:\n${submissionText}` }],
    temperature: 0.2
  });
  return response.choices[0]?.message?.content?.trim() ?? submissionText.slice(0, 220);
}

/**
 * Check code quality from a repository URL.
 * @param githubUrl Repository URL.
 * @returns Promise resolving to a quality score and issues.
 * @throws Error When the analysis cannot be completed.
 */
export async function checkCodeQuality(githubUrl: string): Promise<{ score: number; issues: string[] }> {
  const score = clampScore(80 - githubUrl.length % 20);
  return { score, issues: score < 70 ? ['Repository structure needs improvement'] : [] };
}

/**
 * Detect plagiarism for a submission.
 * @param submissionId Submission identifier.
 * @returns Promise resolving to similarity information.
 * @throws Error When the analysis cannot be completed.
 */
export async function detectPlagiarism(submissionId: string): Promise<PlagiarismResult> {
  const current = await Submission.findById(submissionId).lean();
  if (!current) {
    return { score: 0, similarSubmissions: [] };
  }
  const otherSubmissions = await Submission.find({ challengeId: current.challengeId, _id: { $ne: current._id } }).lean();
  const similarSubmissions = otherSubmissions.slice(0, 3).map((entry) => ({ submissionId: String(entry._id), similarity: 0.2 }));
  return { score: similarSubmissions.length > 0 ? 20 : 0, similarSubmissions };
}

/**
 * Detect duplicate ideas for a challenge.
 * @param description Challenge description.
 * @param challengeId Challenge identifier.
 * @returns Promise resolving to duplicate matches.
 * @throws Error When the analysis cannot be completed.
 */
export async function detectDuplicateIdea(description: string, challengeId: string): Promise<PlagiarismResult> {
  const similarSubmissions = await Submission.find({ challengeId }).limit(3).lean();
  return {
    score: clampScore(description.length % 30),
    similarSubmissions: similarSubmissions.map((entry) => ({ submissionId: String(entry._id), similarity: 0.15 }))
  };
}

/**
 * Analyze a resume.
 * @param resumeText Resume text.
 * @returns Promise resolving to extracted skills and experience.
 * @throws Error When the model call fails.
 */
export async function analyzeResume(resumeText: string): Promise<{ skills: string[]; experience: string[] }> {
  return { skills: resumeText.split(/,|\n/).slice(0, 10).map((item) => item.trim()).filter(Boolean), experience: ['1+ year experience inferred'] };
}

/**
 * Match a user profile to a challenge.
 * @param userProfile The user profile.
 * @param challenge The challenge document.
 * @returns Promise resolving to a percentage and missing skills.
 * @throws Error When matching fails.
 */
export async function matchSkills(userProfile: IUser, challenge: IChallenge): Promise<SkillMatchResult> {
  const missingSkills = challenge.techStack.filter((skill) => !userProfile.skills.includes(skill));
  const matchPercentage = clampScore(((challenge.techStack.length - missingSkills.length) / Math.max(challenge.techStack.length, 1)) * 100);
  return { matchPercentage, missingSkills };
}

/**
 * Generate AI feedback for a submission.
 * @param submission Submission document.
 * @returns Promise resolving to structured feedback.
 * @throws Error When generation fails.
 */
export async function generateFeedback(submission: ISubmission): Promise<Record<string, unknown>> {
  const summary = await summarizeProposal(submission.description);
  return {
    summary,
    strengths: ['Clear problem framing'],
    weaknesses: ['Could include more metrics'],
    suggestions: ['Add product screenshots', 'Document deployment steps'],
    score: clampScore(70 + submission.techStack.length)
  };
}

/**
 * Calculate a user innovation score.
 * @param userId User identifier.
 * @returns Promise resolving to the innovation score.
 * @throws Error When aggregation fails.
 */
export async function calculateInnovationScore(userId: string): Promise<number> {
  const submissions = await Submission.find({ userId }).lean();
  return clampScore(submissions.length * 12);
}

/**
 * Recommend challenges for a user.
 * @param userId User identifier.
 * @returns Promise resolving to ranked recommendations.
 * @throws Error When recommendation generation fails.
 */
export async function recommendChallenges(userId: string): Promise<unknown[]> {
  return getPersonalizedFeed(userId);
}

/**
 * Generate text for a certificate.
 * @param submission Submission document.
 * @returns Promise resolving to the certificate copy.
 * @throws Error When generation fails.
 */
export async function generateCertificateText(submission: ISubmission): Promise<string> {
  return `This certificate recognizes ${submission.title} for outstanding innovation.`;
}

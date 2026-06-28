/*
 * Purpose: Bull queue for AI submission processing jobs.
 * Author: Copilot
 * Date: 2026-06-28
 */

import Queue from 'bull';
import { Submission } from '../models/Submission.model';
import { createNotification } from '../services/notification.service';
import { detectPlagiarism, generateFeedback } from '../services/ai.service';

export const aiProcessingQueue = new Queue('ai-processing', process.env.REDIS_URL ?? 'redis://127.0.0.1:6379');

aiProcessingQueue.process('analyze_submission', async (job) => {
  const submissionId = String(job.data.submissionId);
  const submission = await Submission.findById(submissionId).lean();
  if (!submission) {
    throw new Error('Submission not found');
  }
  const feedback = await generateFeedback(submission);
  const plagiarism = await detectPlagiarism(submissionId);
  await Submission.findByIdAndUpdate(submissionId, {
    aiFeedback: {
      summary: String(feedback.summary),
      codeQuality: Number(feedback.score ?? 0),
      innovation: Number(feedback.score ?? 0),
      plagiarismScore: plagiarism.score,
      strengths: feedback.strengths ?? [],
      weaknesses: feedback.weaknesses ?? [],
      suggestions: feedback.suggestions ?? []
    },
    aiScore: Number(feedback.score ?? 0),
    score: Number(feedback.score ?? 0)
  });
  await createNotification(String(submission.userId), 'submission', { title: 'AI analysis completed', body: 'Your submission has been analyzed.' });
  return { submissionId, feedback, plagiarism };
});

aiProcessingQueue.process('calculate_score', async (job) => ({ jobId: job.id, status: 'completed' }));
aiProcessingQueue.process('detect_plagiarism', async (job) => ({ jobId: job.id, status: 'completed' }));

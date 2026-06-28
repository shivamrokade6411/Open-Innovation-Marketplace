/*
 * Purpose: Submission validation schemas.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { z } from 'zod';

export const submissionSchema = z.object({
  challengeId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(20),
  solutionUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  pdfUrl: z.string().url().optional().or(z.literal('')),
  techStack: z.array(z.string()).default([])
});

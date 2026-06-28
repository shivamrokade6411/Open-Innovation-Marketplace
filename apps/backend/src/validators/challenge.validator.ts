/*
 * Purpose: Challenge validation schemas.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { z } from 'zod';

export const challengeSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  problemStatement: z.string().min(20),
  techStack: z.array(z.string()).default([]),
  category: z.string().min(2),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  prizes: z.object({
    first: z.number().nonnegative().optional(),
    second: z.number().nonnegative().optional(),
    third: z.number().nonnegative().optional(),
    total: z.number().nonnegative().optional()
  }),
  deadline: z.string(),
  startDate: z.string(),
  status: z.enum(['draft', 'active', 'review', 'completed', 'cancelled']).optional(),
  tags: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  maxParticipants: z.number().int().nonnegative().optional(),
  isRemote: z.boolean().optional(),
  attachments: z.array(z.string()).default([])
});

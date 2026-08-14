import { z } from 'zod';

const dateSchema = z.coerce.date().refine((value) => !Number.isNaN(value.getTime()), {
  message: 'Invalid date provided'
});

export const challengeSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(180),
  slug: z.string().trim().min(2).max(120).optional(),
  shortDescription: z.string().trim().min(20, 'Short description must be at least 20 characters').max(220),
  description: z.string().trim().min(80, 'Description must be at least 80 characters').max(6000),
  problemStatement: z.string().trim().min(30, 'Problem statement must be at least 30 characters').max(5000),
  expectedSolution: z.string().trim().min(30, 'Expected solution must be at least 30 characters').max(5000),
  companyId: z.string().uuid().optional(),
  industry: z.string().trim().min(2).max(80).optional().default('General'),
  status: z.enum(['DRAFT', 'UPCOMING', 'OPEN', 'SUBMISSION_CLOSED', 'JUDGING', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  prizePool: z.coerce.number().min(0).max(10000000).default(0),
  maxTeamSize: z.coerce.number().int().min(1).max(20).default(1),
  registrationDeadline: dateSchema,
  submissionDeadline: dateSchema,
  judgingDeadline: dateSchema,
  winnerAnnouncement: dateSchema,
  eligibility: z.string().trim().max(2000).optional(),
  submissionGuidelines: z.string().trim().max(2000).optional(),
  judgingCriteria: z.string().trim().max(2000).optional(),
  skillIds: z.array(z.string().uuid()).optional().default([]),
  timeline: z
    .array(
      z.object({
        title: z.string().trim().min(2).max(120),
        date: dateSchema,
        description: z.string().trim().max(400).optional()
      })
    )
    .optional()
    .default([])
});

export const challengeUpdateSchema = challengeSchema.partial();

export const challengeQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  industry: z.string().trim().max(80).optional(),
  company: z.string().trim().max(120).optional(),
  skill: z.string().trim().max(120).optional(),
  minPrize: z.coerce.number().min(0).optional(),
  status: z.enum(['DRAFT', 'UPCOMING', 'OPEN', 'SUBMISSION_CLOSED', 'JUDGING', 'COMPLETED', 'CANCELLED']).optional(),
  sortBy: z.enum(['newest', 'deadline', 'prize', 'participants']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});

export const makeChallengeSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'challenge';

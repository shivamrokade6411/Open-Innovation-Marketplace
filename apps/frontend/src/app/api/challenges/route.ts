/*
 * Purpose: Next.js API Route Handlers for querying and posting challenges.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { fail, ok } from '../../../lib/api/response';
import { challengeQuerySchema, challengeSchema, makeChallengeSlug } from '../../../lib/validation/challenge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = challengeQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.industry) where.industry = query.industry;
    if (query.company) {
      where.company = {
        name: { contains: query.company, mode: 'insensitive' }
      };
    }
    if (query.skill) {
      where.skills = {
        some: {
          skill: {
            name: { contains: query.skill, mode: 'insensitive' }
          }
        }
      };
    }
    if (query.minPrize) {
      where.prizePool = { gte: Number(query.minPrize) };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { shortDescription: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { industry: { contains: query.search, mode: 'insensitive' } },
        { company: { name: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    const total = await prisma.challenge.count({ where });
    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, logo: true, slug: true } },
        skills: { include: { skill: true } }
      },
      orderBy: query.sortBy === 'deadline' ? { submissionDeadline: 'asc' } : query.sortBy === 'prize' ? { prizePool: 'desc' } : { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit
    });

    return NextResponse.json(
      ok({
        items: challenges,
        page: query.page,
        limit: query.limit,
        total,
        hasMore: query.page * query.limit < total
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail('VALIDATION_ERROR', 'Invalid challenge query', error.flatten()), { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Failed to load challenges';
    return NextResponse.json(fail('INTERNAL_ERROR', message), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;

    if (!session || !user?.id) {
      return NextResponse.json(fail('AUTH_REQUIRED', 'Authentication required'), { status: 401 });
    }

    if (!['COMPANY', 'ADMIN'].includes(user.role ?? '')) {
      return NextResponse.json(fail('FORBIDDEN', 'Only companies and admins can create challenges'), { status: 403 });
    }

    const body = await request.json();
    const payload = challengeSchema.parse({
      ...body,
      slug: body.slug ?? makeChallengeSlug(body.title),
      status: body.status ?? 'DRAFT'
    });

    const companyMembership = await prisma.companyMember.findFirst({
      where: { userId: user.id }
    });

    if (!companyMembership && user.role !== 'ADMIN') {
      return NextResponse.json(fail('FORBIDDEN', 'No company is linked to this account'), { status: 403 });
    }

    const companyId = companyMembership?.companyId ?? body.companyId;
    if (!companyId) {
      return NextResponse.json(fail('VALIDATION_ERROR', 'companyId is required'), { status: 400 });
    }

    const challenge = await prisma.challenge.create({
      data: {
        ...payload,
        companyId,
        slug: payload.slug ?? makeChallengeSlug(payload.title),
        prizePool: Number(payload.prizePool ?? 0),
        maxTeamSize: Number(payload.maxTeamSize ?? 1),
        registrationDeadline: new Date(payload.registrationDeadline),
        submissionDeadline: new Date(payload.submissionDeadline),
        judgingDeadline: new Date(payload.judgingDeadline),
        winnerAnnouncement: new Date(payload.winnerAnnouncement),
        timeline: {
          create: payload.timeline.map((entry) => ({
            title: entry.title,
            date: new Date(entry.date),
            description: entry.description ?? null
          }))
        }
      },
      include: {
        company: { select: { id: true, name: true, logo: true, slug: true } },
        skills: { include: { skill: true } },
        timeline: true
      }
    });

    return NextResponse.json(ok(challenge, 'Challenge created successfully'), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail('VALIDATION_ERROR', 'Invalid challenge payload', error.flatten()), { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Failed to create challenge';
    return NextResponse.json(fail('INTERNAL_ERROR', message), { status: 500 });
  }
}

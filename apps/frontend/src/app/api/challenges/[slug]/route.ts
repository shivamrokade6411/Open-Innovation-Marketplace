/*
 * Purpose: Next.js API Route Handlers for querying single challenges by slug.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { fail, ok } from '../../../../lib/api/response';

const slugParamSchema = z.object({ slug: z.string().trim().min(1, 'Slug is required') });

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = slugParamSchema.parse(params);

    const challenge = await prisma.challenge.findUnique({
      where: { slug },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            website: true,
            slug: true,
            verified: true
          }
        },
        timeline: { orderBy: { date: 'asc' } },
        prizes: { orderBy: { place: 'asc' } },
        skills: { include: { skill: true } }
      }
    });

    if (!challenge) {
      return NextResponse.json(fail('NOT_FOUND', 'Challenge not found'), { status: 404 });
    }

    return NextResponse.json(ok(challenge, 'Challenge retrieved successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail('VALIDATION_ERROR', 'Invalid challenge slug', error.flatten()), { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Failed to load challenge';
    return NextResponse.json(fail('INTERNAL_ERROR', message), { status: 500 });
  }
}

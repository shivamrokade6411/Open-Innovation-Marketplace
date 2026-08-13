/*
 * Purpose: Next.js API Route Handlers for querying and posting challenges.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const industry = searchParams.get('industry');

    const filter: any = {};
    if (status) filter.status = status;
    if (industry) filter.industry = industry;

    const challenges = await prisma.challenge.findMany({
      where: filter,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: challenges });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'COMPANY' && (session.user as any).role !== 'ADMIN')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      shortDescription, 
      description, 
      problemStatement, 
      expectedSolution,
      registrationDeadline,
      submissionDeadline,
      judgingDeadline,
      winnerAnnouncement,
      prizePool
    } = body;

    if (!title || !shortDescription || !description || !problemStatement || !expectedSolution) {
      return NextResponse.json({ success: false, message: 'Missing required challenge parameters' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const membership = await prisma.companyMember.findFirst({
      where: { userId: (session.user as any).id }
    });

    if (!membership && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'No associated company found for this user.' }, { status: 400 });
    }

    const companyId = membership?.companyId || body.companyId;

    if (!companyId) {
      return NextResponse.json({ success: false, message: 'companyId mapping is required' }, { status: 400 });
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        slug,
        shortDescription,
        description,
        problemStatement,
        expectedSolution,
        companyId,
        prizePool: parseFloat(prizePool || '0'),
        registrationDeadline: new Date(registrationDeadline),
        submissionDeadline: new Date(submissionDeadline),
        judgingDeadline: new Date(judgingDeadline),
        winnerAnnouncement: new Date(winnerAnnouncement)
      }
    });

    return NextResponse.json({ success: true, data: challenge }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

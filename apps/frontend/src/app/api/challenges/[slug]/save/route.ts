/*
 * Purpose: Next.js API Route Handler to toggle saving/bookmarking challenges.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const slug = params.slug;

    const challenge = await prisma.challenge.findUnique({
      where: { slug }
    });

    if (!challenge) {
      return NextResponse.json({ success: false, message: 'Challenge not found' }, { status: 404 });
    }

    const existingSave = await prisma.savedChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId: challenge.id
        }
      }
    });

    if (existingSave) {
      await prisma.savedChallenge.delete({
        where: {
          id: existingSave.id
        }
      });
      return NextResponse.json({ success: true, saved: false, message: 'Challenge unsaved successfully' });
    } else {
      await prisma.savedChallenge.create({
        data: {
          userId,
          challengeId: challenge.id
        }
      });
      return NextResponse.json({ success: true, saved: true, message: 'Challenge saved successfully' });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ success: true, saved: false });
    }

    const userId = (session.user as any).id;
    const slug = params.slug;

    const challenge = await prisma.challenge.findUnique({
      where: { slug }
    });

    if (!challenge) {
      return NextResponse.json({ success: false, message: 'Challenge not found' }, { status: 404 });
    }

    const existingSave = await prisma.savedChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId: challenge.id
        }
      }
    });

    return NextResponse.json({ success: true, saved: !!existingSave });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

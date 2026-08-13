/*
 * Purpose: Next.js API Route Handlers for querying single challenges by slug.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    if (!slug) {
      return NextResponse.json({ success: false, message: 'Slug parameter is required' }, { status: 400 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { slug },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            website: true
          }
        },
        timeline: {
          orderBy: { date: 'asc' }
        },
        prizes: {
          orderBy: { place: 'asc' }
        },
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    if (!challenge) {
      return NextResponse.json({ success: false, message: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: challenge });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

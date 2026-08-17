/*
 * Purpose: API endpoint for updating user profile.
 * Author: GitHub Copilot
 * Date: 2026-08-17
 */

import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  bio: z.string().trim().max(280).optional().default(''),
  location: z.string().trim().max(100).optional().default(''),
  avatar: z.string().url().optional().default(''),
  skills: z.array(z.string().trim().min(1).max(40)).max(20),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    // Check if username is already taken (and it's different from current username)
    if (data.username !== currentUser.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: 'Username is already taken' },
          { status: 400 }
        );
      }
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: data.name,
        username: data.username,
        bio: data.bio || null,
        location: data.location || null,
        avatar: data.avatar || null,
        skills: data.skills,
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        twitterUrl: data.twitterUrl || null,
        portfolioUrl: data.portfolioUrl || null,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        location: true,
        skills: true,
        githubUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        portfolioUrl: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/*
 * Purpose: Public user profile page (server component).
 * Author: GitHub Copilot
 * Date: 2026-08-17
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '../../../../lib/prisma';
import { ProfileHeader } from '../../../../components/profile/ProfileHeader';
import { ProfileAbout } from '../../../../components/profile/ProfileAbout';
import { SkillsList } from '../../../../components/profile/SkillsList';
import { SocialLinks } from '../../../../components/profile/SocialLinks';
import { ProfileChallenges } from '../../../../components/profile/ProfileChallenges';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

async function getPublicUserProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      bio: true,
      location: true,
      skills: true,
      githubUrl: true,
      linkedinUrl: true,
      twitterUrl: true,
      portfolioUrl: true,
      createdAt: true,
      submissions: {
        select: {
          id: true,
          title: true,
          status: true,
          challengeId: true,
          challenge: {
            select: {
              id: true,
              title: true,
              slug: true,
              company: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return user;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const user = await getPublicUserProfile(params.username);

  if (!user) {
    return {
      title: 'Profile Not Found',
    };
  }

  return {
    title: `${user.name} (@${user.username}) | Open Innovation Marketplace`,
    description: user.bio || `${user.name}'s profile on Open Innovation Marketplace`,
    openGraph: {
      title: `${user.name} (@${user.username})`,
      description: user.bio || `Innovator profile on Open Innovation Marketplace`,
      images: user.avatar ? [{ url: user.avatar }] : [],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await getPublicUserProfile(params.username);

  if (!user) {
    notFound();
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <div className="container mx-auto px-6 py-12 md:px-12 lg:px-24">
        {/* Profile Header */}
        <ProfileHeader user={user} joinedDate={joinedDate} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-3">
          {/* Left column: About & Challenges */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <ProfileAbout user={user} />

            {/* Challenges Section */}
            <ProfileChallenges submissions={user.submissions} />
          </div>

          {/* Right column: Skills & Social Links */}
          <div className="space-y-8">
            {/* Skills Section */}
            <SkillsList skills={user.skills} />

            {/* Social Links Section */}
            <SocialLinks user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}


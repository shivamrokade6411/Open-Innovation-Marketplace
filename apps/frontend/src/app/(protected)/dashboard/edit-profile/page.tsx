/*
 * Purpose: Edit user profile page (protected).
 * Author: GitHub Copilot
 * Date: 2026-08-17
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { EditProfileForm } from '../../../../components/profile/EditProfileForm';

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
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

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-6 py-12 md:px-12 lg:px-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
            <p className="text-slate-400 mt-2">Update your public profile information</p>
          </div>

          <EditProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}

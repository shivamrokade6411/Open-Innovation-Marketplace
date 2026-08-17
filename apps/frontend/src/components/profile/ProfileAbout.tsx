/*
 * Purpose: Profile about section displaying user bio.
 * Author: GitHub Copilot
 * Date: 2026-08-17
 */

import type { User } from '@prisma/client';

interface ProfileAboutProps {
  user: Pick<User, 'bio'>;
}

export function ProfileAbout({ user }: ProfileAboutProps) {
  if (!user.bio) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white mb-4">About</h2>
      <p className="text-slate-300 leading-relaxed">
        {user.bio}
      </p>
    </div>
  );
}

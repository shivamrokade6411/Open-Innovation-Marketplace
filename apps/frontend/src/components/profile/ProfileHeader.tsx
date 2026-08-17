/*
 * Purpose: Profile header component displaying user avatar and basic info.
 * Author: GitHub Copilot
 * Date: 2026-08-17
 */

import type { User } from '@prisma/client';
import { MapPin, Calendar } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface ProfileHeaderProps {
  user: Pick<User, 'name' | 'avatar' | 'username' | 'bio' | 'location'>;
  joinedDate: string;
}

export function ProfileHeader({ user, joinedDate }: ProfileHeaderProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-r from-slate-900/50 via-purple-900/20 to-slate-900/50 p-8 sm:p-12 shadow-xl backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)]" />

      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
        {/* Avatar */}
        <div className="shrink-0">
          <Avatar
            src={user.avatar || undefined}
            name={user.name}
            size="xl"
            className="ring-2 ring-purple-500/30"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {user.name}
            </h1>
            {user.username && (
              <p className="text-sm text-slate-400">
                @{user.username}
              </p>
            )}
          </div>

          {user.bio && (
            <p className="text-slate-300 leading-relaxed max-w-2xl">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
            {user.location && (
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span>{user.location}</span>
              </div>
            )}
            <div className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>Joined {joinedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

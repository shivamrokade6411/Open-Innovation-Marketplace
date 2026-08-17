/*
 * Purpose: Profile challenges component displaying user's challenge submissions.
 * Author: GitHub Copilot
 * Date: 2026-08-17
 */

import type { Submission } from '@prisma/client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface SubmissionWithChallenge extends Submission {
  challenge: {
    id: string;
    title: string;
    slug: string;
    company: {
      name: string;
      slug: string;
    };
  } | null;
}

interface ProfileChallengesProps {
  submissions: SubmissionWithChallenge[];
}

export function ProfileChallenges({ submissions }: ProfileChallengesProps) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-4">Challenges</h2>
        <p className="text-sm text-slate-400 italic">No challenges participated in yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white mb-6">Challenges</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {submissions.map((submission) => (
          <Link
            key={submission.id}
            href={`/challenges/${submission.challenge?.slug || '#'}`}
            className="group block p-5 rounded-lg border border-white/10 bg-slate-800/50 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all"
          >
            <div className="flex flex-col justify-between h-full space-y-3">
              {/* Challenge info */}
              <div>
                <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                  {submission.challenge?.title || 'Untitled Challenge'}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {submission.challenge?.company.name || 'Unknown Company'}
                </p>
              </div>

              {/* Status and link */}
              <div className="flex items-center justify-between">
                <div className="inline-flex px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                  {submission.status === 'SUBMITTED' ? 'Submitted' : 'In Progress'}
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/*
 * Purpose: Challenge discovery page with filtering and listings.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { ChallengeCard } from '../../../components/challenges/ChallengeCard';
import type { IChallenge } from '@oim/shared';

const sampleChallenges: IChallenge[] = [
  {
    _id: '1',
    companyId: 'c1',
    title: 'AI Sustainability Scoring',
    description: 'Build a system that scores sustainability metrics for consumer products.',
    problemStatement: 'Help companies quantify environmental impact.',
    techStack: ['TypeScript', 'OpenAI', 'Next.js'],
    category: 'ai',
    difficulty: 'hard',
    prizes: { first: 25000, second: 10000, third: 5000, total: 40000 },
    deadline: new Date(Date.now() + 7 * 86400000),
    startDate: new Date(),
    status: 'active',
    tags: ['AI', 'Sustainability'],
    requirements: ['MVP', 'Documentation'],
    maxParticipants: 100,
    currentParticipants: 34,
    views: 1200,
    isRemote: true,
    attachments: [],
    aiSummary: 'Create a sustainability scoring engine.',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function ChallengesPage(): JSX.Element {
  return (
    <main className="px-4 py-12 md:px-8 lg:px-16">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-4xl font-black">Challenges</h1>
        <p className="text-slate-500">Explore open innovation opportunities across industries.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="sticky top-24 h-fit rounded-glass border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/60">
          <h2 className="font-semibold">Filters</h2>
          <p className="mt-2 text-sm text-slate-500">Category, difficulty, prize range, deadline, and remote-only support are handled by the API.</p>
        </aside>
        <section>
          <div className="mb-4 text-sm text-slate-500">Showing {sampleChallenges.length} results</div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sampleChallenges.map((challenge) => (
              <ChallengeCard key={challenge._id} challenge={challenge} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

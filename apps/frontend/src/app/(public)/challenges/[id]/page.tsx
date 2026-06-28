/*
 * Purpose: Challenge detail page.
 * Author: Copilot
 * Date: 2026-06-28
 */

import Link from 'next/link';
import type { IChallenge } from '@oim/shared';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';

const challenge: IChallenge = {
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
};

export default function ChallengeDetailPage(): JSX.Element {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: challenge.title,
    description: challenge.description,
    dateCreated: challenge.createdAt.toISOString(),
    deadline: challenge.deadline.toISOString()
  };

  return (
    <main className="px-4 py-12 md:px-8 lg:px-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <Card variant="glass">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-brand-primary/15 px-3 py-1 text-brand-primary">{challenge.category}</span>
              <span>{challenge.difficulty}</span>
              <span>Remote</span>
            </div>
            <h1 className="mt-4 text-4xl font-black">{challenge.title}</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">{challenge.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild><Link href={`/challenges/${challenge._id}/submit`}>Submit Solution</Link></Button>
              <Button variant="outline">Share</Button>
            </div>
          </Card>
          <Card variant="glass">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold">Overview</h2>
                <p className="mt-2 text-sm text-slate-500">{challenge.aiSummary}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Requirements</h2>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-500">
                  {challenge.requirements.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </Card>
        </div>
        <aside className="space-y-6">
          <Card variant="glass">
            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Prize breakdown</div>
            <div className="mt-3 text-2xl font-black">${challenge.prizes.total?.toLocaleString()}</div>
            <div className="mt-4 space-y-2 text-sm text-slate-500">
              <div>First: ${challenge.prizes.first?.toLocaleString()}</div>
              <div>Second: ${challenge.prizes.second?.toLocaleString()}</div>
              <div>Third: ${challenge.prizes.third?.toLocaleString()}</div>
            </div>
          </Card>
          <Card variant="glass">
            <h3 className="font-semibold">Tech stack</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {challenge.techStack.map((stack) => <span key={stack} className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">{stack}</span>)}
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
}

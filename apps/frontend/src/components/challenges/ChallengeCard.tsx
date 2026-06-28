/*
 * Purpose: Challenge summary card for public listings.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cardHover } from '../../lib/animations';
import type { IChallenge } from '@oim/shared';

export interface ChallengeCardProps {
  challenge: IChallenge;
  bookmarked?: boolean;
}

/**
 * Render a featured challenge card.
 * @param props Challenge data and bookmark state.
 * @returns A clickable card.
 * @throws Never throws.
 */
export function ChallengeCard({ challenge }: ChallengeCardProps): JSX.Element {
  const prize = challenge.prizes.total ?? 0;
  const deadline = new Date(challenge.deadline).toLocaleDateString();
  const progress = Math.min(100, challenge.maxParticipants ? (challenge.currentParticipants / challenge.maxParticipants) * 100 : 0);

  return (
    <motion.div variants={cardHover} initial="rest" whileHover="hover" animate="rest">
      <Card variant="glass" hover>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-brand-primary/15 px-3 py-1 text-xs font-semibold text-brand-primary">{challenge.category}</span>
            <h3 className="mt-3 text-xl font-semibold">{challenge.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{challenge.description}</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary px-4 py-3 text-right text-white">
            <div className="text-xs uppercase tracking-[0.2em] opacity-80">Prize Pool</div>
            <div className="text-lg font-bold">${prize.toLocaleString()}</div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{challenge.difficulty}</span>
          <span>•</span>
          <span>Deadline {deadline}</span>
          <span>•</span>
          <span>{challenge.currentParticipants}/{challenge.maxParticipants || '∞'} participants</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {challenge.techStack.slice(0, 3).map((stack) => (
              <span key={stack} className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">{stack}</span>
            ))}
          </div>
          <Button asChild>
            <Link href={`/challenges/${challenge._id}`}>View</Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

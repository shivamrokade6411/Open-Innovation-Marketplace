'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cardHover } from '../../lib/animations';
import { cn } from '../../lib/utils';
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
  const progress = Math.min(
    100,
    challenge.maxParticipants ? (challenge.currentParticipants / challenge.maxParticipants) * 100 : 0
  );

  const progressColor =
    progress > 85
      ? 'from-rose-500 to-red-600'
      : progress > 50
      ? 'from-amber-500 to-yellow-600'
      : 'from-emerald-500 to-green-600';

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 border border-emerald-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 border border-amber-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 border border-rose-500/20';
      case 'expert':
        return 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 border border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 dark:bg-slate-500/20 border border-slate-500/20';
    }
  };

  return (
    <motion.div variants={cardHover} initial="rest" whileHover="hover" animate="rest" className="h-full">
      <Card
        variant="glass"
        hover
        className="h-full flex flex-col justify-between hover:scale-[1.02] hover:border-brand-primary/30 transition-all duration-300"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="inline-flex rounded-full bg-brand-primary/15 px-3 py-1 text-xs font-semibold text-brand-primary capitalize">
                {challenge.category}
              </span>
              <h3 className="mt-3 text-xl font-semibold line-clamp-2 min-h-[3.5rem] flex items-center text-slate-900 dark:text-white">
                {challenge.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                {challenge.description}
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary px-4 py-3 text-right text-white min-w-[110px] w-[110px] h-[72px] flex flex-col justify-center items-end shrink-0">
              <div className="text-[10px] uppercase tracking-[0.1em] opacity-80 leading-none">Prize Pool</div>
              <div className="text-base font-black mt-1 leading-none">${prize.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className={cn('px-2 py-0.5 rounded-full font-semibold capitalize text-[10px]', getDifficultyColor(challenge.difficulty))}>
              {challenge.difficulty}
            </span>
            <span>•</span>
            <span>Deadline {deadline}</span>
            <span>•</span>
            <span>
              {challenge.currentParticipants}/{challenge.maxParticipants || '∞'} participants
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', progressColor)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {challenge.techStack.slice(0, 3).map((stack) => (
              <span
                key={stack}
                className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-white/5 truncate max-w-[80px]"
                title={stack}
              >
                {stack}
              </span>
            ))}
          </div>
          <Button asChild className="shrink-0">
            <Link href={`/challenges/${challenge._id}`}>View</Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

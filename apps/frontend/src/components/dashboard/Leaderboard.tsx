'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus, Medal } from 'lucide-react';
import { leaderboardData, type LeaderboardEntry } from '../../lib/mockData';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Skeleton } from '../ui/Skeleton';

const fetchLeaderboardMock = async (): Promise<LeaderboardEntry[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(leaderboardData);
    }, 1000);
  });
};

export function Leaderboard(): JSX.Element {
  const { data: entries = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboardMock,
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="text-xs font-mono font-bold text-slate-450 dark:text-slate-500">#{rank}</span>;
  };

  const getRankHighlight = (rank: number) => {
    if (rank === 1) return 'border-amber-400/50 bg-amber-500/5 dark:bg-amber-400/5';
    if (rank === 2) return 'border-slate-350 bg-slate-400/5 dark:bg-slate-300/5';
    if (rank === 3) return 'border-orange-400/50 bg-orange-500/5 dark:bg-orange-400/5';
    return 'border-transparent';
  };

  const getTrendIcon = (change: 'up' | 'down' | 'flat') => {
    switch (change) {
      case 'up':
        return (
          <motion.div
            animate={{ y: [2, -2, 2] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex items-center gap-0.5 text-success font-bold text-[10px]"
          >
            <ArrowUp className="h-3 w-3" />
          </motion.div>
        );
      case 'down':
        return (
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex items-center gap-0.5 text-danger font-bold text-[10px]"
          >
            <ArrowDown className="h-3 w-3" />
          </motion.div>
        );
      case 'flat':
      default:
        return <Minus className="h-3 w-3 text-slate-400 dark:text-slate-500" />;
    }
  };

  return (
    <Card variant="glass" className="space-y-6 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase font-mono">
          Top Performers
        </h2>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
          Top innovators based on innovation score
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-205/30 dark:border-white/5 animate-pulse">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))
        ) : (
          entries.map((entry, idx) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${getRankHighlight(
                entry.rank
              )} border-slate-200/60 dark:border-white/5 bg-slate-50/30 dark:bg-slate-900/10`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-6 text-center shrink-0 flex items-center justify-center">
                  {getRankBadge(entry.rank)}
                </div>
                <Avatar src={entry.avatar} name={entry.name} size="sm" />
                <span className="font-bold text-sm text-slate-850 dark:text-slate-200 truncate">
                  {entry.name}
                </span>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {entry.score} pts
                </span>
                <div className="w-4 flex justify-center">
                  {getTrendIcon(entry.change)}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}

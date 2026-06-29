'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ value, max = 100, className, barClassName }: ProgressBarProps): JSX.Element {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={cn('h-full rounded-full bg-gradient-to-r from-primary to-secondary', barClassName)}
      />
    </div>
  );
}

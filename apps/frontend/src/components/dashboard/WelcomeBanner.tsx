'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../ui/Button';

export function WelcomeBanner(): JSX.Element {
  const user = useSelector((state: RootState) => state.auth.user) || { name: 'Shivam Rokade' };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    // Current date from meta or local machine
    return new Date('2026-06-29').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent p-6 md:p-8 text-white shadow-xl shadow-primary/15 border border-white/10"
    >
      {/* Dynamic background rings */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute right-20 bottom-0 h-28 w-28 rounded-full bg-white/5 blur-xl" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300/10" />
            Platform Update
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {getGreeting()}, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-sm font-medium text-slate-100/90 leading-relaxed max-w-lg">
            Welcome back to the command center. Here is your platform overview for today, <span className="font-bold underline decoration-amber-400 decoration-2">{getFormattedDate()}</span>. Keep building something amazing!
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Button
            variant="outline"
            size="md"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 text-xs font-bold uppercase tracking-wider h-11"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Platform Docs
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="bg-white text-slate-900 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider h-11 shadow-md shadow-black/10"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Challenge
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

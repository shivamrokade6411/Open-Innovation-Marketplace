'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle(): JSX.Element | null {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-surface-card-dark animate-pulse" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-surface-card-dark text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ y: -10, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 10, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="absolute"
        >
          {isDark ? (
            <Moon className="h-5 w-5 text-indigo-400 fill-indigo-400/20" />
          ) : (
            <Sun className="h-5 w-5 text-amber-500 fill-amber-500/20" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

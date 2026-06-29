/*
 * Purpose: Top navigation bar.
 * Author: Copilot
 * Date: 2026-06-28
 */

import Link from 'next/link';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Navbar(): JSX.Element {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-white/5 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
          Open Innovation Marketplace
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden gap-8 md:flex items-center">
            <Link href="/challenges" className="text-sm font-medium text-slate-600 hover:text-indigo-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors">
              Challenges
            </Link>
            <Link href="/companies" className="text-sm font-medium text-slate-600 hover:text-indigo-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors">
              Companies
            </Link>
            <Link href="/blog" className="text-sm font-medium text-slate-600 hover:text-indigo-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors">
              Blog
            </Link>
          </nav>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

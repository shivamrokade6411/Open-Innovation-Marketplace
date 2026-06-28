/*
 * Purpose: Top navigation bar.
 * Author: Copilot
 * Date: 2026-06-28
 */

import Link from 'next/link';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Navbar(): JSX.Element {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="font-black tracking-tight">Open Innovation Marketplace</Link>
        <nav className="hidden gap-6 md:flex">
          <Link href="/challenges">Challenges</Link>
          <Link href="/companies">Companies</Link>
          <Link href="/blog">Blog</Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

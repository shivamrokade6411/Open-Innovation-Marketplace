/*
 * Purpose: Beautiful, high-end redesign of the Marketplace public home page.
 * Author: Antigravity
 * Date: 2026-06-29
 */

import Link from 'next/link';
import { Card } from '../../components/ui/Card';
import { Rocket, Trophy, Users, Briefcase, Sparkles, MessageSquare, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

const stats = [
  { label: 'Active Innovators', value: '48K+', icon: Users, color: 'text-indigo-400' },
  { label: 'Global Challenges', value: '1.2K+', icon: Trophy, color: 'text-amber-400' },
  { label: 'Prizes Awarded', value: '$4.8M', icon: Sparkles, color: 'text-cyan-400' },
  { label: 'Enterprise Partners', value: '860+', icon: Briefcase, color: 'text-purple-400' }
];

const highlights = [
  {
    title: 'Live Submissions tracker',
    description: 'Track innovation progress in real-time. Review prototypes, code sandboxes, and active submissions immediately.',
    icon: Rocket,
    tag: 'Real-Time'
  },
  {
    title: 'Expert Mentor Feedback',
    description: 'Connect innovators with industry pioneers. Get structured feedback loops and scale prototypes into production.',
    icon: MessageSquare,
    tag: 'Collaboration'
  },
  {
    title: 'Automated AI Grading',
    description: 'Bypass manual filters. Automatically score submissions based on code quality, uniqueness, and security compliance.',
    icon: Zap,
    tag: 'AI-Powered'
  },
  {
    title: 'Verified Certificates & Rewards',
    description: 'Secure, cryptographic certificates of achievement and direct, transparent reward payouts.',
    icon: ShieldCheck,
    tag: 'Blockchain'
  }
];

export default function HomePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-[#020d1f] text-white">
      <header className="border-b border-[#1a2c45] bg-[#020d1f]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="text-4xl font-extrabold tracking-[-0.04em] text-transparent bg-gradient-to-r from-[#67d6ff] via-[#7d9af7] to-[#c17cff] bg-clip-text">
            Open Innovation Marketplace
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-8 text-lg text-slate-200 md:flex">
              <Link href="/challenges" className="transition hover:text-white">Challenges</Link>
              <Link href="/companies" className="transition hover:text-white">Companies</Link>
              <Link href="/blog" className="transition hover:text-white">Blog</Link>
            </div>

            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#1a2c45] bg-[#0b1d2d] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-[#2e4d76] hover:text-white"
              aria-label="Toggle theme"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <Link href="/login" className="rounded-xl border border-[#1a2c45] bg-[#0b1d2d] px-5 py-3 text-xl font-medium text-slate-200 transition hover:border-[#2e4d76] hover:text-white">
              Log In
            </Link>

            <Link href="/register" className="rounded-xl bg-gradient-to-r from-[#5e7bf9] via-[#6d80f9] to-[#a36de9] px-5 py-3 text-xl font-semibold text-white shadow-[0_8px_24px_rgba(108,92,231,0.4)] transition hover:brightness-110">
              Sign Up
            </Link>
          </div>
        </div>
      </header>
    </main>
  );
}


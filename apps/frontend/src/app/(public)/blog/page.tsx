/*
 * Purpose: Beautifully redesigned Blog page with gradient hero headers and background glow.
 * Author: Antigravity Pair Programmer
 * Date: 2026-07-10
 */

import type { Metadata } from 'next';
import { BlogList } from '../../../components/blog/BlogList';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - Open Innovation Marketplace',
  description: 'Read the latest trends, guides, and articles about open innovation challenges and tech ecosystem shifts.'
};

export default function BlogPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white overflow-hidden pb-24">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[10%] w-[350px] h-[350px] rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute top-[15%] left-[60%] w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-[140px]" />
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-20">
        
        {/* HEADER SECTION */}
        <section className="relative pt-12 pb-16 flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 mb-6 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Open Innovation Insights</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            The{' '}
            <span className="bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Innovation Journal
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base md:text-lg text-slate-400 font-light leading-relaxed">
            Discover the latest perspectives on open-source bounties, developer ecosystems, AI-powered evaluation, and decentralized collaboration models.
          </p>
        </section>

        {/* BLOG LIST SECTION */}
        <section className="mt-8">
          <BlogList />
        </section>

      </main>
    </div>
  );
}

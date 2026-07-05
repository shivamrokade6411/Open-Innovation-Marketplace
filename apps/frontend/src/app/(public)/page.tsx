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
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white overflow-hidden pb-24">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-purple-600/30 blur-[120px]" />
        <div className="absolute top-[20%] left-[50%] w-[400px] h-[400px] rounded-full bg-cyan-500/20 blur-[130px]" />
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Announcement badge */}
          <Link
            href="/challenges/1"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/35 transition duration-300 text-xs md:text-sm text-slate-300 mb-8 cursor-pointer shadow-inner backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>New challenge: <strong className="text-white font-semibold">AI-powered sustainability scoring</strong></span>
            <ArrowRight className="h-3 w-3 text-cyan-400" />
          </Link>

          {/* Large centered headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            Where Innovation <br />
            <span className="bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Meets Opportunity
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-8 text-lg md:text-xl text-slate-400 font-light max-w-2xl leading-relaxed">
            Discover global challenges, collaborate in real time with top talent, and transform prototypes into prizes, contracts, and careers.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/35 transition duration-300 group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/challenges"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition duration-300"
            >
              Browse Challenges
            </Link>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-12 border-y border-white/5 bg-white/[0.01] rounded-3xl backdrop-blur-sm px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {stats.map((entry, index) => (
              <div 
                key={entry.label} 
                className={`flex flex-col items-center text-center p-4 ${index > 1 ? 'pt-8 md:pt-4' : ''} ${index % 2 === 0 ? 'pr-2' : 'pl-2'}`}
              >
                <div className={`p-2 rounded-xl bg-white/5 ${entry.color} mb-3`}>
                  <entry.icon className="h-6 w-6" />
                </div>
                <div className="text-4xl md:text-5xl font-black tracking-tight text-white">{entry.value}</div>
                <div className="mt-2 text-sm text-slate-400 font-medium">{entry.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES/HIGHLIGHTS SECTION */}
        <section className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
              Engineered for Collaboration
            </h2>
            <p className="mt-4 text-slate-400">
              Powerful built-in tools that help companies and innovators coordinate, review, and reward submissions instantly.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, index) => (
              <Link
                key={item.title}
                href={
                  index === 0
                    ? '/features/tracker'
                    : index === 1
                      ? '/features/feedback'
                      : index === 2
                        ? '/features/grading'
                        : '/features/certificates'
                }
              >
                <Card 
                  key={item.title} 
                  variant="glass" 
                  hover 
                  className="flex flex-col h-full bg-[#121212] border-white/5 hover:border-purple-500/20 text-left transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-purple-600/20 text-purple-400 transition-colors">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/5 text-cyan-400 border border-white/5">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 font-light leading-relaxed flex-grow">{item.description}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-semibold text-purple-400">Learn more →</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

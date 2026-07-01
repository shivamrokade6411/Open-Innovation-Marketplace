'use client';

import Link from 'next/link';
import { Card } from '../../../../components/ui/Card';
import { ArrowLeft, Zap } from 'lucide-react';

export default function GradingFeaturePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-12 md:px-8 lg:px-16">
      <div className="mb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-yellow-600/20 border border-yellow-500/30">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-300 uppercase">Coming Soon</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Automated AI Grading
          </h1>
          <p className="mt-4 text-lg text-slate-400">Feature #3 - LLM-powered code quality and plagiarism scoring</p>
        </div>
      </div>
      <Card variant="glass">
        <p className="text-slate-400">This feature is being built. Check back soon!</p>
      </Card>
    </main>
  );
}

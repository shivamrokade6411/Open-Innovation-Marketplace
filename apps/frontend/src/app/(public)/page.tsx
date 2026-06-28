/*
 * Purpose: Public home page for the marketplace.
 * Author: Copilot
 * Date: 2026-06-28
 */

import Link from 'next/link';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const stats = [
  { label: 'Innovators', value: '48K+' },
  { label: 'Challenges', value: '1.2K+' },
  { label: 'Prizes Paid', value: '$4.8M' },
  { label: 'Companies', value: '860+' }
];

export default function HomePage(): JSX.Element {
  return (
    <main className="space-y-24 px-4 py-10 md:px-8 lg:px-16">
      <section className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex rounded-full bg-brand-primary/15 px-4 py-2 text-sm font-semibold text-brand-primary">Open Innovation Marketplace</span>
          <h1 className="mt-6 max-w-2xl text-5xl font-black leading-tight md:text-7xl">Where Innovation Meets Opportunity</h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300">Discover challenges, collaborate in real time, and turn prototypes into prizes, contracts, and careers.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="xl"><Link href="/register">Get started</Link></Button>
            <Button asChild size="xl" variant="outline"><Link href="/challenges">Browse challenges</Link></Button>
          </div>
        </div>
        <div className="relative rounded-glass bg-slate-900 p-8 text-white shadow-glass">
          <div className="absolute inset-0 rounded-glass bg-gradient-to-br from-brand-primary/30 to-brand-accent/20" />
          <div className="relative space-y-4">
            <div className="rounded-2xl bg-white/10 p-4">New challenge: AI-powered sustainability scoring</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 p-4">Live submissions</div>
              <div className="rounded-2xl bg-white/10 p-4">Mentor feedback</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {stats.map((entry) => (
          <Card key={entry.label} variant="glass" className="text-center">
            <div className="text-3xl font-black text-brand-primary">{entry.value}</div>
            <div className="mt-2 text-sm text-slate-500">{entry.label}</div>
          </Card>
        ))}
      </section>
    </main>
  );
}

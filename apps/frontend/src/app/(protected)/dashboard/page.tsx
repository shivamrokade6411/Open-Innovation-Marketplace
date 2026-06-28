/*
 * Purpose: Innovator dashboard page.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Card } from '../../../components/ui/Card';

const data = [
  { subject: 'Ideas', A: 90 },
  { subject: 'Delivery', A: 80 },
  { subject: 'Collaboration', A: 72 },
  { subject: 'Consistency', A: 86 },
  { subject: 'Innovation', A: 95 }
];

export default function DashboardPage(): JSX.Element {
  return (
    <main className="space-y-8 px-4 py-12 md:px-8 lg:px-16">
      <section className="grid gap-4 md:grid-cols-4">
        {['Submissions', 'Active Challenges', 'Innovation Score', 'Certificates'].map((label) => (
          <Card key={label} variant="glass"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-black">24</div></Card>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card variant="glass" className="h-96">
          <h2 className="mb-4 text-xl font-semibold">Innovation score</h2>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <Radar dataKey="A" stroke="#6366f1" fill="#06b6d4" fillOpacity={0.45} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        <Card variant="glass">
          <h2 className="text-xl font-semibold">Activity timeline</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <div>Submitted AI sustainability idea</div>
            <div>Received AI mentor feedback</div>
            <div>Earned participant certificate</div>
          </div>
        </Card>
      </section>
    </main>
  );
}

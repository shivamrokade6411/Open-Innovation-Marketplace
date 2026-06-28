/*
 * Purpose: Company dashboard page.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../../../../components/ui/Card';

const chartData = [
  { name: 'Week 1', submissions: 12 },
  { name: 'Week 2', submissions: 18 },
  { name: 'Week 3', submissions: 25 },
  { name: 'Week 4', submissions: 20 }
];

export default function CompanyDashboardPage(): JSX.Element {
  return (
    <main className="space-y-8 px-4 py-12 md:px-8 lg:px-16">
      <section className="grid gap-4 md:grid-cols-4">
        {['Active Challenges', 'Total Submissions', 'Shortlisted', 'Hires Made'].map((label) => (
          <Card key={label} variant="glass"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-black">12</div></Card>
        ))}
      </section>
      <Card variant="glass" className="h-96">
        <h2 className="mb-4 text-xl font-semibold">Submissions over time</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="submissions" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </main>
  );
}

/*
 * Purpose: Admin dashboard page.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../../../../components/ui/Card';

const signups = [
  { name: 'D1', value: 20 },
  { name: 'D2', value: 40 },
  { name: 'D3', value: 35 },
  { name: 'D4', value: 55 }
];

const revenue = [
  { name: 'Subscriptions', value: 55 },
  { name: 'Prizes', value: 30 },
  { name: 'Other', value: 15 }
];

const colors = ['#6366f1', '#06b6d4', '#8b5cf6'];

export default function AdminDashboardPage(): JSX.Element {
  return (
    <main className="space-y-8 px-4 py-12 md:px-8 lg:px-16">
      <section className="grid gap-4 md:grid-cols-5">
        {['Users', 'Companies', 'Challenges', 'Submissions', 'Revenue'].map((label) => (
          <Card key={label} variant="glass"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-black">128</div></Card>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card variant="glass" className="h-96">
          <h2 className="mb-4 text-xl font-semibold">New signups</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={signups}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card variant="glass" className="h-96">
          <h2 className="mb-4 text-xl font-semibold">Revenue breakdown</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={revenue} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                {revenue.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </section>
    </main>
  );
}

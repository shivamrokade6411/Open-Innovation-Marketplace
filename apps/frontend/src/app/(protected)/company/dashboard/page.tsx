'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../services/api';
import { Card } from '../../../../components/ui/Card';
import { Loader2 } from 'lucide-react';

const chartData = [
  { name: 'Week 1', submissions: 12 },
  { name: 'Week 2', submissions: 18 },
  { name: 'Week 3', submissions: 25 },
  { name: 'Week 4', submissions: 20 }
];

export default function CompanyDashboardPage(): JSX.Element {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['company-stats'],
    queryFn: async () => {
      const response = await api.get('/api/companies/dashboard-stats');
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <main className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </main>
    );
  }

  const values = stats || { activeChallenges: 0, totalSubmissions: 0, shortlisted: 0, hiresMade: 0 };

  const cards = [
    { label: 'Active Challenges', value: values.activeChallenges },
    { label: 'Total Submissions', value: values.totalSubmissions },
    { label: 'Shortlisted', value: values.shortlisted },
    { label: 'Hires Made', value: values.hiresMade }
  ];

  return (
    <main className="space-y-8 px-4 py-12 md:px-8 lg:px-16">
      <section className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} variant="glass">
            <div className="text-sm text-slate-500">{card.label}</div>
            <div className="mt-2 text-3xl font-black">{card.value}</div>
          </Card>
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

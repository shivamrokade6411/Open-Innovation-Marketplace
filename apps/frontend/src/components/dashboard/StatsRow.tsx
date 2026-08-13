'use client';

import { CheckSquare, Trophy, Sparkles, Award, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { StatCard } from '../ui/StatCard';

export function StatsRow(): JSX.Element {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['innovator-stats'],
    queryFn: async () => {
      const response = await api.get('/api/innovators/stats');
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-40 rounded-2xl bg-white/5 border border-white/10 animate-pulse flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  const values = stats || { totalSubmissions: 0, activeChallenges: 0, innovationScore: 0, certificates: 0 };

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Submissions"
        value={values.totalSubmissions}
        icon={CheckSquare}
        trend={values.totalSubmissions > 0 ? 100 : 0}
        sparklineData={[0, values.totalSubmissions]}
      />
      <StatCard
        label="Active Challenges"
        value={values.activeChallenges}
        icon={Trophy}
        trend={values.activeChallenges > 0 ? 100 : 0}
        sparklineData={[0, values.activeChallenges]}
      />
      <StatCard
        label="Innovation Score"
        value={values.innovationScore}
        icon={Sparkles}
        trend={values.innovationScore > 0 ? 100 : 0}
        sparklineData={[0, values.innovationScore]}
      />
      <StatCard
        label="Certificates Earned"
        value={values.certificates}
        icon={Award}
        trend={values.certificates > 0 ? 100 : 0}
        sparklineData={[0, values.certificates]}
      />
    </section>
  );
}

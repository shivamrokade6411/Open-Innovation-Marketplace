'use client';

import { Card } from '../ui/Card';
import { BarChart, type BarChartSeries } from '../ui/BarChart';
import { DonutChart } from '../ui/DonutChart';
import { userGrowthData, trafficSourceData } from '../../lib/mockData';

export function AnalyticsRow(): JSX.Element {
  const userGrowthSeries: BarChartSeries[] = [
    { key: 'newUsers', name: 'New Users', color: '#6366f1' }, // primary
    { key: 'churnedUsers', name: 'Churned Users', color: '#ef4444' } // danger
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      {/* Left: User Growth */}
      <Card variant="glass" className="space-y-6">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase font-mono">
            User Growth
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
            Monthly comparison of user acquisition vs churn
          </p>
        </div>
        <BarChart data={userGrowthData} xKey="month" series={userGrowthSeries} />
      </Card>

      {/* Right: Traffic Sources */}
      <Card variant="glass" className="space-y-6">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase font-mono">
            Traffic Sources
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
            Top channels driving platform visits
          </p>
        </div>
        <DonutChart data={trafficSourceData} />
      </Card>
    </section>
  );
}

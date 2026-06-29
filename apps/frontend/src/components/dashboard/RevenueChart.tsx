'use client';

import { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { AreaChart, type AreaChartSeries } from '../ui/AreaChart';
import { revenueData } from '../../lib/mockData';
import { cn } from '../../lib/utils';

export function RevenueChart(): JSX.Element {
  const [range, setRange] = useState<'7D' | '1M' | '3M' | '1Y'>('1Y');

  // Filter or mock data based on range
  const chartData = useMemo(() => {
    switch (range) {
      case '7D':
        return [
          { month: 'Mon', revenue: 24000, target: 25000 },
          { month: 'Tue', revenue: 26000, target: 25500 },
          { month: 'Wed', revenue: 25000, target: 26000 },
          { month: 'Thu', revenue: 28500, target: 26500 },
          { month: 'Fri', revenue: 29000, target: 27000 },
          { month: 'Sat', revenue: 31000, target: 27500 },
          { month: 'Sun', revenue: 32500, target: 28000 }
        ];
      case '1M':
        return [
          { month: 'Week 1', revenue: 88000, target: 90000 },
          { month: 'Week 2', revenue: 92000, target: 92000 },
          { month: 'Week 3', revenue: 104000, target: 95000 },
          { month: 'Week 4', revenue: 124500, target: 122000 }
        ];
      case '3M':
        return revenueData.slice(-3);
      case '1Y':
      default:
        return revenueData;
    }
  }, [range]);

  const series: AreaChartSeries[] = [
    { key: 'revenue', name: 'Revenue', strokeColor: '#6366f1', fillColor: '#6366f1' },
    { key: 'target', name: 'Target', strokeColor: '#06b6d4', fillColor: '#06b6d4' }
  ];

  return (
    <Card variant="glass" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase font-mono">
            Revenue Performance
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
            Compare monthly revenue figures against targets
          </p>
        </div>

        {/* Time range toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-1 shrink-0 w-fit self-start">
          {(['7D', '1M', '3M', '1Y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all',
                range === r
                  ? 'bg-white dark:bg-surface-card-dark text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <AreaChart data={chartData} xKey="month" series={series} />
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export interface BarChartSeries {
  key: string;
  name: string;
  color: string;
}

export interface BarChartProps {
  data: any[];
  xKey: string;
  series: BarChartSeries[];
  height?: number;
}

export function BarChart({ data, xKey, series, height = 300 }: BarChartProps): JSX.Element {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ height }} className="w-full flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 animate-pulse rounded-2xl border border-slate-200/50 dark:border-white/5">
        <span className="text-sm font-semibold text-slate-400">Loading charts...</span>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-3.5 shadow-2xl text-xs font-semibold">
          <p className="mb-1.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-350">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill || entry.color }} />
                  {entry.name}
                </span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">
                  {entry.value.toLocaleString()} users
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.08)" />
          <XAxis
            dataKey={xKey}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
            fontWeight="600"
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            fontWeight="600"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            content={({ payload }) => (
              <div className="flex justify-end gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
                {payload?.map((entry: any, index: number) => (
                  <span key={index} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.value}
                  </span>
                ))}
              </div>
            )}
          />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              animationBegin={200}
              animationDuration={1200}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

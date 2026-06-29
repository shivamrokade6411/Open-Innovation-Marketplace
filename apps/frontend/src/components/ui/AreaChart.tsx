'use client';

import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export interface AreaChartSeries {
  key: string;
  name: string;
  strokeColor: string;
  fillColor: string;
}

export interface AreaChartProps {
  data: any[];
  xKey: string;
  series: AreaChartSeries[];
  height?: number;
}

export function AreaChart({ data, xKey, series, height = 300 }: AreaChartProps): JSX.Element {
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

  // Custom tooltips with currency formatting
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-3.5 shadow-2xl text-xs font-semibold">
          <p className="mb-1.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-350">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.color }} />
                  {entry.name}
                </span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(entry.value)}
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
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {series.map((s, index) => (
              <linearGradient key={index} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.fillColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={s.fillColor} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>
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
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99, 102, 241, 0.15)', strokeWidth: 1.5 }} />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.strokeColor}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#gradient-${s.key})`}
              animationBegin={100}
              animationDuration={1500}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

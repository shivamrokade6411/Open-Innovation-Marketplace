'use client';

import { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Sector } from 'recharts';

export interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutChartData[];
  height?: number;
}

export function DonutChart({ data, height = 300 }: DonutChartProps): JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.3}
        />
      </g>
    );
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const percent = ((entry.value / total) * 100).toFixed(1);
      return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-3.5 shadow-2xl text-xs font-semibold">
          <div className="flex items-center gap-1.5 font-bold mb-0.5 text-slate-900 dark:text-white">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.payload.color }} />
            {entry.name}
          </div>
          <p className="text-slate-500 font-mono">
            {entry.value.toLocaleString()} ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height }} className="relative w-full">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-black text-slate-800 dark:text-white font-mono leading-none">
          {total.toLocaleString()}
        </span>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
          Total Visits
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            activeIndex={activeIndex ?? undefined}
            activeShape={renderActiveShape}
            animationBegin={300}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

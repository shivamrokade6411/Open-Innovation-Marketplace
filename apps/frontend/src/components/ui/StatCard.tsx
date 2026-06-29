'use client';

import { useEffect, useRef, type ComponentType } from 'react';
import { animate, motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  trend: number;
  sparklineData?: number[];
  isCurrency?: boolean;
  isPercentage?: boolean;
  variant?: 'default' | 'glass';
}

function CountUp({ value, duration = 1.5, isCurrency = false, isPercentage = false }: { value: number; duration?: number; isCurrency?: boolean; isPercentage?: boolean }) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate(val) {
        if (isCurrency) {
          node.textContent = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
          }).format(val);
        } else if (isPercentage) {
          node.textContent = val.toFixed(1) + '%';
        } else {
          node.textContent = Math.round(val).toLocaleString();
        }
      }
    });

    return () => controls.stop();
  }, [value, duration, isCurrency, isPercentage]);

  return <span ref={nodeRef} className="font-mono">0</span>;
}

function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  if (!data || data.length === 0) return null;
  const width = 80;
  const height = 30;
  const padding = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data
    .map((val, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((val - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#10b981' : '#ef4444'; // success vs danger

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  sparklineData = [10, 15, 8, 12, 18, 14, 22],
  isCurrency = false,
  isPercentage = false,
  variant = 'glass'
}: StatCardProps): JSX.Element {
  const isPositive = trend >= 0;

  return (
    <Card variant={variant} hover className="relative flex flex-col justify-between overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            <CountUp value={value} isCurrency={isCurrency} isPercentage={isPercentage} />
          </h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground border border-primary/5">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <div
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold border',
            isPositive
              ? 'bg-success/10 text-success border-success/10'
              : 'bg-danger/10 text-danger border-danger/10'
          )}
        >
          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          <span>{Math.abs(trend)}%</span>
        </div>
        <Sparkline data={sparklineData} isPositive={isPositive} />
      </div>
    </Card>
  );
}

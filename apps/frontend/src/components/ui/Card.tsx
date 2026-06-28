/*
 * Purpose: Glassmorphism card primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  hover?: boolean;
  children: ReactNode;
}

/**
 * Render a themed card container.
 * @param props Card properties.
 * @returns A card element.
 * @throws Never throws.
 */
export function Card({ className, variant = 'default', hover = false, children, ...props }: CardProps): JSX.Element {
  const variantClasses = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
    glass: 'bg-surface-glass backdrop-blur-xl border border-white/10 shadow-glass',
    elevated: 'bg-white dark:bg-slate-900 shadow-xl border border-transparent',
    bordered: 'bg-transparent border border-slate-300 dark:border-slate-700'
  }[variant];

  return (
    <div className={cn('rounded-glass p-6 transition-all duration-300', variantClasses, hover && 'hover:-translate-y-1 hover:shadow-glow', className)} {...props}>
      {children}
    </div>
  );
}

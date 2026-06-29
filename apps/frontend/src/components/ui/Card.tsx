import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
  hover?: boolean;
  children: ReactNode;
}

export function Card({ className, variant = 'default', hover = false, children, ...props }: CardProps): JSX.Element {
  const variantClasses = {
    default: 'bg-white dark:bg-surface-card-dark border border-slate-200/80 dark:border-white/5 shadow-md shadow-slate-100/40 dark:shadow-2xl dark:shadow-slate-950/20',
    glass: 'bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg',
    bordered: 'bg-transparent border border-slate-200 dark:border-slate-800'
  }[variant];

  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variantClasses,
        hover && 'hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-black/30 hover:border-slate-300 dark:hover:border-white/15',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

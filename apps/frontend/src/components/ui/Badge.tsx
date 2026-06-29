import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  children: ReactNode;
}

export function Badge({ className, variant = 'gray', children, ...props }: BadgeProps): JSX.Element {
  const variantClasses = {
    primary: 'bg-primary/20 text-primary dark:bg-primary/30',
    secondary: 'bg-secondary/20 text-secondary dark:bg-secondary/30',
    accent: 'bg-accent/20 text-accent dark:bg-accent/30',
    success: 'bg-success/20 text-success dark:bg-success/30',
    warning: 'bg-warning/20 text-warning dark:bg-warning/30',
    danger: 'bg-danger/20 text-danger dark:bg-danger/30',
    info: 'bg-blue-500/20 text-blue-500 dark:bg-blue-500/30',
    gray: 'bg-slate-500/20 text-slate-600 dark:text-slate-300 dark:bg-slate-500/30'
  }[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors duration-150',
        variantClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

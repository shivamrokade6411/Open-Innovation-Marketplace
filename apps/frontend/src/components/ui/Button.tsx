'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, leftIcon, rightIcon, asChild = false, children, disabled, ...props }, ref) => {
    const variantClasses = {
      primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-95 shadow-lg shadow-primary/20 hover:shadow-primary/30 border border-transparent',
      secondary: 'bg-slate-100 dark:bg-surface-card-dark text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800',
      ghost: 'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850',
      danger: 'bg-danger text-white hover:bg-danger/90 border border-transparent',
      outline: 'border border-slate-300 bg-transparent text-slate-900 dark:border-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }[variant];

    const sizeClasses = {
      sm: 'h-9 px-3 text-xs rounded-lg',
      md: 'h-11 px-5 text-sm rounded-xl',
      lg: 'h-12 px-6 text-base rounded-xl',
      xl: 'h-14 px-8 text-lg rounded-2xl'
    }[size];

    if (asChild) {
      return (
        <span className={cn('inline-flex', className)}>
          {children}
        </span>
      );
    }

    return (
      <motion.button
        ref={ref as any}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 shrink-0 select-none',
          variantClasses,
          sizeClasses,
          className
        )}
        disabled={disabled || loading}
        {...props as any}
      >
        {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : leftIcon}
        <span>{children}</span>
        {!loading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

/*
 * Purpose: Button primitive with loading and icon support.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  gradientBorder?: boolean;
  asChild?: boolean;
}

/**
 * Render a styled button.
 * @param props Button properties.
 * @returns A button element.
 * @throws Never throws.
 */
export function Button({ className, variant = 'primary', size = 'md', loading = false, leftIcon, rightIcon, gradientBorder = false, asChild = false, children, disabled, ...props }: ButtonProps): JSX.Element {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white',
    secondary: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
    ghost: 'bg-transparent text-slate-700 dark:text-slate-200',
    danger: 'bg-red-600 text-white',
    outline: 'border border-slate-300 bg-transparent text-slate-900 dark:border-slate-700 dark:text-white'
  }[variant];

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
    xl: 'h-14 px-8 text-lg'
  }[size];

  if (asChild) {
    return (
      <span className={cn('inline-flex', className)}>{children}</span>
    );
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-accent disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses,
        sizeClasses,
        gradientBorder && 'border border-transparent bg-clip-padding shadow-glow',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}

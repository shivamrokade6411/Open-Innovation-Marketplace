/*
 * Purpose: Input primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return <input className={cn('h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-4 outline-none dark:border-slate-800 dark:bg-slate-900', className)} {...props} />;
}

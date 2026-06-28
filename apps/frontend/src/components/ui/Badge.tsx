/*
 * Purpose: Badge primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>): JSX.Element {
  return <span className={cn('inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium dark:bg-slate-800', className)} {...props} />;
}

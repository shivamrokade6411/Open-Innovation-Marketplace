/*
 * Purpose: Progress bar primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

export function ProgressBar({ value }: { value: number }): JSX.Element {
  return <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent" style={{ width: `${value}%` }} /></div>;
}

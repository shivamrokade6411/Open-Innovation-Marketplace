/*
 * Purpose: Toast placeholder primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

export function Toast({ message }: { message: string }): JSX.Element {
  return <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">{message}</div>;
}

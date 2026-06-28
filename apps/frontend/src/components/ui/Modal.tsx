/*
 * Purpose: Modal primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { ReactNode } from 'react';

export function Modal({ open, title, children }: { open: boolean; title: string; children: ReactNode }): JSX.Element | null {
  if (!open) {
    return null;
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-slate-950"><h2 className="text-xl font-bold">{title}</h2>{children}</div></div>;
}

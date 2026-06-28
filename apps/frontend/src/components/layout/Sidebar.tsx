/*
 * Purpose: Dashboard sidebar navigation.
 * Author: Copilot
 * Date: 2026-06-28
 */

import Link from 'next/link';

export function Sidebar(): JSX.Element {
  return (
    <aside className="space-y-3 rounded-glass border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/messages">Messages</Link>
      <Link href="/certificates">Certificates</Link>
    </aside>
  );
}

/*
 * Purpose: Protected dashboard layout wrapper.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function DashboardLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div>
      <Navbar />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[260px_1fr] md:px-8">
        <Sidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}

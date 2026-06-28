/*
 * Purpose: Protected route group layout.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { ReactNode } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export default function ProtectedLayout({ children }: { children: ReactNode }): JSX.Element {
  return <DashboardLayout>{children}</DashboardLayout>;
}

/*
 * Purpose: Participant Dashboard dynamic entry point.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import nextDynamic from 'next/dynamic';

const DashboardPage = nextDynamic(() => import('./DashboardPage'), {
  ssr: false
});

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  return <DashboardPage />;
}

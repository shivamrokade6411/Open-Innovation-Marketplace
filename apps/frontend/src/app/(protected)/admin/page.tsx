/*
 * Purpose: Platform administration center dynamic entry point.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import nextDynamic from 'next/dynamic';

const AdminPanelPage = nextDynamic(() => import('./AdminPanelPage'), {
  ssr: false
});

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return <AdminPanelPage />;
}

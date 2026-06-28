/*
 * Purpose: Mobile navigation drawer.
 * Author: Copilot
 * Date: 2026-06-28
 */

import Link from 'next/link';

export function MobileNav(): JSX.Element {
  return <nav className="md:hidden"><Link href="/dashboard">Menu</Link></nav>;
}

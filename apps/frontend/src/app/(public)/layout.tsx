/*
 * Purpose: Public route group layout.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { ReactNode } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export default function PublicLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

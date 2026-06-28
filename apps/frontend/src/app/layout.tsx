/*
 * Purpose: Global application layout.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Open Innovation Marketplace',
  description: 'A SaaS platform for innovation challenges, submissions, and rewards.'
};

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

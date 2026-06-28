/*
 * Purpose: Application providers for Redux and theme state.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { store } from '../store';

export function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </Provider>
  );
}

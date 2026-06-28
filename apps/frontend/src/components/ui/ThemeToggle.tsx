/*
 * Purpose: Theme toggle placeholder for next-themes integration.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import { useTheme } from 'next-themes';
import { Button } from './Button';

export function ThemeToggle(): JSX.Element {
  const { theme, setTheme } = useTheme();
  return <Button variant="outline" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Theme</Button>;
}

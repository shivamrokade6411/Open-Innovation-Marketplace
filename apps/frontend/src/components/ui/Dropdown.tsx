/*
 * Purpose: Dropdown primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { ReactNode } from 'react';

export function Dropdown({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return <details className="relative"><summary>{label}</summary><div>{children}</div></details>;
}

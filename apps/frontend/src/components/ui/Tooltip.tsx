/*
 * Purpose: Tooltip wrapper primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { ReactNode } from 'react';

export function Tooltip({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return <span title={label}>{children}</span>;
}

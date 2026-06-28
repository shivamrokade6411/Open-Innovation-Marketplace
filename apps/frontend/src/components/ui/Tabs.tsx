/*
 * Purpose: Tabs primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { ReactNode } from 'react';

export function Tabs({ tabs }: { tabs: Array<{ label: string; content: ReactNode }> }): JSX.Element {
  return <div>{tabs.map((tab) => <section key={tab.label}><h3 className="font-semibold">{tab.label}</h3>{tab.content}</section>)}</div>;
}

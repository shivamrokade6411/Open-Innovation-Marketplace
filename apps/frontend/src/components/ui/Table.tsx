/*
 * Purpose: Table primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { ReactNode } from 'react';

export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }): JSX.Element {
  return (
    <table className="w-full text-sm">
      <thead><tr>{headers.map((header) => <th key={header} className="text-left">{header}</th>)}</tr></thead>
      <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
    </table>
  );
}

/*
 * Purpose: Pagination primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

export function Pagination({ page, totalPages }: { page: number; totalPages: number }): JSX.Element {
  return <div className="flex gap-2 text-sm"><span>Page {page}</span><span>/</span><span>{totalPages}</span></div>;
}

/*
 * Purpose: File upload primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { InputHTMLAttributes } from 'react';

export function FileUpload(props: InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return <input type="file" className="w-full rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700" {...props} />;
}

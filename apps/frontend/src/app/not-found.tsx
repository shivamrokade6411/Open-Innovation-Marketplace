/*
 * Purpose: Global not found page.
 * Author: Copilot
 * Date: 2026-06-28
 */

import Link from 'next/link';

export default function NotFound(): JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <Link className="text-brand-primary underline" href="/">Return home</Link>
    </div>
  );
}

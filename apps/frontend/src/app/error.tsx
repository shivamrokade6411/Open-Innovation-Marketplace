/*
 * Purpose: Global error fallback.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }): JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-slate-500">{error.message}</p>
      <button className="rounded-lg bg-brand-primary px-4 py-2 text-white" onClick={reset}>Try again</button>
    </div>
  );
}

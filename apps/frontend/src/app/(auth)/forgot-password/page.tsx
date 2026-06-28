/*
 * Purpose: Forgot password page.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card variant="glass" className="w-full max-w-md">
        <h1 className="text-3xl font-bold">Reset password</h1>
        <p className="mt-2 text-sm text-slate-500">Enter your email and we will send recovery instructions.</p>
        <div className="mt-6 space-y-4">
          <input className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button className="w-full" onClick={() => setMessage(`Reset link queued for ${email}`)}>Send reset link</Button>
          {message && <p className="text-sm text-brand-accent">{message}</p>}
        </div>
      </Card>
    </main>
  );
}

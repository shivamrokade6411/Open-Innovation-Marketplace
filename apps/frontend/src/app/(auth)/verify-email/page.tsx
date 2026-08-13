/*
 * Purpose: Email verification screen where users can manually submit verification tokens.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../services/api';

export default function VerifyEmailPage(): JSX.Element {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setStatus('loading');
    try {
      const res = await api.get(`/api/auth/verify-email/${token.trim()}`);
      if (res.data.success) {
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now log in.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(res.data.message ?? 'Verification failed.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message ?? 'Invalid or expired verification token.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 bg-[#0a0a0f] text-white">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card variant="glass" className="bg-[#121218]/90 border border-white/10 p-8 shadow-xl shadow-purple-500/5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Mail className="h-8 w-8 animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-center tracking-tight">Verify Your Email</h1>
          <p className="mt-3 text-sm text-center text-slate-400 leading-relaxed">
            Please enter the verification token sent to your email address to activate your account.
          </p>

          {status === 'success' && (
            <div className="mt-6 flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-550/10 p-4 text-emerald-400">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{message}</div>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6 flex gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-450">
              <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{message}</div>
            </div>
          )}

          {status !== 'success' && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Verification Token</label>
                <input
                  required
                  type="text"
                  placeholder="Paste verification token here"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-purple-500/50 text-white placeholder-slate-500"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-sm font-bold uppercase tracking-wider" loading={status === 'loading'}>
                Verify Code
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">Already verified? </span>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold underline decoration-2 transition-colors">
              Sign In
            </Link>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}

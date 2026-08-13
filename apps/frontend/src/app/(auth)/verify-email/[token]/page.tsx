/*
 * Purpose: Dynamic email verification route that automatically verifies on mount from link.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { api } from '../../../../services/api';

export default function AutoVerifyEmailPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const autoVerify = async () => {
      const token = params.token;
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      try {
        const res = await api.get(`/api/auth/verify-email/${token}`);
        if (res.data.success) {
          setStatus('success');
          setMessage('Your email has been successfully verified! Redirecting to login...');
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

    void autoVerify();
  }, [params.token, router]);

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

          <h1 className="text-3xl font-extrabold text-center tracking-tight">Verifying Email</h1>
          
          {status === 'loading' && (
            <div className="mt-8 flex flex-col items-center gap-4 py-6">
              <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
              <p className="text-sm text-slate-400">Verifying code with secure auth servers...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-6 flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-550/10 p-4 text-emerald-450">
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

          {status === 'error' && (
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild className="w-full h-12 text-sm font-bold uppercase tracking-wider">
                <Link href="/verify-email">Enter Code Manually</Link>
              </Button>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">Back to </span>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold underline decoration-2 transition-colors">
              Sign In
            </Link>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}

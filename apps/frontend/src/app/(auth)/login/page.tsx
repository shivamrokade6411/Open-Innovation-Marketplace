/*
 * Purpose: Login page with animated glassmorphism form.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { loginThunk, setCredentials } from '../../../store/authSlice';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useAppDispatch } from '../../../lib/useAppDispatch';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({ defaultValues: { rememberMe: true } });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    try {
      const parsed = loginSchema.parse(values);
      const action = await dispatch(loginThunk({ email: parsed.email, password: parsed.password }));
      if (loginThunk.fulfilled.match(action)) {
        dispatch(setCredentials(action.payload));
        const role = action.payload.user.role;
        router.push(role === 'admin' ? '/admin/dashboard' : role === 'company' ? '/company/dashboard' : '/dashboard');
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card variant="glass" className="bg-white/70 dark:bg-slate-950/60">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sign in to continue building and submitting ideas.</p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 outline-none dark:border-slate-800 dark:bg-slate-900" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <div className="flex gap-2">
                <input type={showPassword ? 'text' : 'password'} className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 outline-none dark:border-slate-800 dark:bg-slate-900" {...register('password')} />
                <button type="button" className="rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-800" onClick={() => setShowPassword((current) => !current)}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('rememberMe')} /> Remember me
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" loading={isSubmitting}>Sign in</Button>
          </form>
          <div className="mt-5 flex items-center justify-between text-sm">
            <Link className="text-brand-primary" href="/forgot-password">Forgot password?</Link>
            <Link className="text-brand-primary" href="/register">Create account</Link>
          </div>
          <button className="mt-6 w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">Continue with Google</button>
        </Card>
      </motion.div>
    </main>
  );
}

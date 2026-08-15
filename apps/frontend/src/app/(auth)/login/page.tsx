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
        router.push(role === 'admin' ? '/admin' : role === 'company' ? '/company/dashboard' : '/dashboard');
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 bg-[#020d1f]">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[440px]">
        <Card variant="glass" className="border border-[#1d2a40] bg-[#061827]/85 px-5 py-5 shadow-[0_0_0_1px_rgba(96,165,250,0.08)] backdrop-blur-xl">
          <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <h1 className="text-4xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-300">Sign in to continue building and submitting ideas.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
              <input
                className="w-full rounded-xl border border-[#1a2c45] bg-[#0b1d2d] px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-[#4d9ef9]"
                placeholder="Email"
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
              <div className="flex gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-xl border border-[#1a2c45] bg-[#0b1d2d] px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-[#4d9ef9]"
                  placeholder="Password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="rounded-xl border border-[#1a2c45] bg-[#0b1d2d] px-3 text-sm text-slate-200 transition hover:border-[#2e4d76]"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" className="h-4 w-4 rounded border-[#1a2c45] bg-[#0b1d2d] text-blue-500" {...register('rememberMe')} />
              Remember me
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button
              type="submit"
              className="w-full rounded-xl border border-transparent bg-gradient-to-r from-[#5e7bf9] via-[#6d80f9] to-[#a36de9] text-white shadow-[0_8px_24px_rgba(108,92,231,0.4)] hover:brightness-110"
              loading={isSubmitting}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm text-slate-300">
            <Link className="transition hover:text-white" href="/forgot-password">Forgot password?</Link>
            <Link className="transition hover:text-white" href="/register">Create account</Link>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-xl border border-[#1a2c45] bg-[#0b1d2d] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-[#2e4d76] hover:text-white"
          >
            Continue with Google
          </button>
        </Card>
      </motion.div>
    </main>
  );
}

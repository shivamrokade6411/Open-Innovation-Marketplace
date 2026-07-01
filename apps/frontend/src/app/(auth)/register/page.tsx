/*
 * Purpose: Multi-step registration page.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { registerThunk, setCredentials } from '../../../store/authSlice';
import { useAppDispatch } from '../../../lib/useAppDispatch';

const stepSchemas = [
  z.object({ role: z.enum(['admin', 'company', 'innovator']) }),
  z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) }),
  z.object({ companyName: z.string().optional(), skills: z.array(z.string()).optional(), bio: z.string().optional() }),
  z.object({ token: z.string().optional() })
];

type FormState = {
  role: 'admin' | 'company' | 'innovator';
  name: string;
  email: string;
  password: string;
  companyName: string;
  skills: string;
  bio: string;
};

const defaultState: FormState = { role: 'innovator', name: '', email: '', password: '', companyName: '', skills: '', bio: '' };

function triggerCelebration(): void {
  if (typeof window === 'undefined') {
    return;
  }
  const pieces = Array.from({ length: 18 }, (_, index) => {
    const piece = document.createElement('div');
    piece.textContent = '✦';
    piece.style.position = 'fixed';
    piece.style.left = `${10 + index * 5}%`;
    piece.style.top = '55%';
    piece.style.zIndex = '9999';
    piece.style.color = index % 2 === 0 ? '#6366f1' : '#06b6d4';
    piece.style.fontSize = '24px';
    piece.style.pointerEvents = 'none';
    piece.style.transition = 'transform 900ms ease-out, opacity 900ms ease-out';
    document.body.appendChild(piece);
    requestAnimationFrame(() => {
      piece.style.transform = `translate(${(index - 9) * 16}px, -220px) rotate(${index * 18}deg)`;
      piece.style.opacity = '0';
    });
    window.setTimeout(() => piece.remove(), 1000);
    return piece;
  });
  void pieces;
}

export default function RegisterPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormState>(defaultState);
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => ((step + 1) / 4) * 100, [step]);

  const submitStep = async (): Promise<void> => {
    setError(null);
    try {
      if (step === 0) {
        stepSchemas[0].parse({ role: values.role });
        setStep(1);
        return;
      }
      if (step === 1) {
        stepSchemas[1].parse({ name: values.name, email: values.email, password: values.password });
        setStep(2);
        return;
      }
      if (step === 2) {
        stepSchemas[2].parse({ companyName: values.companyName || undefined, skills: values.skills ? values.skills.split(',').map((item) => item.trim()) : [], bio: values.bio || undefined });
        setStep(3);
        return;
      }
      const action = await dispatch(registerThunk({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        companyName: values.companyName,
        skills: values.skills.split(',').map((item) => item.trim()).filter(Boolean),
        bio: values.bio
      }));
      if (registerThunk.fulfilled.match(action)) {
        dispatch(setCredentials(action.payload));
        triggerCelebration();
        router.push('/dashboard');
      }
    } catch (submitError) {
      if (submitError instanceof z.ZodError) {
        const messages = submitError.errors.map((err) => {
          const fieldName = err.path.join('.');
          const formattedField = fieldName ? fieldName.charAt(0).toUpperCase() + fieldName.slice(1) : '';
          return formattedField ? `${formattedField}: ${err.message}` : err.message;
        });
        setError(messages.join('\n'));
      } else {
        setError(submitError instanceof Error ? submitError.message : 'Registration failed');
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card variant="glass" className="w-full max-w-2xl bg-white/70 dark:bg-slate-950/60">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
            <span>Step {step + 1} of 4</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {step === 0 && (
            <div>
              <h1 className="text-3xl font-bold">Choose your role</h1>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {(['innovator', 'company', 'admin'] as const).map((role) => (
                  <button key={role} type="button" onClick={() => setValues((current) => ({ ...current, role }))} className={`rounded-2xl border p-4 text-left ${values.role === role ? 'border-brand-primary bg-brand-primary/10' : 'border-slate-200 dark:border-slate-800'}`}>
                    <div className="font-semibold capitalize">{role}</div>
                    <div className="text-sm text-slate-500">{role === 'innovator' ? 'Submit ideas' : role === 'company' ? 'Post challenges' : 'Manage the platform'}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="Full name" value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} />
              <input className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="Email" value={values.email} onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} />
              <input className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 md:col-span-2 dark:border-slate-800 dark:bg-slate-900" placeholder="Password" type="password" value={values.password} onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))} />
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="Company name (if applicable)" value={values.companyName} onChange={(event) => setValues((current) => ({ ...current, companyName: event.target.value }))} />
              <input className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="Skills separated by commas" value={values.skills} onChange={(event) => setValues((current) => ({ ...current, skills: event.target.value }))} />
              <textarea className="min-h-32 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 md:col-span-2 dark:border-slate-800 dark:bg-slate-900" placeholder="Bio" value={values.bio} onChange={(event) => setValues((current) => ({ ...current, bio: event.target.value }))} />
            </div>
          )}
          {step === 3 && <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm dark:border-slate-700">We will send a verification email after registration.</div>}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 dark:border-red-500/30 dark:bg-red-950/20">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-medium space-y-1">
                {error.split('\n').map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (step === 0) {
                  router.push('/login');
                } else {
                  setStep((current) => current - 1);
                }
              }}
            >
              Back
            </Button>
            <Button type="button" onClick={submitStep}>{step === 3 ? 'Create account' : 'Continue'}</Button>
          </div>
        </motion.div>
      </Card>
    </main>
  );
}

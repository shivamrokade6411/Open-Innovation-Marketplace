/*
 * Purpose: Submission wizard page.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../../../../components/ui/Button';
import { Card } from '../../../../../components/ui/Card';

const storageKey = 'oim-submission-draft';

export default function SubmissionPage(): JSX.Element {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ title: '', description: '', techStack: '', githubUrl: '', videoUrl: '', solutionUrl: '' });

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      setDraft(JSON.parse(saved) as typeof draft);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft]);

  return (
    <main className="px-4 py-12 md:px-8 lg:px-16">
      <Card variant="glass" className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between text-sm text-slate-500">
          <span>Step {step + 1} of 4</span>
          <span>Auto-saved draft enabled</span>
        </div>
        {step === 0 && (
          <div className="space-y-4">
            <input className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="Submission title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            <textarea className="min-h-40 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="Describe your solution" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            <input className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="Tech stack used" value={draft.techStack} onChange={(event) => setDraft({ ...draft, techStack: event.target.value })} />
          </div>
        )}
        {step === 1 && <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">Drag and drop PDF, video, and code zip uploads here.</div>}
        {step === 2 && (
          <div className="space-y-4">
            <input className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="GitHub repository" value={draft.githubUrl} onChange={(event) => setDraft({ ...draft, githubUrl: event.target.value })} />
            <input className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="Video URL" value={draft.videoUrl} onChange={(event) => setDraft({ ...draft, videoUrl: event.target.value })} />
            <input className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="Live demo URL" value={draft.solutionUrl} onChange={(event) => setDraft({ ...draft, solutionUrl: event.target.value })} />
          </div>
        )}
        {step === 3 && <div className="rounded-2xl bg-brand-primary/10 p-6 text-sm">AI feedback preview is generated from your problem statement and tech stack.</div>}
        <div className="mt-6 flex justify-between gap-3">
          <Button variant="secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</Button>
          <Button onClick={() => setStep((current) => Math.min(3, current + 1))}>{step === 3 ? 'Submit solution' : 'Continue'}</Button>
        </div>
      </Card>
    </main>
  );
}

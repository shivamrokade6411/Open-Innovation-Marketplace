/*
 * Purpose: Completed challenge submission wizard page with slug resolution.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Card } from '../../../../../components/ui/Card';
import { api } from '../../../../../services/api';
import toast from 'react-hot-toast';

const storageKey = 'oim-submission-draft';

export default function SubmissionPage(): JSX.Element {
  const router = useRouter();
  const params = useParams() as { slug: string };
  
  const [step, setStep] = useState(0);
  const [challengeDbId, setChallengeDbId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ 
    title: '', 
    description: '', 
    techStack: '', 
    githubUrl: '', 
    videoUrl: '', 
    solutionUrl: '' 
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load challenge MongoDB ID from slug
  useEffect(() => {
    async function loadChallenge() {
      try {
        const res = await api.get(`/api/challenges/${params.slug}`);
        if (res.data.success) {
          setChallengeDbId(res.data.data._id);
        }
      } catch (err) {
        setError('Failed to resolve challenge identity.');
      }
    }
    loadChallenge();
  }, [params.slug]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      setDraft(JSON.parse(saved) as typeof draft);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft]);

  const handleSubmit = async () => {
    if (!challengeDbId) {
      setError('Challenge identity is not fully loaded.');
      return;
    }
    if (!draft.title.trim() || !draft.description.trim()) {
      setError('Title and description are required.');
      setStep(0);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('challengeId', challengeDbId);
      formData.append('title', draft.title);
      formData.append('description', draft.description);
      
      const techStackArray = draft.techStack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      techStackArray.forEach((t) => {
        formData.append('techStack', t);
      });

      if (draft.githubUrl) formData.append('githubUrl', draft.githubUrl);
      if (draft.videoUrl) formData.append('videoUrl', draft.videoUrl);
      if (draft.solutionUrl) formData.append('solutionUrl', draft.solutionUrl);

      if (pdfFile) formData.append('pdf', pdfFile);
      if (videoFile) formData.append('video', videoFile);
      if (zipFile) formData.append('code', zipFile);

      const res = await api.post('/api/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        window.localStorage.removeItem(storageKey);
        toast.success('Solution submitted successfully!');
        router.push('/dashboard');
      } else {
        setError(res.data.message ?? 'Submission failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="px-4 py-12 md:px-8 lg:px-16 text-white bg-[#0a0a0f] min-h-[80vh]">
      <Card variant="glass" className="mx-auto max-w-3xl bg-[#121218]/80 border border-white/10 p-8 shadow-xl shadow-purple-500/5">
        <div className="mb-6 flex items-center justify-between text-sm text-slate-400 font-medium">
          <span>Step {step + 1} of 4</span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            Auto-saved draft
          </span>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold tracking-tight">Project Details</h2>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Title</label>
              <input 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-purple-500/50 text-white placeholder-slate-500" 
                placeholder="Name your solution" 
                value={draft.title} 
                onChange={(event) => setDraft({ ...draft, title: event.target.value })} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
              <textarea 
                className="min-h-40 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-purple-500/50 text-white placeholder-slate-500" 
                placeholder="Explain the problem solved and core mechanics of your codebase..." 
                value={draft.description} 
                onChange={(event) => setDraft({ ...draft, description: event.target.value })} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tech Stack (comma separated)</label>
              <input 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-purple-500/50 text-white placeholder-slate-500" 
                placeholder="e.g. Next.js, Express, MongoDB, Tailwind" 
                value={draft.techStack} 
                onChange={(event) => setDraft({ ...draft, techStack: event.target.value })} 
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight">Files Upload</h2>
            
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center bg-white/[0.02]">
              <label className="block text-sm font-semibold mb-2">Upload Solution Presentation (PDF)</label>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-400 border border-white/10 rounded-xl cursor-pointer bg-white/5 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-400 file:cursor-pointer"
              />
              {pdfFile && <p className="mt-2 text-xs text-purple-400">Selected: {pdfFile.name}</p>}
            </div>

            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center bg-white/[0.02]">
              <label className="block text-sm font-semibold mb-2">Upload Video Walkthrough (MP4/WebM)</label>
              <input 
                type="file" 
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-400 border border-white/10 rounded-xl cursor-pointer bg-white/5 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-400 file:cursor-pointer"
              />
              {videoFile && <p className="mt-2 text-xs text-purple-400">Selected: {videoFile.name}</p>}
            </div>

            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center bg-white/[0.02]">
              <label className="block text-sm font-semibold mb-2">Upload Code Source Bundle (.zip)</label>
              <input 
                type="file" 
                accept=".zip"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-400 border border-white/10 rounded-xl cursor-pointer bg-white/5 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-400 file:cursor-pointer"
              />
              {zipFile && <p className="mt-2 text-xs text-purple-400">Selected: {zipFile.name}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold tracking-tight">Project Repositories & Links</h2>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">GitHub Repository URL</label>
              <input 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-purple-500/50 text-white placeholder-slate-500" 
                placeholder="https://github.com/..." 
                value={draft.githubUrl} 
                onChange={(event) => setDraft({ ...draft, githubUrl: event.target.value })} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deployed Demo URL</label>
              <input 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-purple-500/50 text-white placeholder-slate-500" 
                placeholder="https://..." 
                value={draft.solutionUrl} 
                onChange={(event) => setDraft({ ...draft, solutionUrl: event.target.value })} 
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Review Solution</h2>
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 space-y-4 text-sm font-light">
              <p><strong className="font-semibold">Project Title:</strong> {draft.title}</p>
              <p className="line-clamp-3"><strong className="font-semibold">Description:</strong> {draft.description}</p>
              <p><strong className="font-semibold">Tech Stack:</strong> {draft.techStack}</p>
              <p><strong className="font-semibold">GitHub Repo:</strong> {draft.githubUrl || 'N/A'}</p>
              <p><strong className="font-semibold">Live URL:</strong> {draft.solutionUrl || 'N/A'}</p>
              <p><strong className="font-semibold">Uploaded PDF:</strong> {pdfFile ? pdfFile.name : 'N/A'}</p>
              <p><strong className="font-semibold">Uploaded Video:</strong> {videoFile ? videoFile.name : 'N/A'}</p>
              <p><strong className="font-semibold">Uploaded Source (.zip):</strong> {zipFile ? zipFile.name : 'N/A'}</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/5 pt-6">
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => {
              if (step === 0) {
                router.back();
              } else {
                setStep((current) => current - 1);
              }
            }}
          >
            Back
          </Button>

          {step === 3 ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !challengeDbId}
              className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primary/95 text-white"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Solution
            </Button>
          ) : (
            <Button type="button" onClick={() => setStep((current) => current + 1)}>
              Continue
            </Button>
          )}
        </div>
      </Card>
    </main>
  );
}

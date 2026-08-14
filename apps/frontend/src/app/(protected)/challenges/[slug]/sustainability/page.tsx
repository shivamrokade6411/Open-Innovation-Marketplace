/*
 * Purpose: Specialised AI Sustainability Evaluation page for slug challenge routes.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../../services/api';
import toast from 'react-hot-toast';
import {
  Sparkles,
  ArrowLeft,
  Info,
  Award,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Loader2,
  Leaf
} from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';

export default function SustainabilityScoringPage(): JSX.Element {
  const { slug } = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form states
  const [projectDescription, setProjectDescription] = useState('');
  const [technology, setTechnology] = useState('');
  const [environmentalImpact, setEnvironmentalImpact] = useState('');
  const [expectedUsers, setExpectedUsers] = useState('');
  const [resourceConsumption, setResourceConsumption] = useState('');

  // Fetch challenge details
  const { data: challenge } = useQuery({
    queryKey: ['challenge', slug],
    queryFn: async () => {
      const res = await api.get(`/api/challenges/${slug}`);
      return res.data.data;
    }
  });

  // Fetch existing sustainability details
  const { data: existingEval, isLoading: isEvalLoading } = useQuery({
    queryKey: ['sustainability', submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      const res = await api.get(`/api/submissions/${submissionId}/sustainability`);
      return res.data.data;
    },
    enabled: !!submissionId
  });

  // Mutate / Evaluate sustainability metrics
  const evaluateMutation = useMutation({
    mutationFn: async () => {
      if (!submissionId) {
        throw new Error('No submission context found. Please submit project first.');
      }
      const res = await api.post(`/api/submissions/${submissionId}/sustainability`, {
        projectDescription,
        technology,
        environmentalImpact,
        expectedUsers,
        resourceConsumption
      });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Sustainability analysis completed!');
      queryClient.invalidateQueries({ queryKey: ['sustainability', submissionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to analyze sustainability profile');
    }
  });

  const evaluation = evaluateMutation.data || existingEval;

  const handleBack = () => {
    if (submissionId) {
      router.push(`/workspace/${submissionId}`);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12 md:px-12 lg:px-24">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="mb-8 flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to workspace
      </button>

      {/* Header Title */}
      <div className="mb-10 border-b border-white/5 pb-8">
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3">
          <Leaf className="h-3.5 w-3.5" /> Sustainability Module
        </span>
        <h1 className="text-3xl font-black tracking-tight">AI-Powered Sustainability Scorer</h1>
        <p className="text-white/60 text-sm mt-1">
          Evaluate carbon footprint indicators, compute efficiency tradeoffs, and suggest environmental optimizations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Form Inputs (Left) */}
        <div className="lg:col-span-7 space-y-6 bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur">
          <h2 className="text-lg font-bold">Analysis Profile Parameters</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/50 block mb-2 font-semibold">Project & Scope Description</label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe project deliverables and execution architecture..."
                rows={4}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 block mb-2 font-semibold">Core Technologies / Libraries</label>
              <input
                type="text"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                placeholder="e.g. Next.js, Redis, PyTorch, AWS Lambda"
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 block mb-2 font-semibold">Environmental Impact Statement</label>
              <textarea
                value={environmentalImpact}
                onChange={(e) => setEnvironmentalImpact(e.target.value)}
                placeholder="Describe how the project affects environment, savings, or carbon credits..."
                rows={3}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 block mb-2 font-semibold">Expected Monthly Active Users</label>
              <input
                type="text"
                value={expectedUsers}
                onChange={(e) => setExpectedUsers(e.target.value)}
                placeholder="e.g. 100,000 monthly visitors"
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 block mb-2 font-semibold">Expected Compute / Resource Consumption</label>
              <textarea
                value={resourceConsumption}
                onChange={(e) => setResourceConsumption(e.target.value)}
                placeholder="e.g. Serverless API invocations, model hosting parameters..."
                rows={3}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
              />
            </div>
          </div>

          <button
            onClick={() => evaluateMutation.mutate()}
            disabled={evaluateMutation.isPending || !submissionId}
            className="w-full bg-emerald-500 hover:bg-emerald-500/90 text-slate-950 py-3.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
          >
            {evaluateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing metrics...
              </>
            ) : (
              <>
                <Leaf className="h-4 w-4" /> Run Sustainability Analysis
              </>
            )}
          </button>
          {!submissionId && (
            <p className="text-[11px] text-red-400 text-center">
              * Active submission is required. Launch this page from the project workspace.
            </p>
          )}
        </div>

        {/* AI Results Output (Right) */}
        <div className="lg:col-span-5 space-y-6">
          {evaluation ? (
            <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 space-y-6 shadow-2xl relative overflow-hidden">
              {/* Score Gauge */}
              <div className="text-center py-4 border-b border-white/5 space-y-2">
                <div className="inline-flex h-24 w-24 rounded-full border-4 border-emerald-500/20 flex-col items-center justify-center bg-emerald-500/10">
                  <span className="text-3xl font-black text-emerald-400">{evaluation.sustainabilityScore}</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase">Index</span>
                </div>
                <h3 className="font-bold text-base mt-2">Carbon Footprint Score</h3>
                <p className="text-white/60 text-xs italic">"{evaluation.estimatedImpact}"</p>
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" /> Green Strengths
                </h4>
                <ul className="space-y-1 text-xs text-white/80 list-disc list-inside leading-relaxed pl-1">
                  {evaluation.strengths?.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" /> Resource Bottlenecks
                </h4>
                <ul className="space-y-1 text-xs text-white/80 list-disc list-inside leading-relaxed pl-1">
                  {evaluation.weaknesses?.map((w: string, idx: number) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-brand-primary" /> Optimization Steps
                </h4>
                <ul className="space-y-1 text-xs text-white/80 list-disc list-inside leading-relaxed pl-1">
                  {evaluation.recommendations?.map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Label */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-[10px] text-white/50 flex items-start gap-2">
                <Info className="h-4 w-4 text-brand-primary shrink-0" />
                <span>
                  🤖 AI generated evaluation score. This analysis is calculated based on telemetry estimations and serves as evaluation assistance.
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/5 bg-white/5 p-12 text-center text-white/35 text-xs flex flex-col items-center justify-center min-h-[300px]">
              <Leaf className="h-10 w-10 mb-3 text-emerald-400/50" />
              <p>Enter the metrics profile on the left to generate the environmental analysis dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/*
 * Purpose: Judge Evaluation, scoring rubrics, and status auditing dashboard.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../../../../services/api';
import {
  Award,
  Users,
  Globe,
  FileText,
  Video,
  List,
  Clock,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  XCircle,
  Shield,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const GithubIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function SubmissionReviewPage(): JSX.Element {
  const { challengeId, submissionId } = useParams() as { challengeId: string; submissionId: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  // Rubric score states (0-100)
  const [scoreInnovation, setScoreInnovation] = useState(80);
  const [scoreTechnical, setScoreTechnical] = useState(80);
  const [scoreImpact, setScoreImpact] = useState(80);
  const [scoreFeasibility, setScoreFeasibility] = useState(80);
  const [scorePresentation, setScorePresentation] = useState(80);
  const [evaluationComments, setEvaluationComments] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  // Dynamically calculate client-side weighted score
  const clientWeightedScore =
    scoreInnovation * 0.25 +
    scoreTechnical * 0.25 +
    scoreImpact * 0.25 +
    scoreFeasibility * 0.15 +
    scorePresentation * 0.10;

  // Fetch submission and review details
  const { data: detailData, isLoading, error } = useQuery({
    queryKey: ['submission-evaluation', submissionId],
    queryFn: async () => {
      const [subRes, reviewsRes, auditRes] = await Promise.all([
        api.get(`/api/submissions/${submissionId}`),
        api.get(`/api/submissions/${submissionId}/reviews`),
        api.get(`/api/submissions/${submissionId}/audit-trail`)
      ]);
      return {
        submission: subRes.data.data,
        reviews: reviewsRes.data.data,
        auditTrail: auditRes.data.data
      };
    },
    enabled: !!submissionId
  });

  const submission = detailData?.submission;
  const reviews = detailData?.reviews || [];
  const auditTrail = detailData?.auditTrail || [];

  // Submit Review score mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/submissions/${submissionId}/reviews`, {
        scoreInnovation,
        scoreTechnical,
        scoreImpact,
        scoreFeasibility,
        scorePresentation,
        comments: evaluationComments
      });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Scores and evaluations saved!');
      queryClient.invalidateQueries({ queryKey: ['submission-evaluation', submissionId] });
      setEvaluationComments('');
    },
    onError: () => {
      toast.error('Failed to submit evaluation review');
    }
  });

  // Modify submission status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (action: 'submitted' | 'underReview' | 'shortlisted' | 'rejected' | 'finalist' | 'winner' | 'runner_up') => {
      const res = await api.post(`/api/submissions/${submissionId}/status`, {
        action,
        notes: statusNotes || `Set status to: ${action}`
      });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['submission-evaluation', submissionId] });
      setStatusNotes('');
    },
    onError: () => {
      toast.error('Failed to update submission status');
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-red-500">
        Submission details not found or access denied.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12 md:px-12 lg:px-24">
      {/* Back to challenge / breadcrumb */}
      <button
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Submissions
      </button>

      {/* Header Info */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-brand-primary/20 text-brand-primary border border-brand-primary/30 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              {submission.status}
            </span>
            <span className="text-white/40 text-xs">Weighted Score: {submission.score || 0} / 100</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Review: {submission.title}
          </h1>
          <p className="text-white/60 text-sm mt-1">Submitted on: {new Date(submission.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Action icons / details */}
        <div className="flex gap-3">
          {submission.githubUrl && (
            <a
              href={submission.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold transition"
            >
              <GithubIcon /> GitHub
            </a>
          )}
          {submission.solutionUrl && (
            <a
              href={submission.solutionUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white px-4 py-2.5 text-sm font-semibold transition shadow-lg shadow-brand-primary/20"
            >
              <Globe className="h-4 w-4" /> Live Demo
            </a>
          )}
        </div>
      </div>

      {/* Grid: Details on Left, Evaluator panel on Right */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Project Details */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
            <h3 className="text-lg font-bold">Project Details</h3>
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{submission.description}</p>
            {submission.techStack && submission.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {submission.techStack.map((tech: string) => (
                  <span key={tech} className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/70">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submits Media */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-sm text-white/85">
                <FileText className="h-4 w-4 text-brand-primary" /> Pitch Deck File
              </h4>
              {submission.pdfUrl ? (
                <a
                  href={submission.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition"
                >
                  <span className="text-sm font-semibold truncate">Pitch_Deck.pdf</span>
                  <Globe className="h-4 w-4 text-white/40" />
                </a>
              ) : (
                <p className="text-white/40 text-xs">No documents uploaded.</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-sm text-white/85">
                <Video className="h-4 w-4 text-brand-primary" /> Presentation Video
              </h4>
              {submission.videoUrl ? (
                <video src={submission.videoUrl} controls className="w-full rounded-xl border border-white/10" />
              ) : (
                <p className="text-white/40 text-xs">No video uploaded.</p>
              )}
            </div>
          </div>

          {/* Timeline Audit Logs */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-primary" /> Audit Trail & History
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 divide-y divide-white/5">
              {auditTrail.map((log: any) => (
                <div key={log._id} className="pt-3 text-xs flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0 text-brand-primary font-bold text-[10px]">
                    {log.userId?.name?.charAt(0) || 'J'}
                  </div>
                  <div>
                    <p className="text-white/80">
                      <span className="font-bold">{log.userId?.name || 'Evaluator'}</span> performed action:{' '}
                      <span className="font-semibold text-brand-primary uppercase">{log.action}</span>
                    </p>
                    {log.notes && <p className="text-white/50 mt-1 italic">Notes: "{log.notes}"</p>}
                    <span className="text-[9px] text-white/30 block mt-1">
                      Date: {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {auditTrail.length === 0 && (
                <p className="text-xs text-white/40 text-center py-4">No audit trails logged.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column review controls panel */}
        <div className="space-y-6">
          {/* Scoring Rubric panel */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-5">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-primary" /> Rubric Evaluation
            </h3>

            {/* Range inputs */}
            {[
              { label: 'Innovation (25%)', val: scoreInnovation, set: setScoreInnovation },
              { label: 'Technical Quality (25%)', val: scoreTechnical, set: setScoreTechnical },
              { label: 'Impact (25%)', val: scoreImpact, set: setScoreImpact },
              { label: 'Feasibility (15%)', val: scoreFeasibility, set: setScoreFeasibility },
              { label: 'Presentation (10%)', val: scorePresentation, set: setScorePresentation }
            ].map((criterion) => (
              <div key={criterion.label} className="space-y-1">
                <div className="flex justify-between text-xs text-white/60">
                  <span>{criterion.label}</span>
                  <span className="font-bold text-white">{criterion.val}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={criterion.val}
                  onChange={(e) => criterion.set(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
              </div>
            ))}

            <div className="border-t border-white/5 pt-4">
              <div className="flex justify-between items-center text-sm font-semibold mb-4">
                <span>Weighted Score:</span>
                <span className="text-2xl font-black text-brand-primary">{Math.round(clientWeightedScore)}/100</span>
              </div>

              <div>
                <label className="text-xs text-white/40 block mb-1">Grading Comments / Feedback</label>
                <textarea
                  value={evaluationComments}
                  onChange={(e) => setEvaluationComments(e.target.value)}
                  rows={3}
                  placeholder="Provide judge comments..."
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:border-brand-primary text-white"
                />
              </div>

              <button
                onClick={() => submitReviewMutation.mutate()}
                disabled={submitReviewMutation.isPending}
                className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white py-3 rounded-xl text-xs font-semibold transition mt-4"
              >
                {submitReviewMutation.isPending ? 'Submitting...' : 'Save Evaluation'}
              </button>
            </div>
          </div>

          {/* Shortlisting Actions */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-primary" /> Status Actions
            </h3>

            <div>
              <label className="text-xs text-white/40 block mb-1">Optional notes/reasons</label>
              <input
                type="text"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="e.g. Excellent prototype execution..."
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-xs focus:outline-none focus:border-brand-primary text-white"
              />
            </div>

            <div className="grid gap-2 grid-cols-2">
              <button
                onClick={() => updateStatusMutation.mutate('shortlisted')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-2.5 text-xs font-semibold transition"
              >
                Shortlist
              </button>
              <button
                onClick={() => updateStatusMutation.mutate('rejected')}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-500 rounded-xl py-2.5 text-xs font-semibold transition"
              >
                Reject
              </button>
              <button
                onClick={() => updateStatusMutation.mutate('finalist')}
                className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-400 rounded-xl py-2.5 text-xs font-semibold transition col-span-2"
              >
                Mark Finalist
              </button>
              <button
                onClick={() => updateStatusMutation.mutate('winner')}
                className="bg-emerald-500 hover:bg-emerald-500/90 text-slate-950 rounded-xl py-2.5 text-xs font-bold transition"
              >
                Select Winner
              </button>
              <button
                onClick={() => updateStatusMutation.mutate('runner_up')}
                className="bg-white hover:bg-white/90 text-slate-950 rounded-xl py-2.5 text-xs font-bold transition"
              >
                Select Runner-up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

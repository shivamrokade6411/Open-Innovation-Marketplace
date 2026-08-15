'use client';

/*
 * Purpose: Full-featured interactive Automated AI Grading interface with Sandbox evaluation and Organizer controls.
 * Author: Antigravity
 * Date: 2026-08-15
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { api } from '../../../../services/api';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import {
  ArrowLeft,
  Zap,
  Sparkles,
  Code,
  Shield,
  Search,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Lock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Award,
  BookOpen
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface PlagiarismMatch {
  source: string;
  similarity: number;
  matchType: 'internal' | 'external';
}

interface GradingResult {
  _id: string;
  submissionId: string;
  codeQualityScore: number;
  uniquenessScore: number;
  securityScore: number;
  innovationScore: number;
  overallScore: number;
  summary: string;
  strengths: string[];
  vulnerabilities: string[];
  recommendations: string[];
  plagiarismScore: number;
  plagiarismMatches: PlagiarismMatch[];
  processingTime: number;
  model: string;
}

interface Challenge {
  _id: string;
  title: string;
}

interface Submission {
  _id: string;
  title: string;
  description: string;
  score: number;
  aiScore: number;
  status: string;
  userId?: {
    name: string;
    email: string;
  };
  challengeId?: {
    title: string;
  };
}

export default function GradingFeaturePage(): JSX.Element {
  const user = useSelector((state: any) => state.auth.user);
  const isOrganizer = user?.role === 'company' || user?.role === 'admin';

  // Navigation state
  const [activeTab, setActiveTab] = useState<'sandbox' | 'dashboard'>('sandbox');

  // Config fallback check
  const [isConfigured, setIsConfigured] = useState(true);

  // Global Data
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Sandbox States
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [evalMode, setEvalMode] = useState<'snippet' | 'repo'>('snippet');
  const [sandboxResult, setSandboxResult] = useState<GradingResult | null>(null);
  
  // Custom loader simulation steps
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalStep, setEvalStep] = useState('');

  // Dashboard States
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [expandedSubmissionResult, setExpandedSubmissionResult] = useState<GradingResult | null>(null);
  const [loadingResultId, setLoadingResultId] = useState<string | null>(null);
  const [regradingId, setRegradingId] = useState<string | null>(null);
  const [overrideScores, setOverrideScores] = useState<Record<string, number>>({});
  const [savingOverrideId, setSavingOverrideId] = useState<string | null>(null);

  // Load basic dependencies
  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.get('/api/challenges');
        if (response.data?.success && Array.isArray(response.data.data)) {
          setChallenges(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedChallengeId(response.data.data[0]._id);
          }
          setIsConfigured(true);
        }
      } catch (err) {
        console.error('Failed to contact database or load challenges, enabling fallback', err);
        setIsConfigured(false);
      }
    }
    loadData();
  }, []);

  // Fetch organizer submissions list
  const fetchSubmissions = async () => {
    if (!isOrganizer) return;
    setDashboardLoading(true);
    try {
      const res = await api.get('/api/grading/submissions');
      if (res.data?.success) {
        setSubmissions(res.data.data);
        // Pre-populate override scores state
        const initialOverrides: Record<string, number> = {};
        res.data.data.forEach((sub: Submission) => {
          initialOverrides[sub._id] = sub.score;
        });
        setOverrideScores(initialOverrides);
      }
    } catch (err) {
      toast.error('Failed to load dashboard submissions');
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchSubmissions();
    }
  }, [activeTab]);

  // Run Custom Loader step animation for sandbox evaluation
  const runEvaluationSteps = () => {
    const steps = [
      'Initializing sandbox container environment...',
      'Downloading dependencies and parsing abstract syntax tree (AST)...',
      'Running static security scans and lint audits...',
      'Running functional checks against challenge parameters...',
      'Checking submission against platform plagiarism indexes...',
      'Finalizing grading rubrics score breakdown...'
    ];

    let current = 0;
    setEvalStep(steps[0]);
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setEvalStep(steps[current]);
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  };

  // Submit sandbox code for grading
  const handleSandboxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (evalMode === 'snippet' && !codeSnippet.trim()) {
      toast.error('Please paste some code to evaluate.');
      return;
    }
    if (evalMode === 'repo' && !githubUrl.trim()) {
      toast.error('Please specify a GitHub repository URL.');
      return;
    }

    setIsEvaluating(true);
    setSandboxResult(null);
    const clearTimer = runEvaluationSteps();

    try {
      const res = await api.post('/api/grading/submit', {
        challengeId: selectedChallengeId,
        codeContent: evalMode === 'snippet' ? codeSnippet : '',
        githubUrl: evalMode === 'repo' ? githubUrl : '',
      });

      if (res.data?.success) {
        setSandboxResult(res.data.data);
        toast.success('AI Evaluation report generated successfully!');
      } else {
        throw new Error(res.data?.message || 'Grading failed.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Evaluation failed.');
    } finally {
      clearTimer();
      setIsEvaluating(false);
      setEvalStep('');
    }
  };

  // Toggle expanded details for a specific submission on the dashboard
  const handleToggleDetails = async (sub: Submission) => {
    if (selectedSubmissionId === sub._id) {
      setSelectedSubmissionId(null);
      setExpandedSubmissionResult(null);
      return;
    }

    setSelectedSubmissionId(sub._id);
    setExpandedSubmissionResult(null);
    setLoadingResultId(sub._id);

    try {
      const res = await api.get(`/api/grading/${sub._id}`);
      if (res.data?.success) {
        setExpandedSubmissionResult(res.data.data);
      }
    } catch (err) {
      toast.error('No AI Grading report found for this submission yet. Click "Grade" to create one.');
      setSelectedSubmissionId(null);
    } finally {
      setLoadingResultId(null);
    }
  };

  // Trigger AI grading for an existing submission on the dashboard
  const handleTriggerGrading = async (subId: string) => {
    setRegradingId(subId);
    try {
      const res = await api.post(`/api/submissions/${subId}/grade`);
      if (res.data?.success) {
        toast.success('AI evaluation complete!');
        fetchSubmissions();
        // Refresh detail view if it's currently selected
        if (selectedSubmissionId === subId) {
          setExpandedSubmissionResult(res.data.data);
        }
      }
    } catch (err) {
      toast.error('Failed to evaluate submission.');
    } finally {
      setRegradingId(null);
    }
  };

  // Save manual score override on the dashboard
  const handleSaveScoreOverride = async (subId: string) => {
    const scoreVal = overrideScores[subId];
    if (scoreVal === undefined || scoreVal < 0 || scoreVal > 100) {
      toast.error('Please specify a valid score between 0 and 100.');
      return;
    }

    setSavingOverrideId(subId);
    try {
      const res = await api.post(`/api/grading/${subId}/override`, {
        manualScore: Number(scoreVal)
      });
      if (res.data?.success) {
        toast.success('Submission score updated successfully!');
        fetchSubmissions();
      }
    } catch (err) {
      toast.error('Failed to override score.');
    } finally {
      setSavingOverrideId(subId);
    }
  };

  // If backend or DB not configured, display original Fallback template
  if (!isConfigured) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-12 md:px-8 lg:px-16 text-white">
        <Toaster position="top-right" />
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-yellow-600/20 border border-yellow-500/30">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-300 uppercase">Coming Soon</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Automated AI Grading
            </h1>
            <p className="mt-4 text-lg text-slate-400">Feature #3 - LLM-powered code quality and plagiarism scoring</p>
          </div>
        </div>
        <Card variant="glass" className="border-white/5 bg-[#121218] p-8 max-w-2xl">
          <p className="text-slate-400">This feature is being built. The grading server is currently not configured or offline. Check back soon!</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070e1b] text-white px-4 py-12 md:px-8 lg:px-16 relative">
      <Toaster position="top-right" />
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-20 z-0">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-indigo-600 blur-[130px]" />
        <div className="absolute top-[20%] left-[50%] w-[450px] h-[450px] rounded-full bg-purple-600 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Navigation Breadcrumb */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        {/* Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
              <span className="text-2xs font-extrabold text-purple-300 uppercase tracking-widest">Active Platform Service</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-[#9d81ff] to-[#40e0d0] bg-clip-text text-transparent">
              Automated AI Grading
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl font-light text-sm md:text-base">
              Evaluate hackathon submissions, detect code overlaps, and analyze architecture patterns instantly using LLM heuristics.
            </p>
          </div>

          {/* Tab switches */}
          <div className="flex bg-[#0d1627] border border-white/5 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'sandbox'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="h-4 w-4" /> Sandbox Evaluation
            </button>
            <button
              onClick={() => {
                if (!isOrganizer) {
                  toast.error('Organizer view restricted. Login as contact@techcorp.com to unlock.');
                  return;
                }
                setActiveTab('dashboard');
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition relative ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow'
                  : 'text-slate-400 hover:text-white'
              } ${!isOrganizer ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Award className="h-4 w-4" /> Judging Panel
              {!isOrganizer && <Lock className="h-3 w-3 text-slate-500 absolute top-0.5 right-0.5" />}
            </button>
          </div>
        </div>

        {/* Tab content: Sandbox */}
        {activeTab === 'sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
            {/* Input Form Column */}
            <Card variant="glass" className="border-white/5 bg-[#0b1424]/80 p-6 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <BookOpen className="h-5 w-5 text-purple-400" />
                Select Workspace
              </h3>

              <form onSubmit={handleSandboxSubmit} className="space-y-5">
                {/* Challenge Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Challenge</label>
                  <select
                    value={selectedChallengeId}
                    onChange={(e) => setSelectedChallengeId(e.target.value)}
                    className="w-full bg-[#0d1627] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
                  >
                    {challenges.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                    {challenges.length === 0 && <option value="">No active challenges loaded</option>}
                  </select>
                </div>

                {/* Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Submission Type</label>
                  <div className="grid grid-cols-2 gap-2 bg-[#0d1627] border border-white/5 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setEvalMode('snippet')}
                      className={`py-2 text-2xs font-extrabold rounded-lg transition ${
                        evalMode === 'snippet' ? 'bg-white/10 text-white border border-white/5' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Paste Code Snippet
                    </button>
                    <button
                      type="button"
                      onClick={() => setEvalMode('repo')}
                      className={`py-2 text-2xs font-extrabold rounded-lg transition ${
                        evalMode === 'repo' ? 'bg-white/10 text-white border border-white/5' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      GitHub Repository
                    </button>
                  </div>
                </div>

                {/* Code Paste Snippet Input */}
                {evalMode === 'snippet' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Raw Code Content</label>
                    <textarea
                      value={codeSnippet}
                      onChange={(e) => setCodeSnippet(e.target.value)}
                      placeholder="Paste your javascript, typescript or python code here..."
                      className="w-full h-48 bg-[#070e1b] border border-white/10 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 transition resize-none"
                    />
                  </div>
                )}

                {/* Git Repository Input */}
                {evalMode === 'repo' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Repository Endpoint</label>
                    <div className="relative">
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/innovator/repository"
                        className="w-full bg-[#070e1b] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition"
                      />
                      <GithubIcon className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isEvaluating}
                  className="w-full text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg transition"
                >
                  {isEvaluating ? 'Evaluating Submission...' : 'Evaluate Submission'}
                </Button>
              </form>
            </Card>

            {/* Evaluation Loader or Results Screen */}
            <div className="space-y-6">
              {isEvaluating && (
                <Card variant="glass" className="border-white/5 bg-[#0b1424]/80 p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[450px]">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                    <Sparkles className="h-6 w-6 text-purple-400 absolute top-5 left-5 animate-pulse" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h4 className="text-lg font-bold text-white">Evaluating Source Integrity</h4>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      Please hold on. The LLM engine is scoring quality standards, checking safety overrides, and tracking similarity vectors.
                    </p>
                    <div className="pt-4 text-2xs font-semibold text-purple-300 font-mono tracking-wider">
                      {evalStep}
                    </div>
                  </div>
                </Card>
              )}

              {!isEvaluating && !sandboxResult && (
                <div className="border border-dashed border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center text-center text-slate-500 min-h-[450px] bg-[#0b1424]/20">
                  <Code className="h-12 w-12 text-slate-600 mb-4" />
                  <h4 className="text-sm font-semibold text-white mb-1">Sandbox Awaiting Code Input</h4>
                  <p className="text-xs text-slate-500 max-w-xs font-light">
                    Supply a pasted script snippet or a repository URL on the left panel to trigger the AI analysis pipeline.
                  </p>
                </div>
              )}

              {!isEvaluating && sandboxResult && (
                <div className="space-y-6">
                  {/* Results Header Card */}
                  <Card variant="glass" className="border-white/5 bg-[#0b1424]/80 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-2xs font-extrabold uppercase">
                        Analysis Success
                      </div>
                      <h3 className="text-2xl font-black text-white">Grading Report Card</h3>
                      <p className="text-xs text-slate-400 font-light">{sandboxResult.summary}</p>
                    </div>

                    {/* Overall Score Circle Gauge */}
                    <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                      {/* SVG Circle Background */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          className="stroke-purple-500"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={2 * Math.PI * 48 * (1 - sandboxResult.overallScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center text-center">
                        <span className="text-3xl font-black text-white">{sandboxResult.overallScore}</span>
                        <span className="text-3xs text-slate-500 font-semibold uppercase tracking-wider">Overall</span>
                      </div>
                    </div>
                  </Card>

                  {/* Category Scores Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Code Quality', score: sandboxResult.codeQualityScore, icon: Code, color: 'bg-blue-500' },
                      { label: 'Uniqueness', score: sandboxResult.uniquenessScore, icon: Sparkles, color: 'bg-purple-500' },
                      { label: 'Security Score', score: sandboxResult.securityScore, icon: Shield, color: 'bg-emerald-500' },
                      { label: 'Innovation', score: sandboxResult.innovationScore, icon: Zap, color: 'bg-pink-500' }
                    ].map((item, index) => (
                      <Card key={index} className="border-white/5 bg-[#0b1424]/80 p-4 text-center space-y-2 flex flex-col items-center">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                          <item.icon className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">{item.label}</span>
                        <span className="text-2xl font-black text-white block">{item.score}</span>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.score}%` }} />
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Plagiarism Similarity Match Report */}
                  <Card variant="glass" className="border-white/5 bg-[#0b1424]/80 p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-purple-400" />
                        Similarity & Plagiarism Checks
                      </h4>
                      <Badge variant={sandboxResult.plagiarismScore > 20 ? 'danger' : 'success'}>
                        {sandboxResult.plagiarismScore}% max similarity
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {sandboxResult.plagiarismMatches.map((m, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                          <span className="text-xs text-slate-300 font-mono truncate max-w-lg">{m.source}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">{m.matchType}</span>
                            <Badge variant={m.similarity > 30 ? 'danger' : m.similarity > 15 ? 'warning' : 'gray'}>
                              {m.similarity}% match
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {sandboxResult.plagiarismMatches.length === 0 && (
                        <p className="text-xs text-slate-500 italic">No similarity matches flagged. Solution is fully original.</p>
                      )}
                    </div>
                  </Card>

                  {/* Recommendations, Strengths, Vulnerabilities expandable comments */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Strengths */}
                    <Card className="border-emerald-500/10 bg-[#0d1c23]/40 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> Key Strengths
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300 leading-relaxed font-light">
                        {sandboxResult.strengths.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    {/* Vulnerabilities */}
                    <Card className="border-red-500/10 bg-[#230d0d]/40 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" /> Vulnerabilities
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300 leading-relaxed font-light">
                        {sandboxResult.vulnerabilities.map((v, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-red-400 font-bold">⚠</span>
                            <span>{v}</span>
                          </li>
                        ))}
                        {sandboxResult.vulnerabilities.length === 0 && (
                          <p className="text-2xs text-slate-500 italic">No security warnings found.</p>
                        )}
                      </ul>
                    </Card>

                    {/* Recommendations */}
                    <Card className="border-blue-500/10 bg-[#0d162a]/40 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4" /> Next Steps
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300 leading-relaxed font-light">
                        {sandboxResult.recommendations.map((r, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-blue-400 font-bold">{i + 1}.</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab content: Organizer Dashboard */}
        {activeTab === 'dashboard' && isOrganizer && (
          <Card variant="glass" className="border-white/5 bg-[#0b1424]/80 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Organizer Evaluation Board</h3>
                <p className="text-xs text-slate-400 mt-1">Grade hacker solutions, adjust manual scores, and monitor AI analytics ranking.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSubmissions}
                disabled={dashboardLoading}
                className="text-xs text-slate-300 border-white/10 hover:bg-white/5"
              >
                <RefreshCw className={`h-3 w-3 mr-1.5 ${dashboardLoading ? 'animate-spin' : ''}`} />
                Reload
              </Button>
            </div>

            {dashboardLoading && submissions.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-10 w-10 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#070e1b] text-2xs font-extrabold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Rank</th>
                      <th className="px-4 py-3">Participant</th>
                      <th className="px-4 py-3">Challenge Topic</th>
                      <th className="px-4 py-3">AI Score</th>
                      <th className="px-4 py-3">Organiser Score</th>
                      <th className="px-4 py-3">Eval Status</th>
                      <th className="px-4 py-3 rounded-r-xl text-center">Score Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {submissions.map((sub, index) => {
                      const isExpanded = selectedSubmissionId === sub._id;
                      const isLoadingDetails = loadingResultId === sub._id;
                      const isRegrading = regradingId === sub._id;

                      return (
                        <>
                          <tr key={sub._id} className="hover:bg-white/5 transition-colors border-b border-white/5">
                            {/* Rank */}
                            <td className="px-4 py-4 font-bold text-white">
                              <span className="flex items-center gap-1">
                                {index === 0 && <Award className="h-4 w-4 text-yellow-400" />}
                                {index === 1 && <Award className="h-4 w-4 text-slate-300" />}
                                {index === 2 && <Award className="h-4 w-4 text-amber-700" />}
                                {index + 1}
                              </span>
                            </td>

                            {/* Participant Name & Title */}
                            <td className="px-4 py-4 font-medium text-white">
                              <div>{sub.userId?.name || 'Unknown Hacker'}</div>
                              <div className="text-3xs text-slate-500 font-mono mt-0.5">{sub.title}</div>
                            </td>

                            {/* Challenge Title */}
                            <td className="px-4 py-4 text-slate-400 font-light truncate max-w-[200px]">
                              {sub.challengeId?.title || 'Unknown Challenge'}
                            </td>

                            {/* AI Score */}
                            <td className="px-4 py-4">
                              <Badge variant="primary">{sub.aiScore || 0}</Badge>
                            </td>

                            {/* Organiser Score */}
                            <td className="px-4 py-4">
                              <Badge variant={sub.score >= 80 ? 'success' : sub.score >= 50 ? 'warning' : 'danger'}>
                                {sub.score}
                              </Badge>
                            </td>

                            {/* Eval status action */}
                            <td className="px-4 py-4">
                              <button
                                onClick={() => handleToggleDetails(sub)}
                                disabled={isLoadingDetails}
                                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 focus:outline-none"
                              >
                                {isLoadingDetails ? 'Loading...' : isExpanded ? 'Hide Report' : 'Review Report'}
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            </td>

                            {/* Override controls */}
                            <td className="px-4 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={overrideScores[sub._id] !== undefined ? overrideScores[sub._id] : sub.score}
                                  onChange={(e) => {
                                    setOverrideScores({
                                      ...overrideScores,
                                      [sub._id]: Number(e.target.value)
                                    });
                                  }}
                                  className="w-12 bg-[#070e1b] border border-white/10 rounded px-2 py-1 text-center font-bold text-white text-2xs focus:outline-none"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={savingOverrideId === sub._id}
                                  onClick={() => handleSaveScoreOverride(sub._id)}
                                  className="px-2 py-1 text-2xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded"
                                >
                                  {savingOverrideId === sub._id ? 'Saving...' : 'Apply'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isRegrading}
                                  onClick={() => handleTriggerGrading(sub._id)}
                                  className="px-2 py-1 text-2xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded"
                                >
                                  {isRegrading ? 'Grading...' : 'Grade'}
                                </Button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Details Sub-Row */}
                          {isExpanded && expandedSubmissionResult && (
                            <tr key={`${sub._id}-details`} className="bg-white/[0.02]">
                              <td colSpan={7} className="p-6">
                                <div className="space-y-6">
                                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                                    <div>
                                      <h4 className="text-sm font-bold text-white">Detailed Evaluation for {sub.userId?.name}</h4>
                                      <p className="text-3xs text-slate-400 font-mono mt-0.5">Model evaluated: {expandedSubmissionResult.model} • Time: {(expandedSubmissionResult.processingTime / 1000).toFixed(2)}s</p>
                                    </div>
                                    <div className="flex gap-4">
                                      <div className="text-center">
                                        <div className="text-lg font-black text-white">{expandedSubmissionResult.overallScore}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Overall AI</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-lg font-black text-white">{expandedSubmissionResult.plagiarismScore}%</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Similarity</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Sub scores */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                      { label: 'Quality', val: expandedSubmissionResult.codeQualityScore, col: 'bg-blue-500' },
                                      { label: 'Uniqueness', val: expandedSubmissionResult.uniquenessScore, col: 'bg-purple-500' },
                                      { label: 'Security', val: expandedSubmissionResult.securityScore, col: 'bg-emerald-500' },
                                      { label: 'Innovation', val: expandedSubmissionResult.innovationScore, col: 'bg-pink-500' }
                                    ].map((sc, i) => (
                                      <div key={i} className="p-3 bg-[#070e1b] rounded-xl border border-white/5 flex flex-col justify-between h-20">
                                        <span className="text-3xs text-slate-400 uppercase tracking-wider font-extrabold">{sc.label}</span>
                                        <div className="flex items-center justify-between">
                                          <span className="text-lg font-black text-white">{sc.val}</span>
                                          <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${sc.col}`} style={{ width: `${sc.val}%` }} />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Expandable feedbacks */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Strengths / Vulnerabilities */}
                                    <div className="space-y-4">
                                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                                        <h5 className="text-2xs font-extrabold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                          <CheckCircle className="h-3.5 w-3.5" /> Strengths
                                        </h5>
                                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 font-light">
                                          {expandedSubmissionResult.strengths.map((str, idx) => (
                                            <li key={idx}>{str}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2">
                                        <h5 className="text-2xs font-extrabold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                                          <AlertTriangle className="h-3.5 w-3.5" /> Vulnerabilities
                                        </h5>
                                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 font-light">
                                          {expandedSubmissionResult.vulnerabilities.map((vul, idx) => (
                                            <li key={idx}>{vul}</li>
                                          ))}
                                          {expandedSubmissionResult.vulnerabilities.length === 0 && (
                                            <li className="list-none text-slate-500 italic">No vulnerability alerts flagged.</li>
                                          )}
                                        </ul>
                                      </div>
                                    </div>

                                    {/* Recommendations / Matches */}
                                    <div className="space-y-4">
                                      <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-2">
                                        <h5 className="text-2xs font-extrabold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                          <Lightbulb className="h-3.5 w-3.5" /> Recommendations
                                        </h5>
                                        <ul className="list-decimal list-inside text-xs text-slate-300 space-y-1 font-light">
                                          {expandedSubmissionResult.recommendations.map((rec, idx) => (
                                            <li key={idx}>{rec}</li>
                                          ))}
                                        </ul>
                                      </div>

                                      <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-2">
                                        <h5 className="text-2xs font-extrabold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                                          <AlertTriangle className="h-3.5 w-3.5" /> Similarity Matches
                                        </h5>
                                        <div className="space-y-1.5">
                                          {expandedSubmissionResult.plagiarismMatches.map((m, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs p-1">
                                              <span className="truncate max-w-[240px] text-slate-300">{m.source}</span>
                                              <Badge variant={m.similarity > 30 ? 'danger' : 'gray'}>{m.similarity}%</Badge>
                                            </div>
                                          ))}
                                          {expandedSubmissionResult.plagiarismMatches.length === 0 && (
                                            <div className="text-xs text-slate-500 italic">No similarity matches found.</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}

                    {submissions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500 text-xs font-light">
                          No hackathon submissions have been received yet. Use the Sandbox to evaluate mock files.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}

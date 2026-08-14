/*
 * Purpose: Multi-step Challenge Creation wizard.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../../../../services/api';
import {
  FileText,
  HelpCircle,
  Award,
  List,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Users,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewChallengeWizard(): JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('web');
  const [difficulty, setDifficulty] = useState('medium');
  const [maxTeamSize, setMaxTeamSize] = useState(5);
  const [industry, setIndustry] = useState('AI');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [expectedSolution, setExpectedSolution] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [prizeFirst, setPrizeFirst] = useState(0);
  const [prizeSecond, setPrizeSecond] = useState(0);
  const [prizeThird, setPrizeThird] = useState(0);
  const [judgingCriteria, setJudgingCriteria] = useState('');
  const [techStackInput, setTechStackInput] = useState('');

  // Mutation to save/publish challenge
  const challengeMutation = useMutation({
    mutationFn: async ({ status }: { status: 'draft' | 'active' }) => {
      const techStack = techStackInput.split(',').map((s) => s.trim()).filter(Boolean);
      const prizesTotal = Number(prizeFirst) + Number(prizeSecond) + Number(prizeThird);

      const payload = {
        title,
        description,
        problemStatement,
        techStack,
        category,
        difficulty,
        industry,
        maxTeamSize: Number(maxTeamSize),
        prizes: {
          first: Number(prizeFirst),
          second: Number(prizeSecond),
          third: Number(prizeThird),
          total: prizesTotal
        },
        deadline: new Date(deadline).toISOString(),
        startDate: new Date(startDate).toISOString(),
        status,
        requirements: eligibility.split('\n').map((s) => s.trim()).filter(Boolean),
        tags: [category, difficulty, industry].filter(Boolean)
      };

      const res = await api.post('/api/challenges', payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success(data.status === 'active' ? 'Challenge published successfully!' : 'Draft saved successfully!');
      router.push('/company/dashboard');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit challenge');
    }
  });

  const nextStep = () => {
    // Basic field validation before proceeding
    if (step === 1 && (!title || !industry || !maxTeamSize)) {
      toast.error('Please enter all basic information fields');
      return;
    }
    if (step === 2 && !description) {
      toast.error('Description is required');
      return;
    }
    if (step === 3 && !problemStatement) {
      toast.error('Problem statement is required');
      return;
    }
    if (step === 4 && !expectedSolution) {
      toast.error('Expected solution description is required');
      return;
    }
    if (step === 5 && (!startDate || !deadline)) {
      toast.error('Timeline dates are required');
      return;
    }
    if (step === 5 && new Date(startDate) >= new Date(deadline)) {
      toast.error('Deadline must be after start date');
      return;
    }
    if (step === 6 && (Number(prizeFirst) <= 0)) {
      toast.error('First place prize must be greater than zero');
      return;
    }
    if (step === 7 && !judgingCriteria) {
      toast.error('Please specify judging criteria');
      return;
    }

    setStep((s) => Math.min(9, s + 1));
  };

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const stepsList = [
    { num: 1, name: 'Basic Info', icon: FileText },
    { num: 2, name: 'Overview', icon: HelpCircle },
    { num: 3, name: 'Problem', icon: AlertCircle },
    { num: 4, name: 'Solution', icon: CheckCircle },
    { num: 5, name: 'Timeline', icon: Calendar },
    { num: 6, name: 'Prize', icon: Award },
    { num: 7, name: 'Judging', icon: List },
    { num: 8, name: 'Review', icon: Sparkles },
    { num: 9, name: 'Publish', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12 md:px-12 lg:px-24">
      {/* Wizard Header Progress Tracker */}
      <div className="mb-12 border-b border-white/5 pb-8">
        <h1 className="text-3xl font-black tracking-tight text-white mb-6">Create New Challenge</h1>
        <div className="flex justify-between items-center overflow-x-auto gap-4 py-2">
          {stepsList.map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.num;
            const isActive = step === s.num;
            return (
              <div key={s.num} className="flex items-center gap-2 shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  isCompleted
                    ? 'bg-emerald-500 text-slate-950'
                    : isActive
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                    : 'bg-white/5 border border-white/10 text-white/50'
                }`}>
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : s.num}
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? 'text-brand-primary' : 'text-white/40'}`}>
                  {s.name}
                </span>
                {s.num < 9 && <div className="h-[1px] w-8 bg-white/5" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Forms content grid */}
      <div className="max-w-4xl mx-auto rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur shadow-2xl">
        <div className="min-h-[300px]">
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-brand-primary" /> Step 1: Basic Information
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-xs text-white/50 block mb-2 font-semibold">Challenge Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Next-Gen Financial Planner Bot"
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-2 font-semibold">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  >
                    <option value="AI">Artificial Intelligence</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-2 font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  >
                    <option value="ai">AI / ML</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile Apps</option>
                    <option value="blockchain">Blockchain & Crypto</option>
                    <option value="cloud">Cloud Computing</option>
                    <option value="design">UI/UX Design</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-2 font-semibold">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-2 font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-white/40" /> Max Team Size
                  </label>
                  <input
                    type="number"
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                    min={1}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Description */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <HelpCircle className="h-5 w-5 text-brand-primary" /> Step 2: Problem Statement & Summary
              </h2>
              <div>
                <label className="text-xs text-white/50 block mb-2 font-semibold">Challenge Description Summary</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a comprehensive summary overview of the challenge goals and context."
                  rows={8}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Problem Statement */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <AlertCircle className="h-5 w-5 text-brand-primary" /> Step 3: Detailed Problem Statement
              </h2>
              <div>
                <label className="text-xs text-white/50 block mb-2 font-semibold">Detailed Problem Statement</label>
                <textarea
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="What specific issue/inefficiency needs to be addressed? Lay out technical constraints and hurdles."
                  rows={8}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Expected Solution & Tech Stack */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <CheckCircle className="h-5 w-5 text-brand-primary" /> Step 4: Expected Solution
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 block mb-2 font-semibold">Expected Solution Output</label>
                  <textarea
                    value={expectedSolution}
                    onChange={(e) => setExpectedSolution(e.target.value)}
                    placeholder="e.g. A fully functioning web prototype using REST APIs, and source code link."
                    rows={5}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-2 font-semibold">Recommended Tech Stack (Comma separated)</label>
                  <input
                    type="text"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    placeholder="e.g. React, Express, MongoDB, Python"
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Eligibility & Timeline */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-brand-primary" /> Step 5: Eligibility & Timelines
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs text-white/50 block mb-2 font-semibold">Start Date</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-2 font-semibold">Deadline / Submission Close</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-white/50 block mb-2 font-semibold">Eligibility Requirements (One per line)</label>
                  <textarea
                    value={eligibility}
                    onChange={(e) => setEligibility(e.target.value)}
                    placeholder="e.g. Open only to enrolled university students. Must be over 18."
                    rows={4}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Prize Pool */}
          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Award className="h-5 w-5 text-brand-primary" /> Step 6: Prize Pool allocation ($ USD)
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="text-xs text-white/50 block mb-2 font-semibold">1st Place Prize</label>
                  <input
                    type="number"
                    value={prizeFirst}
                    onChange={(e) => setPrizeFirst(Number(e.target.value))}
                    min={0}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-2 font-semibold">2nd Place Prize</label>
                  <input
                    type="number"
                    value={prizeSecond}
                    onChange={(e) => setPrizeSecond(Number(e.target.value))}
                    min={0}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-2 font-semibold">3rd Place Prize</label>
                  <input
                    type="number"
                    value={prizeThird}
                    onChange={(e) => setPrizeThird(Number(e.target.value))}
                    min={0}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  />
                </div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm">
                Total prize pool: <strong className="text-emerald-400 font-bold">${Number(prizeFirst) + Number(prizeSecond) + Number(prizeThird)} USD</strong>
              </div>
            </div>
          )}

          {/* STEP 7: Judging Criteria */}
          {step === 7 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <List className="h-5 w-5 text-brand-primary" /> Step 7: Judging Criteria & Evaluation
              </h2>
              <div>
                <label className="text-xs text-white/50 block mb-2 font-semibold">Judging Criteria Guidelines</label>
                <textarea
                  value={judgingCriteria}
                  onChange={(e) => setJudgingCriteria(e.target.value)}
                  placeholder="Specify key metrics (e.g. Feasibility 20%, Presentation 10%, Security 30%)."
                  rows={8}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                />
              </div>
            </div>
          )}

          {/* STEP 8: Summary Review */}
          {step === 8 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-brand-primary" /> Step 8: Review & Confirm
              </h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 bg-slate-900 p-5 rounded-2xl border border-white/10 divide-y divide-white/5 text-sm">
                <div className="pb-3 flex justify-between">
                  <span className="text-white/50">Title:</span>
                  <span className="font-bold">{title}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-white/50">Industry:</span>
                  <span className="font-bold">{industry}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-white/50">Category:</span>
                  <span className="font-bold">{category}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-white/50">Difficulty:</span>
                  <span className="font-bold capitalize">{difficulty}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-white/50">Max Team Size:</span>
                  <span className="font-bold">{maxTeamSize}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-white/50">Total Prizes:</span>
                  <span className="font-bold text-emerald-400">${Number(prizeFirst) + Number(prizeSecond) + Number(prizeThird)}</span>
                </div>
                <div className="py-3">
                  <span className="text-white/50 block mb-1">Summary description:</span>
                  <span className="text-white/80 whitespace-pre-line leading-relaxed">{description}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: Save / Publish */}
          {step === 9 && (
            <div className="space-y-6 flex flex-col items-center justify-center text-center py-10">
              <CheckCircle className="h-16 w-16 text-brand-primary animate-bounce mb-4" />
              <h2 className="text-2xl font-black">All Done!</h2>
              <p className="text-white/60 text-sm max-w-sm mt-1">
                You can save this challenge as a draft to edit later or publish it live for innovators to see.
              </p>
            </div>
          )}
        </div>

        {/* Navigation actions bar */}
        <div className="mt-10 flex justify-between items-center border-t border-white/5 pt-6">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < 9 ? (
            <button
              onClick={nextStep}
              className="bg-brand-primary hover:bg-brand-primary/95 text-white px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-lg shadow-brand-primary/10"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => challengeMutation.mutate({ status: 'draft' })}
                disabled={challengeMutation.isPending}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-semibold transition flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" /> Save Draft
              </button>
              <button
                onClick={() => challengeMutation.mutate({ status: 'active' })}
                disabled={challengeMutation.isPending}
                className="bg-brand-primary hover:bg-brand-primary/95 text-white px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-lg shadow-brand-primary/20"
              >
                Publish Challenge <CheckCircle className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

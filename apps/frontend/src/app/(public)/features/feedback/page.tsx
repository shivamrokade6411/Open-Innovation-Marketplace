'use client';

/*
 * Purpose: Full-featured interactive Expert Mentor Feedback interface with Live DB integration and Guest Demo mode.
 * Author: Antigravity
 * Date: 2026-08-16
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { api } from '../../../../services/api';
import FeedbackPanel from '../../../../components/feedback/FeedbackPanel';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft,
  MessageSquare,
  Users,
  Star,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Loader,
  Sparkles,
  BookOpen,
  ChevronRight,
  Database,
  User,
  Info
} from 'lucide-react';

interface MockFeedback {
  _id: string;
  mentorId: { name: string; email: string; avatar?: string };
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  rating: number;
  comments: string;
  isThreaded: boolean;
  replies: any[];
  createdAt: string;
}

interface MockSubmission {
  _id: string;
  title: string;
  studentName: string;
  studentEmail: string;
  challengeTitle: string;
  challengeId: string;
  initialFeedback: MockFeedback[];
}

const initialMockSubmissions: MockSubmission[] = [
  {
    _id: 'sub-mock-1',
    title: 'RouteGenie Fleet Core v1',
    studentName: 'Alice Chen',
    studentEmail: 'alice@routegenie.io',
    challengeTitle: 'Smart Cities Transit Optimization',
    challengeId: 'challenge-mock-1',
    initialFeedback: [
      {
        _id: 'feed-mock-1',
        mentorId: { name: 'Jane Smith (Senior Architect at Siemens)', email: 'jane.smith@siemens.com' },
        rating: 4,
        comments: 'The algorithm for routing is highly efficient. I love the separation of concerns between the API gateway and the routing service. Good performance metrics under simulated load.',
        strengths: ['Fast routing execution', 'Clean API design', 'Excellent Docker config'],
        improvements: ['Add geographic redundancy', 'Refactor routing helper functions', 'Missing unit tests for edge cases'],
        nextSteps: ['Integrate real-world traffic API', 'Run load tests up to 10k RPS', 'Add Jest unit tests'],
        isThreaded: false,
        replies: [
          {
            _id: 'reply-mock-1',
            mentorId: { name: 'Alice Chen (Innovator)', email: 'alice@routegenie.io' },
            comments: 'Thanks Jane! I will look into the traffic API integration. Do you recommend a specific mapping provider?',
            createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    ]
  },
  {
    _id: 'sub-mock-2',
    title: 'AquaTelemetry Node',
    studentName: 'Bob Miller',
    studentEmail: 'bob@watertech.net',
    challengeTitle: 'Clean Water Access IoT Suite',
    challengeId: 'challenge-mock-2',
    initialFeedback: [
      {
        _id: 'feed-mock-2',
        mentorId: { name: 'Marcus Aurelius (Lead Hardware Engineer)', email: 'marcus@iotlabs.org' },
        rating: 5,
        comments: 'Extremely well-documented IoT layout and schematic. Using deep sleep cycles effectively is a brilliant choice for battery longevity. Highly practical implementation.',
        strengths: ['Ultra-low power sleep cycle design', 'Clear circuit diagrams', 'Great choice of components'],
        improvements: ['Enclosure waterproof ratings could be specified', 'Better antenna placement description'],
        nextSteps: ['Create an IP68 standard enclosure design', 'Optimize signal propagation under soil'],
        isThreaded: false,
        replies: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ]
  },
  {
    _id: 'sub-mock-3',
    title: 'IntakeFlow React Frontend',
    studentName: 'Carol Davis',
    studentEmail: 'carol@intakeflow.com',
    challengeTitle: 'Healthcare Patient Intake Dashboard',
    challengeId: 'challenge-mock-3',
    initialFeedback: []
  }
];

export default function FeedbackFeaturePage() {
  const user = useSelector((state: any) => state.auth.user);
  const isMentor = user?.role === 'company' || user?.role === 'admin';
  const isAuthenticated = !!user;

  // Navigation state
  const [activeTab, setActiveTab] = useState<'sandbox' | 'docs'>('sandbox');

  // Live Database States
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);

  // Guest Demo Mode States
  const [mockSubmissions, setMockSubmissions] = useState<MockSubmission[]>(initialMockSubmissions);
  const [selectedMockSubId, setSelectedMockSubId] = useState<string>('sub-mock-1');
  const [showDemoForm, setShowDemoForm] = useState<boolean>(false);
  const [demoReplyingTo, setDemoReplyingTo] = useState<string | null>(null);
  const [demoFormData, setDemoFormData] = useState({
    rating: 5,
    comments: '',
    strengths: '',
    improvements: '',
    nextSteps: ''
  });

  const selectedMockSub = mockSubmissions.find((s) => s._id === selectedMockSubId);

  // Load challenges if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadChallenges() {
      try {
        setLoading(true);
        const response = await api.get('/api/challenges');
        if (response.data?.success && Array.isArray(response.data.data)) {
          setChallenges(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedChallengeId(response.data.data[0]._id);
          }
          setIsConfigured(true);
        }
      } catch (err) {
        console.error('Failed to load challenges from API, enabling database bypass fallback', err);
        setIsConfigured(false);
      } finally {
        setLoading(false);
      }
    }
    loadChallenges();
  }, [isAuthenticated]);

  // Load submissions for selected challenge (for mentor role)
  useEffect(() => {
    if (!isAuthenticated || !selectedChallengeId || !isMentor) return;
    async function loadChallengeSubmissions() {
      try {
        setLoading(true);
        const response = await api.get(`/api/submissions/challenge/${selectedChallengeId}/tracker`);
        if (response.data?.success && response.data.data?.submissions) {
          const fetchedSubs = response.data.data.submissions;
          setSubmissions(fetchedSubs);
          if (fetchedSubs.length > 0) {
            setSelectedSubmissionId(fetchedSubs[0]._id);
          } else {
            setSelectedSubmissionId('');
          }
        }
      } catch (err) {
        console.error('Failed to load challenge submissions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadChallengeSubmissions();
  }, [selectedChallengeId, isAuthenticated, isMentor]);

  // Load my submissions (for innovator role)
  useEffect(() => {
    if (!isAuthenticated || isMentor) return;
    async function loadMySubmissions() {
      try {
        setLoading(true);
        const response = await api.get('/api/submissions/my');
        if (response.data?.success && Array.isArray(response.data.data)) {
          setSubmissions(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedSubmissionId(response.data.data[0]._id);
          } else {
            setSelectedSubmissionId('');
          }
        }
      } catch (err) {
        console.error('Failed to load my submissions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMySubmissions();
  }, [isAuthenticated, isMentor]);

  // Handle Demo Mode Feedback Submission
  const handleDemoFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoFormData.comments.trim()) {
      toast.error('Comments are required');
      return;
    }

    const newFeedback: MockFeedback = {
      _id: `feed-mock-${Date.now()}`,
      mentorId: {
        name: 'Guest Mentor (You)',
        email: 'guest@oim.dev'
      },
      rating: demoFormData.rating,
      comments: demoFormData.comments,
      strengths: demoFormData.strengths.split('\n').filter((s) => s.trim()),
      improvements: demoFormData.improvements.split('\n').filter((s) => s.trim()),
      nextSteps: demoFormData.nextSteps.split('\n').filter((s) => s.trim()),
      isThreaded: !!demoReplyingTo,
      replies: [],
      createdAt: new Date().toISOString()
    };

    setMockSubmissions((prev) =>
      prev.map((sub) => {
        if (sub._id === selectedMockSubId) {
          if (demoReplyingTo) {
            return {
              ...sub,
              initialFeedback: (sub.initialFeedback || []).map((f) => {
                if (f._id === demoReplyingTo) {
                  return {
                    ...f,
                    replies: [...(f.replies || []), newFeedback]
                  };
                }
                return f;
              })
            };
          } else {
            return {
              ...sub,
              initialFeedback: [...(sub.initialFeedback || []), newFeedback]
            };
          }
        }
        return sub;
      })
    );

    toast.success(demoReplyingTo ? 'Reply posted!' : 'Feedback submitted!');
    setDemoFormData({ rating: 5, comments: '', strengths: '', improvements: '', nextSteps: '' });
    setShowDemoForm(false);
    setDemoReplyingTo(null);
  };

  const selectedSubObject = submissions.find((s) => s._id === selectedSubmissionId);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-12 md:px-8 lg:px-16 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <MessageSquare className="h-3 w-3 mr-1" />
                COLLABORATION
              </Badge>
              {isAuthenticated ? (
                <Badge className="bg-green-500/10 text-green-300 border border-green-500/20 flex items-center gap-1">
                  <Database className="h-3 w-3" /> Live DB Mode
                </Badge>
              ) : (
                <Badge className="bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1 animate-pulse">
                  <Sparkles className="h-3 w-3" /> Interactive Demo Mode
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
              Expert Mentor Feedback
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl">
              Connect with leading experts, discuss improvements, and master challenge domains in real-time.
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'sandbox' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brain className="h-4 w-4" /> Workshop
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'docs' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-4 w-4" /> Features & Docs
            </button>
          </div>
        </div>

        {/* Tab 1: Workshop Dashboard */}
        {activeTab === 'sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar List (Challenges / Submissions) */}
            <div className="lg:col-span-4 space-y-6">
              {/* If user is logged in as Company/Admin */}
              {isAuthenticated && isMentor && (
                <Card className="p-4 bg-slate-900/50 border border-slate-800 space-y-4">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Select Active Challenge
                  </label>
                  <select
                    value={selectedChallengeId}
                    onChange={(e) => setSelectedChallengeId(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-lg p-2 text-sm border border-slate-700 focus:outline-none focus:border-cyan-500"
                  >
                    {challenges.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </Card>
              )}

              {/* Submissions Title */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {isAuthenticated ? (isMentor ? 'Review Submissions' : 'My Solutions') : 'Demo Solutions'}
                </h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {loading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="h-6 w-6 animate-spin text-cyan-400" />
                    </div>
                  )}

                  {/* Render Live Submissions if authenticated */}
                  {isAuthenticated &&
                    !loading &&
                    (submissions.length === 0 ? (
                      <Card className="p-6 text-center border-slate-850 bg-slate-900/30">
                        <p className="text-sm text-slate-500">No submissions found.</p>
                      </Card>
                    ) : (
                      submissions.map((sub) => (
                        <button
                          key={sub._id}
                          onClick={() => setSelectedSubmissionId(sub._id)}
                          className={`w-full text-left p-4 rounded-xl border transition flex flex-col gap-1 ${
                            selectedSubmissionId === sub._id
                              ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                              : 'bg-slate-900/40 border-slate-850 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <span className="font-bold text-sm line-clamp-1">{sub.title}</span>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-400">
                              By: {sub.userId?.name || user?.name || 'Innovator'}
                            </span>
                            <Badge className="bg-slate-850 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.5">
                              {sub.status}
                            </Badge>
                          </div>
                        </button>
                      ))
                    ))}

                  {/* Render Mock Submissions if NOT authenticated */}
                  {!isAuthenticated &&
                    mockSubmissions.map((sub) => (
                      <button
                        key={sub._id}
                        onClick={() => setSelectedMockSubId(sub._id)}
                        className={`w-full text-left p-4 rounded-xl border transition flex flex-col gap-1 ${
                          selectedMockSubId === sub._id
                            ? 'bg-purple-500/10 border-purple-500/40 text-white'
                            : 'bg-slate-900/40 border-slate-850 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="font-bold text-sm line-clamp-1">{sub.title}</span>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400">By: {sub.studentName}</span>
                          <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5">
                            Demo Mode
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic">
                          {sub.challengeTitle}
                        </p>
                      </button>
                    ))}
                </div>
              </div>

              {/* Info Tip */}
              <Card className="p-4 bg-slate-900/30 border-slate-850 flex gap-3 text-slate-400 text-xs">
                <Info className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300 mb-1">Collaborative Threads</p>
                  Mentors rate strengths and map improvements. Innovators discuss details right in the feedback loops.
                </div>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-6">
              {/* Banner Alert for Guest Users */}
              {!isAuthenticated && (
                <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/20 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-purple-400 flex-shrink-0 animate-pulse" />
                    <div>
                      <h4 className="text-sm font-bold text-purple-200">You are browsing in Demo Mode</h4>
                      <p className="text-xs text-purple-300/80">
                        Interactive mock panel is ready. Create a profile or sign in to save your updates to the live database.
                      </p>
                    </div>
                  </div>
                  <Link href="/auth/register">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white text-xs whitespace-nowrap">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Render Active Submission details */}
              {(isAuthenticated && selectedSubObject) || (!isAuthenticated && selectedMockSub) ? (
                <div className="space-y-6">
                  {/* Selected Solution Summary Card */}
                  <Card className="p-6 bg-slate-900/30 border-slate-850">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
                          {isAuthenticated ? 'Live Solution' : 'Mock Solution'}
                        </span>
                        <h2 className="text-2xl font-bold text-white mt-1">
                          {isAuthenticated ? selectedSubObject.title : selectedMockSub?.title}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Challenge Context:{' '}
                          <span className="text-slate-300 font-semibold">
                            {isAuthenticated
                              ? selectedSubObject.challengeId?.title || 'Monorepo Challenge'
                              : selectedMockSub?.challengeTitle}
                          </span>
                        </p>
                      </div>
                      <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 text-xs">
                        {isAuthenticated ? selectedSubObject.status : 'submitted'}
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {isAuthenticated
                        ? selectedSubObject.description || 'No description provided by innovator.'
                        : 'Simulated innovation platform prototype evaluating low footprint telemetry, automated AST pipeline parsing, and client side integration dashboards.'}
                    </p>
                  </Card>

                  {/* Render Live FeedbackPanel component if authenticated */}
                  {isAuthenticated && selectedSubmissionId && (
                    <div className="p-6 bg-slate-900/30 border border-slate-850 rounded-2xl text-slate-100">
                      <FeedbackPanel
                        submissionId={selectedSubmissionId}
                        currentUserId={user?._id || user?.id}
                        isMentor={isMentor}
                      />
                    </div>
                  )}

                  {/* Render Inline Interactive Mock Feedback Panel if guest */}
                  {!isAuthenticated && selectedMockSub && (
                    <div className="p-6 bg-slate-900/30 border border-purple-500/10 rounded-2xl space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-purple-400" />
                            Expert Feedback (Demo)
                          </h3>
                          <p className="text-sm text-slate-400 mt-1">
                            {(selectedMockSub.initialFeedback || []).length} active feedback thread
                            {(selectedMockSub.initialFeedback || []).length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setDemoReplyingTo(null);
                            setShowDemoForm(!showDemoForm);
                          }}
                          className="bg-purple-600 hover:bg-purple-500 text-white text-xs"
                        >
                          + Add Feedback
                        </Button>
                      </div>

                      {/* Mock Feedback Form */}
                      {showDemoForm && (
                        <motion.form
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onSubmit={handleDemoFeedbackSubmit}
                          className="p-5 bg-slate-800/50 border border-purple-500/20 rounded-xl space-y-4"
                        >
                          {demoReplyingTo && (
                            <div className="text-xs text-slate-400 flex items-center justify-between">
                              <span>Replying to Thread</span>
                              <button
                                type="button"
                                onClick={() => setDemoReplyingTo(null)}
                                className="text-slate-500 hover:text-slate-300"
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          {/* Star Rating input */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Rating (1-5)</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setDemoFormData({ ...demoFormData, rating: star })}
                                  className={`text-xl transition ${
                                    demoFormData.rating >= star ? 'text-yellow-400' : 'text-slate-600'
                                  }`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Comments */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Comments</label>
                            <textarea
                              value={demoFormData.comments}
                              onChange={(e) => setDemoFormData({ ...demoFormData, comments: e.target.value })}
                              placeholder="Share your detailed expert critique..."
                              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
                              rows={3}
                            />
                          </div>

                          {/* Strengths / Improvements / Next Steps (Only shown for main feedback, not replies) */}
                          {!demoReplyingTo && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">
                                  Strengths (one per line)
                                </label>
                                <textarea
                                  value={demoFormData.strengths}
                                  onChange={(e) => setDemoFormData({ ...demoFormData, strengths: e.target.value })}
                                  placeholder="e.g. Excellent layout"
                                  className="w-full px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 h-16"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">
                                  Improvements (one per line)
                                </label>
                                <textarea
                                  value={demoFormData.improvements}
                                  onChange={(e) => setDemoFormData({ ...demoFormData, improvements: e.target.value })}
                                  placeholder="e.g. Add validation"
                                  className="w-full px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 h-16"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">
                                  Next Steps (one per line)
                                </label>
                                <textarea
                                  value={demoFormData.nextSteps}
                                  onChange={(e) => setDemoFormData({ ...demoFormData, nextSteps: e.target.value })}
                                  placeholder="e.g. Test security"
                                  className="w-full px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 h-16"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs py-2">
                              <Send className="h-3 w-3 mr-2" /> Submit Feedback
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                setShowDemoForm(false);
                                setDemoReplyingTo(null);
                              }}
                              variant="outline"
                              className="text-slate-400 border-slate-700 hover:bg-slate-800 text-xs py-2"
                            >
                              Cancel
                            </Button>
                          </div>
                        </motion.form>
                      )}

                      {/* Mock Feedback Thread Rendering */}
                      {(selectedMockSub.initialFeedback || []).length === 0 ? (
                        <Card className="p-8 text-center border-slate-850 bg-slate-900/10">
                          <MessageSquare className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400 text-sm">No feedback has been left yet. Add feedback above!</p>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {selectedMockSub.initialFeedback.map((feed) => (
                            <motion.div
                              key={feed._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="space-y-3"
                            >
                              <Card className="p-4 border-slate-850 bg-slate-900/40">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <p className="font-semibold text-white text-sm">{feed.mentorId.name}</p>
                                    <p className="text-[10px] text-slate-500">{feed.mentorId.email}</p>
                                  </div>
                                  <div className="flex text-yellow-400 text-sm">
                                    {Array.from({ length: feed.rating }).map((_, idx) => (
                                      <span key={idx}>★</span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-slate-300 text-sm mb-4 leading-relaxed">{feed.comments}</p>

                                {/* Strengths */}
                                {feed.strengths.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-[10px] font-bold text-green-400 mb-1 flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" /> Strengths
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {feed.strengths.map((item, i) => (
                                        <Badge key={i} className="bg-green-500/10 text-green-300 text-[10px]">
                                          {item}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Improvements */}
                                {feed.improvements.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-[10px] font-bold text-amber-400 mb-1 flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" /> Improvements
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {feed.improvements.map((item, i) => (
                                        <Badge key={i} className="bg-amber-500/10 text-amber-300 text-[10px]">
                                          {item}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Next Steps */}
                                {feed.nextSteps.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-[10px] font-bold text-cyan-400 mb-1">Recommended Next Steps</p>
                                    <ul className="text-xs text-slate-300 space-y-1 pl-1">
                                      {feed.nextSteps.map((step, i) => (
                                        <li key={i} className="flex gap-2">
                                          <span className="text-cyan-400">•</span> {step}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </Card>

                              {/* Nested Replies */}
                              {feed.replies && feed.replies.length > 0 && (
                                <div className="ml-6 space-y-3 border-l border-slate-800 pl-4">
                                  {feed.replies.map((reply) => (
                                    <div key={reply._id} className="p-3 bg-slate-800/30 rounded-lg border border-slate-800">
                                      <p className="font-semibold text-xs text-slate-300">{reply.mentorId.name}</p>
                                      <p className="text-slate-450 text-xs mt-1">{reply.comments}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reply trigger button */}
                              <button
                                onClick={() => {
                                  setDemoReplyingTo(feed._id);
                                  setShowDemoForm(true);
                                }}
                                className="text-xs text-purple-400 hover:text-purple-300 ml-4 font-semibold"
                              >
                                + Reply to Thread
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Card className="p-12 text-center border-slate-850 bg-slate-900/30">
                  <Loader className="h-10 w-10 text-cyan-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-bold text-white mb-2">No Active Solution Selected</h3>
                  <p className="text-slate-400 text-sm">
                    Select a submission from the list on the left to start analyzing mentor reviews.
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Documentation & Features */}
        {activeTab === 'docs' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Features list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Users className="h-6 w-6 text-cyan-400" />,
                  title: 'Expert Mentorship',
                  description: 'Receive detailed reviews and tips from industry leads, corporate sponsors, and vetted developers.'
                },
                {
                  icon: <MessageSquare className="h-6 w-6 text-blue-400" />,
                  title: 'Threaded Conversations',
                  description: 'Discuss individual issues or clarify next steps in dedicated sub-threads for each rating.'
                },
                {
                  icon: <Star className="h-6 w-6 text-yellow-400" />,
                  title: '5-Star Quality Audits',
                  description: 'Clearly visual ratings track progress and compliance across submissions and code modules.'
                },
                {
                  icon: <Brain className="h-6 w-6 text-purple-400" />,
                  title: 'Structured Assessment',
                  description: 'Assessment templates partition reports into strengths, actionable points, and future roadmap phases.'
                }
              ].map((benefit, i) => (
                <Card key={i} className="p-6 bg-slate-900/40 border-slate-800 hover:border-cyan-500/25 transition">
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
                </Card>
              ))}
            </div>

            {/* How it works */}
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-6">Workflow Process</h2>
              <div className="space-y-4">
                {[
                  {
                    title: 'Submit your solution code',
                    description: 'Upload your repository files or live prototype link through the challenge workspace.'
                  },
                  {
                    title: 'Vetted review assignment',
                    description: 'Our automated scheduler assigns your work to domain specialists matched to your tech stack.'
                  },
                  {
                    title: 'Receive structured report & stars',
                    description: 'Receive ratings along with structured lists detailing strengths, improvements, and next steps.'
                  },
                  {
                    title: 'Collaborate & Refine',
                    description: 'Reply inside the threaded panel to seek guidelines, make updates, and request resubmissions.'
                  }
                ].map((item, idx) => (
                  <Card key={idx} className="p-5 flex gap-4 bg-slate-900/20 border-slate-850">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
                      <span className="text-slate-950 font-extrabold text-sm">{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion } from 'framer-motion';
import { GitBranch, Clock, CheckCircle, AlertCircle, ExternalLink, Loader } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Submission {
  _id: string;
  title: string;
  status: 'submitted' | 'underReview' | 'shortlisted' | 'winner' | 'rejected';
  userId: { name: string; email: string; avatar?: string };
  challengeId: string;
  updatedAt: string;
  score?: number;
  aiScore?: number;
  sandboxUrl?: string;
  githubUrl?: string;
}

export interface TrackerProps {
  challengeId: string;
  autoRefresh?: boolean;
}

const statusConfig = {
  submitted: { label: 'Draft', color: 'bg-slate-500', icon: '📝' },
  underReview: { label: 'In Review', color: 'bg-yellow-500', icon: '🔍' },
  shortlisted: { label: 'Prototype Testing', color: 'bg-blue-500', icon: '⚙️' },
  winner: { label: 'Accepted', color: 'bg-green-500', icon: '✅' },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: '❌' }
};

export function SubmissionsTracker({ challengeId, autoRefresh = true }: TrackerProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Connect to Socket.io on mount
  useEffect(() => {
    const newSocket = io(undefined, {
      path: '/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      newSocket.emit('join-challenge', challengeId);
    });

    newSocket.on('initial-count', (data) => {
      setLiveCount(data.liveCount);
    });

    newSocket.on('live-count-updated', (data) => {
      if (data.challengeId === challengeId) {
        setLiveCount(data.liveCount);
      }
    });

    newSocket.on('submission-updated', (data) => {
      setSubmissions((prev) =>
        prev.map((sub) => (sub._id === data.submission._id ? { ...sub, ...data.submission } : sub))
      );
    });

    newSocket.on('submissions-list', (data) => {
      setSubmissions(data.submissions);
      setTotalCount(data.total);
      setLoading(false);
    });

    newSocket.on('error', (err) => {
      setError(err.message);
      setLoading(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-challenge', challengeId);
      newSocket.disconnect();
    };
  }, [challengeId]);

  // Fetch submissions on page load
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/submissions/challenge/${challengeId}/tracker?page=${page}&limit=10`
        );
        if (!response.ok) throw new Error('Failed to fetch submissions');
        const data = await response.json();
        setSubmissions(data.data.submissions);
        setTotalCount(data.data.pagination.total);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [challengeId, page]);

  // Auto-refresh live count periodically
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/submissions/challenge/${challengeId}/stats`);
        if (response.ok) {
          const data = await response.json();
          setLiveCount(data.data.liveCount);
        }
      } catch (err) {
        console.error('Failed to refresh live count', err);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [challengeId, autoRefresh]);

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="space-y-6">
      {/* Live Badge Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 uppercase tracking-wider">Live Submissions</div>
              <div className="mt-2 text-4xl font-black text-cyan-400">{liveCount}</div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-cyan-400/10">
              <div className="relative h-3 w-3">
                <div className="absolute h-full w-full rounded-full bg-cyan-400 animate-pulse" />
                <div className="absolute h-full w-full rounded-full bg-cyan-400 animate-ping" />
              </div>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 uppercase tracking-wider">Total Submissions</div>
              <div className="mt-2 text-4xl font-black text-purple-400">{totalCount}</div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-400/10">
              <GitBranch className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 uppercase tracking-wider">Avg. Score</div>
              <div className="mt-2 text-4xl font-black text-green-400">
                {submissions.length > 0
                  ? (
                      submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length
                    ).toFixed(1)
                  : '—'}
              </div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-400/10">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Submissions List */}
      <Card variant="glass">
        <h3 className="mb-4 text-lg font-semibold">Recent Submissions</h3>

        {loading && !submissions.length && (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle className="inline mr-2 h-4 w-4" />
            {error}
          </div>
        )}

        {!loading && !error && submissions.length === 0 && (
          <div className="text-center py-8 text-slate-400">No submissions yet</div>
        )}

        {submissions.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {submissions.map((submission) => {
              const status = statusConfig[submission.status];
              return (
                <motion.div
                  key={submission._id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedSubmission(submission)}
                  className="cursor-pointer"
                >
                  <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 hover:border-slate-600 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{status.icon}</span>
                          <h4 className="font-semibold line-clamp-1">{submission.title}</h4>
                          <Badge variant="gray" className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          by {submission.userId.name} • {new Date(submission.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {submission.score !== undefined && (
                          <div className="text-sm font-semibold text-cyan-400">{submission.score.toFixed(1)}</div>
                        )}
                        {submission.sandboxUrl && (
                          <a
                            href={submission.sandboxUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-slate-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetailModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />
      )}
    </div>
  );
}

interface SubmissionDetailModalProps {
  submission: Submission;
  onClose: () => void;
}

function SubmissionDetailModal({ submission, onClose }: SubmissionDetailModalProps) {
  const status = statusConfig[submission.status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-slate-950 p-6 border border-slate-800"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{submission.title}</h2>
            <p className="text-sm text-slate-400 mt-1">
              by {submission.userId.name} ({submission.userId.email})
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{status.icon}</span>
            <Badge className={status.color}>{status.label}</Badge>
            {submission.score !== undefined && (
              <Badge variant="gray">Score: {submission.score.toFixed(1)}</Badge>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            {submission.sandboxUrl && (
              <a
                href={submission.sandboxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium text-white"
              >
                View Sandbox <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {submission.githubUrl && (
              <a
                href={submission.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium text-white"
              >
                GitHub <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Submission Date */}
          <div className="text-xs text-slate-400">
            <Clock className="inline h-3 w-3 mr-1" />
            Submitted {new Date(submission.updatedAt).toLocaleString()}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

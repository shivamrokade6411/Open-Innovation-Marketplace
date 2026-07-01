'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Send, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import io from 'socket.io-client';

interface Feedback {
  _id: string;
  mentorId: { name: string; email: string; avatar?: string };
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  rating: number;
  comments: string;
  isThreaded: boolean;
  parentFeedbackId?: string;
  replies: Feedback[];
  createdAt: string;
  updatedAt: string;
}

interface FeedbackPanelProps {
  submissionId: string;
  currentUserId?: string;
  isMentor?: boolean;
  onRefresh?: () => void;
}

export default function FeedbackPanel({ 
  submissionId, 
  currentUserId, 
  isMentor = false,
  onRefresh 
}: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    strengths: '',
    improvements: '',
    nextSteps: '',
    rating: 5,
    comments: ''
  });

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(undefined, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    newSocket.emit('join-submission', submissionId);
    newSocket.on('feedback-added', (data) => {
      if (data.submissionId === submissionId) {
        fetchFeedback();
      }
    });

    setSocket(newSocket);
    return () => {
      newSocket.emit('leave-submission', submissionId);
      newSocket.disconnect();
    };
  }, [submissionId]);

  // Fetch feedback
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/submissions/${submissionId}/feedback?parentOnly=true`);
      if (!response.ok) throw new Error('Failed to fetch feedback');
      const data = await response.json();
      setFeedback(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [submissionId]);

  // Submit feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.comments.trim()) {
      setError('Comments are required');
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      setError('Rating must be between 1-5');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/submissions/${submissionId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          strengths: formData.strengths.split('\n').filter(s => s.trim()),
          improvements: formData.improvements.split('\n').filter(s => s.trim()),
          nextSteps: formData.nextSteps.split('\n').filter(s => s.trim()),
          rating: parseInt(formData.rating.toString()),
          comments: formData.comments,
          parentFeedbackId: replyingTo || undefined
        })
      });

      if (!response.ok) throw new Error('Failed to submit feedback');
      
      setFormData({ strengths: '', improvements: '', nextSteps: '', rating: 5, comments: '' });
      setShowForm(false);
      setReplyingTo(null);
      fetchFeedback();
      socket?.emit('feedback-added', { submissionId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-6 w-6 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            Expert Feedback
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {feedback.length} feedback thread{feedback.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isMentor && (
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-500 text-white"
          >
            + Add Feedback
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Feedback Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitFeedback}
          className="p-5 bg-slate-800/50 border border-purple-500/20 rounded-lg space-y-4"
        >
          {replyingTo && (
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Replying to thread</span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Rating (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={`p-2 rounded transition ${
                    formData.rating >= star
                      ? 'text-yellow-400'
                      : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <Star className="h-5 w-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Comments
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Share your detailed feedback..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none text-sm"
              rows={4}
            />
          </div>

          {/* Strengths */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Strengths (one per line)
            </label>
            <textarea
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              placeholder="e.g., Clean code structure"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none text-sm"
              rows={2}
            />
          </div>

          {/* Improvements */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Areas for Improvement (one per line)
            </label>
            <textarea
              value={formData.improvements}
              onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
              placeholder="e.g., Add error handling"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none text-sm"
              rows={2}
            />
          </div>

          {/* Next Steps */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Next Steps (one per line)
            </label>
            <textarea
              value={formData.nextSteps}
              onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
              placeholder="e.g., Optimize database queries"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none text-sm"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowForm(false);
                setReplyingTo(null);
                setFormData({ strengths: '', improvements: '', nextSteps: '', rating: 5, comments: '' });
              }}
              variant="outline"
              className="text-slate-300"
            >
              Cancel
            </Button>
          </div>
        </motion.form>
      )}

      {/* Feedback Threads */}
      {feedback.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No feedback yet. {isMentor ? 'Be the first to share your insights!' : ''}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <FeedbackThread
              key={item._id}
              feedback={item}
              submissionId={submissionId}
              isMentor={isMentor}
              onReply={() => {
                setReplyingTo(item._id);
                setShowForm(true);
              }}
              onRefresh={fetchFeedback}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Feedback Thread Component
function FeedbackThread({
  feedback,
  submissionId,
  isMentor,
  onReply,
  onRefresh
}: {
  feedback: Feedback;
  submissionId: string;
  isMentor: boolean;
  onReply: () => void;
  onRefresh: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Main Feedback */}
      <Card className="p-4 border-purple-500/20 hover:border-purple-500/40 transition">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold text-white">{feedback.mentorId.name}</p>
            <p className="text-xs text-slate-400">{feedback.mentorId.email}</p>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Comments */}
        <p className="text-slate-300 text-sm mb-4">{feedback.comments}</p>

        {/* Strengths */}
        {feedback.strengths.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-green-400 mb-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Strengths
            </p>
            <div className="flex flex-wrap gap-2">
              {feedback.strengths.map((strength, i) => (
                <Badge key={i} className="bg-green-500/20 text-green-300 text-xs">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {feedback.improvements.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Areas to Improve
            </p>
            <div className="flex flex-wrap gap-2">
              {feedback.improvements.map((improvement, i) => (
                <Badge key={i} className="bg-amber-500/20 text-amber-300 text-xs">
                  {improvement}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {feedback.nextSteps.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-blue-400 mb-1">Next Steps</p>
            <ul className="text-sm text-slate-300 space-y-1">
              {feedback.nextSteps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-blue-400">•</span> {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-slate-500 mt-3">
          {new Date(feedback.createdAt).toLocaleString()}
        </p>
      </Card>

      {/* Replies */}
      {feedback.replies?.length > 0 && (
        <div className="ml-6 space-y-3 border-l border-slate-700 pl-4">
          {feedback.replies.map((reply) => (
            <FeedbackReply key={reply._id} feedback={reply} />
          ))}
        </div>
      )}

      {/* Reply Button */}
      {isMentor && (
        <button
          onClick={onReply}
          className="text-xs text-purple-400 hover:text-purple-300 ml-4 font-medium"
        >
          + Reply
        </button>
      )}
    </motion.div>
  );
}

// Feedback Reply Component
function FeedbackReply({ feedback }: { feedback: Feedback }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 bg-slate-800/30 rounded border border-slate-700/50"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-sm text-slate-300">{feedback.mentorId.name}</p>
          <p className="text-xs text-slate-500">{feedback.mentorId.email}</p>
        </div>
        <span className="text-xs text-slate-500">
          {new Date(feedback.createdAt).toLocaleString()}
        </span>
      </div>
      <p className="text-sm text-slate-300">{feedback.comments}</p>
    </motion.div>
  );
}

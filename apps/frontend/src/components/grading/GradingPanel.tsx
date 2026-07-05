'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, CheckCircle, Sparkles, Loader, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface GradingResult {
  _id: string;
  codeQualityScore: number;
  uniquenessScore: number;
  securityScore: number;
  innovationScore: number;
  overallScore: number;
  summary: string;
  strengths: string[];
  vulnerabilities: string[];
  recommendations: string[];
  processingTime: number;
  createdAt: string;
}

interface GradingPanelProps {
  submissionId: string;
  onGradeClick?: () => void;
}

export default function GradingPanel({ submissionId, onGradeClick }: GradingPanelProps) {
  const [result, setResult] = useState<GradingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrading = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/submissions/${submissionId}/grade`);
      if (response.ok) {
        const data = await response.json();
        setResult(data.data);
      } else if (response.status !== 404) {
        throw new Error('Failed to fetch grading result');
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grading');
    } finally {
      setLoading(false);
    }
  };

  const triggerGrading = async () => {
    setIsGrading(true);
    try {
      const response = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to trigger grading');

      const data = await response.json();
      setResult(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grade submission');
    } finally {
      setIsGrading(false);
    }
  };

  useEffect(() => {
    fetchGrading();
  }, [submissionId]);

  if (loading && !result) {
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
            <Sparkles className="h-5 w-5 text-purple-400" />
            AI Grading Results
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {result ? 'Powered by Claude AI' : 'No grading available yet'}
          </p>
        </div>
        {!result && (
          <Button
            onClick={triggerGrading}
            disabled={isGrading}
            className="bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50"
          >
            {isGrading ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Grading...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Grade Now
              </>
            )}
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

      {/* Results */}
      {result && (
        <>
          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-gradient-to-r from-purple-600/10 to-cyan-600/10 border border-purple-500/20 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Overall Score</h4>
              <span className="text-xs text-slate-400">
                {(result.processingTime / 1000).toFixed(1)}s analysis
              </span>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.overallScore}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">{result.summary}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white">{result.overallScore}</div>
                <div className="text-xs text-slate-400">/100</div>
              </div>
            </div>
          </motion.div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Code Quality', score: result.codeQualityScore, icon: '📝', color: 'from-blue-500' },
              { label: 'Uniqueness', score: result.uniquenessScore, icon: '💡', color: 'from-purple-500' },
              { label: 'Security', score: result.securityScore, icon: '🔒', color: 'from-green-500' },
              { label: 'Innovation', score: result.innovationScore, icon: '🚀', color: 'from-pink-500' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-4 text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-xs text-slate-400 mb-2">{item.label}</p>
                  <div className="text-2xl font-bold text-white mb-2">{item.score}</div>
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                      className={`h-full bg-gradient-to-r ${item.color}`}
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 border-green-500/20">
                <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Strengths
                </h4>
                <div className="space-y-2">
                  {result.strengths.map((strength, i) => (
                    <div key={i} className="flex gap-2 text-sm text-slate-300">
                      <span className="text-green-400 flex-shrink-0">✓</span>
                      {strength}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Vulnerabilities */}
          {result.vulnerabilities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-4 border-red-500/20">
                <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  Vulnerabilities & Issues
                </h4>
                <div className="space-y-2">
                  {result.vulnerabilities.map((vuln, i) => (
                    <div key={i} className="flex gap-2 text-sm text-slate-300">
                      <span className="text-red-400 flex-shrink-0">⚠</span>
                      {vuln}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-4 border-blue-500/20">
                <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2 text-sm text-slate-300">
                      <span className="text-blue-400 flex-shrink-0">{i + 1}.</span>
                      {rec}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Grade Again */}
          <Button
            onClick={triggerGrading}
            disabled={isGrading}
            variant="outline"
            className="w-full text-slate-300"
          >
            {isGrading ? 'Regrading...' : 'Regrade Submission'}
          </Button>
        </>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle2, XCircle, Loader, AlertCircle, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface VerificationResult {
  isValid: boolean;
  message: string;
  data?: {
    certificateNumber: string;
    recipient: string;
    email: string;
    challenge: string;
    type: string;
    issuedAt: string;
    submissionScore: number;
    rewardAmount: number;
    rewardCurrency: string;
    payoutStatus: string;
    txRef?: string;
  };
  revokedAt?: string;
}

export default function VerifyCertificatePage() {
  const [hash, setHash] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hash.trim() || hash.length !== 64) {
      setResult({
        isValid: false,
        message: 'Invalid hash format. Certificate hash must be 64 characters (SHA-256).'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/certificates/verify/${hash}`);
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({
        isValid: false,
        message: 'Failed to verify certificate. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Verify Certificate
            </h1>
          </div>
          <p className="text-slate-400">
            Authenticate any Open Innovation Marketplace certificate using its unique hash
          </p>
        </motion.div>

        {/* Verification Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleVerify}
          className="mb-8"
        >
          <Card className="p-6">
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Certificate Hash (SHA-256)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hash}
                onChange={(e) => setHash(e.target.value.trim())}
                placeholder="e.g., a1b2c3d4e5f6..."
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none font-mono text-sm"
              />
              <Button
                type="submit"
                disabled={loading || !hash}
                className="bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  'Verify'
                )}
              </Button>
            </div>
          </Card>
        </motion.form>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Status */}
            <Card
              className={`p-6 border-2 ${
                result.isValid ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {result.isValid ? (
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-400" />
                )}
                <h3 className="text-lg font-semibold text-white">
                  {result.isValid ? 'Certificate Valid' : 'Certificate Invalid'}
                </h3>
              </div>
              <p className="text-sm text-slate-300">{result.message}</p>
              {result.revokedAt && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  Revoked on {new Date(result.revokedAt).toLocaleString()}
                </div>
              )}
            </Card>

            {/* Certificate Details */}
            {result.data && (
              <Card className="p-6 space-y-6">
                {/* Recipient */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Recipient
                  </p>
                  <p className="text-lg font-semibold text-white">{result.data.recipient}</p>
                  <p className="text-sm text-slate-400">{result.data.email}</p>
                </div>

                {/* Challenge & Certificate Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Challenge
                    </p>
                    <p className="text-sm text-white">{result.data.challenge}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Certificate Type
                    </p>
                    <Badge
                      className={`${
                        result.data.type === 'winner'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : result.data.type === 'finalist'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {result.data.type.charAt(0).toUpperCase() + result.data.type.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Certificate Number */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Certificate Number
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-slate-700/50 rounded font-mono text-sm text-slate-300 break-all">
                      {result.data.certificateNumber}
                    </code>
                    <button
                      onClick={() => copyToClipboard(result.data?.certificateNumber || '')}
                      className="p-2 hover:bg-slate-700 rounded transition text-slate-400 hover:text-slate-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-400 mt-1">Copied to clipboard!</p>
                  )}
                </div>

                {/* Dates & Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Issued Date
                    </p>
                    <p className="text-sm text-white">
                      {new Date(result.data.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Submission Score
                    </p>
                    <p className="text-sm font-semibold text-purple-400">{result.data.submissionScore}/100</p>
                  </div>
                </div>

                {/* Reward */}
                {result.data.rewardAmount > 0 && (
                  <div className="p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Reward
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {result.data.rewardAmount}
                      </span>
                      <span className="text-slate-400">{result.data.rewardCurrency}</span>
                      {result.data.payoutStatus && (
                        <Badge className="ml-auto bg-slate-700 text-slate-300 text-xs">
                          {result.data.payoutStatus === 'completed'
                            ? '✓ Paid'
                            : result.data.payoutStatus === 'processing'
                              ? '⏳ Processing'
                              : '⏱ Pending'}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <Shield className="h-16 w-16 text-slate-700 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400">
              Enter a certificate hash above to verify its authenticity
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { SubmissionsTracker } from '../../../../components/tracker/SubmissionsTracker';
import { ArrowLeft, Rocket, CheckCircle, AlertCircle } from 'lucide-react';

export default function TrackerFeaturePage(): JSX.Element {
  const [demoChallenge] = useState('demo-challenge-1');
  const [showDemo, setShowDemo] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-12 md:px-8 lg:px-16">
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/30">
            <Rocket className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300 uppercase">Real-Time Tracking</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Live Submissions Tracker
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl leading-relaxed">
            Track innovation progress in real-time. Review prototypes, code sandboxes, and active submissions
            immediately with WebSocket-powered live updates and comprehensive status monitoring.
          </p>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
        <Card variant="glass">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/20">
              <CheckCircle className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold">Real-Time Updates</h3>
              <p className="mt-1 text-sm text-slate-400">
                See submission status changes instantly with WebSocket connections
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-400/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold">Live Badge Counters</h3>
              <p className="mt-1 text-sm text-slate-400">
                Monitor active submissions and track progress by status
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-400/20">
              <CheckCircle className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Code Sandbox Preview</h3>
              <p className="mt-1 text-sm text-slate-400">
                View submitted code directly in browser with sandbox previews
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/20">
              <CheckCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Status Filtering</h3>
              <p className="mt-1 text-sm text-slate-400">
                Filter submissions by Draft, In Review, Testing, Accepted, or Rejected
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/20">
              <CheckCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold">Pagination Support</h3>
              <p className="mt-1 text-sm text-slate-400">
                Efficiently browse through large submission lists
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-400/20">
              <CheckCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold">Score Display</h3>
              <p className="mt-1 text-sm text-slate-400">
                View AI scoring and submission ratings at a glance
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tech Stack */}
      <div className="grid gap-6 md:grid-cols-2 mb-16">
        <Card variant="glass" className="md:col-span-2">
          <h3 className="text-lg font-bold mb-4">Technology Stack</h3>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Frontend</div>
              <div className="mt-1 text-sm font-semibold">React + Socket.io Client</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Real-Time</div>
              <div className="mt-1 text-sm font-semibold">WebSocket (Socket.io)</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Backend</div>
              <div className="mt-1 text-sm font-semibold">Express.js + Socket.io</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Database</div>
              <div className="mt-1 text-sm font-semibold">MongoDB with Indexing</div>
            </div>
          </div>
        </Card>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">
          Get Started
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => setShowDemo(!showDemo)}
          className="bg-white/5 hover:bg-white/10"
        >
          {showDemo ? 'Hide' : 'View'} Live Demo
        </Button>
      </div>

      {/* Live Demo */}
      {showDemo && (
        <Card variant="glass" className="mb-16">
          <h3 className="text-lg font-bold mb-6">Live Tracker Demo</h3>
          <p className="text-sm text-slate-400 mb-6">
            Connect to a sample challenge to see real-time submission tracking in action:
          </p>
          <SubmissionsTracker challengeId={demoChallenge} autoRefresh={true} />
        </Card>
      )}

      {/* API Documentation */}
      <Card variant="glass" className="md:col-span-2">
        <h3 className="text-lg font-bold mb-4">API Endpoints</h3>
        <div className="space-y-3 text-sm font-mono">
          <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
            <div className="text-cyan-400">GET /api/submissions/challenge/:challengeId/tracker</div>
            <div className="text-slate-400 mt-1">Get paginated submissions for a challenge</div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
            <div className="text-cyan-400">GET /api/submissions/challenge/:challengeId/stats</div>
            <div className="text-slate-400 mt-1">Get live submission statistics and counts</div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
            <div className="text-cyan-400">Socket Event: join-challenge</div>
            <div className="text-slate-400 mt-1">Join a challenge room for real-time updates</div>
          </div>
        </div>
      </Card>
    </main>
  );
}

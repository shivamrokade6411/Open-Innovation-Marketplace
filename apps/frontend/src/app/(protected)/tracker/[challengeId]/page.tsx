'use client';

import { useParams } from 'next/navigation';
import { Card } from '../../../../components/ui/Card';
import { SubmissionsTracker } from '../../../../components/tracker/SubmissionsTracker';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SubmissionTrackerPage(): JSX.Element {
  const params = useParams();
  const challengeId = params.challengeId as string;

  if (!challengeId) {
    return (
      <main className="px-4 py-12 md:px-8 lg:px-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">Invalid Challenge</h1>
          <p className="mt-2 text-slate-400">Please provide a valid challenge ID</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-12 md:px-8 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Challenges
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Live Submissions Tracker
        </h1>
        <p className="mt-2 text-slate-400">
          Real-time monitoring of submission progress and status updates for this challenge.
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card variant="glass" className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 border-purple-500/20">
          <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Feature</div>
          <div className="mt-2 text-lg text-purple-300">Real-time Updates</div>
          <p className="mt-2 text-xs text-slate-500">
            Live tracking with WebSocket-powered instant status changes
          </p>
        </Card>
        <Card variant="glass" className="bg-gradient-to-br from-cyan-600/10 to-cyan-600/5 border-cyan-500/20">
          <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Status Badges</div>
          <div className="mt-2 text-lg text-cyan-300">5 States</div>
          <p className="mt-2 text-xs text-slate-500">
            Draft, In Review, Testing, Accepted, Rejected
          </p>
        </Card>
        <Card variant="glass" className="bg-gradient-to-br from-green-600/10 to-green-600/5 border-green-500/20">
          <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Data</div>
          <div className="mt-2 text-lg text-green-300">Paginated</div>
          <p className="mt-2 text-xs text-slate-500">
            Efficient pagination with 10 items per page
          </p>
        </Card>
      </div>

      {/* Tracker Component */}
      <SubmissionsTracker challengeId={challengeId} autoRefresh={true} />
    </main>
  );
}

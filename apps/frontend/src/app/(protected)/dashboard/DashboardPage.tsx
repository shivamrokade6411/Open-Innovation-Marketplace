/*
 * Purpose: Participant Dashboard showing submissions, saved challenges, deadlines, achievements, and leaderboard stats.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Zap,
  Bookmark,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function ParticipantDashboard(): JSX.Element {
  const { data: session } = useSession();

  // Fetch Participant dashboard metrics
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['participant-dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/dashboards/participant');
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary" />
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-red-500">
        Failed to load dashboard statistics.
      </div>
    );
  }

  const {
    user,
    submissions = [],
    savedChallenges = [],
    upcomingDeadlines = [],
    recommendedChallenges = [],
    achievements = [],
    recentActivity = []
  } = response;

  return (
    <div className="space-y-8 p-1">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-brand-primary/20 via-purple-950/20 to-slate-900 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-48 w-48 text-brand-primary" />
        </div>
        <div className="max-w-2xl space-y-4">
          <span className="bg-brand-primary/20 text-brand-primary border border-brand-primary/30 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <Trophy className="h-3 w-3" /> Level 2 Innovator
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Welcome back, <span className="bg-gradient-to-r from-brand-primary to-purple-400 bg-clip-text text-transparent">{user?.name || session?.user?.name}</span>
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            Ready to solve today's challenge? You currently rank{' '}
            <strong className="text-white">#{user?.rank}</strong> on the global leaderboard with{' '}
            <strong className="text-brand-primary">{user?.innovationScore} pts</strong>.
          </p>
        </div>
      </div>

      {/* Overview stats badges */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Submissions', value: submissions.length, icon: Sparkles, color: 'text-brand-primary bg-brand-primary/10' },
          { label: 'Saved Challenges', value: savedChallenges.length, icon: Bookmark, color: 'text-purple-400 bg-purple-400/10' },
          { label: 'Achievements Unlocked', value: achievements.length, icon: Award, color: 'text-amber-400 bg-amber-400/10' },
          { label: 'Global Standing', value: `#${user?.rank}`, icon: Trophy, color: 'text-emerald-400 bg-emerald-400/10' }
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur flex justify-between items-center">
            <div>
              <span className="text-xs text-white/50 block font-semibold uppercase tracking-wider mb-1">{stat.label}</span>
              <span className="text-2xl font-black text-white">{stat.value}</span>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (Submissions & Bookmarks) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section: My Submissions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-primary" /> My Submissions
              </h2>
            </div>
            <div className="grid gap-4">
              {submissions.map((sub: any) => (
                <div
                  key={sub._id}
                  className="rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 p-5 backdrop-blur flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition"
                >
                  <div>
                    <h3 className="font-bold text-base text-white">{sub.title}</h3>
                    <p className="text-xs text-white/60 mt-1 truncate max-w-md">{sub.challengeId?.title}</p>
                    <span className="text-[10px] text-white/40 block mt-2">
                      Last update: {new Date(sub.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-white/10 text-white/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs capitalize">
                      {sub.status}
                    </span>
                    <Link
                      href={`/workspace/${sub._id}`}
                      className="rounded-xl bg-brand-primary hover:bg-brand-primary/95 px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition text-white"
                    >
                      Workspace <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}

              {submissions.length === 0 && (
                <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl text-white/40 text-sm">
                  You haven't submitted any solutions yet.
                </div>
              )}
            </div>
          </div>

          {/* Section: Saved Challenges */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-brand-primary" /> Saved Challenges
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {savedChallenges.map((challenge: any) => (
                <div
                  key={challenge._id}
                  className="rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 p-5 backdrop-blur flex flex-col justify-between h-[180px] transition"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-brand-primary/20 text-brand-primary text-[10px] font-bold rounded px-2 py-0.5 uppercase">
                        {challenge.difficulty}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">${challenge.prizes?.total?.toLocaleString()}</span>
                    </div>
                    <h3 className="font-bold text-sm text-white line-clamp-2">{challenge.title}</h3>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(challenge.deadline).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/challenges/${challenge.slug}`}
                      className="text-xs font-semibold text-brand-primary hover:text-brand-accent flex items-center gap-1.5"
                    >
                      View Details <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}

              {savedChallenges.length === 0 && (
                <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl text-white/40 text-sm md:col-span-2">
                  No bookmarked challenges.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Deadlines, Recommendations, Activities) */}
        <div className="space-y-8">
          {/* Section: Upcoming Deadlines */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white/50 flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-primary" /> Upcoming Deadlines
            </h3>
            <div className="space-y-4">
              {upcomingDeadlines.map((c: any) => (
                <div key={c._id} className="flex justify-between items-center text-xs">
                  <div className="truncate max-w-[200px]">
                    <h4 className="font-bold text-white truncate">{c.title}</h4>
                    <span className="text-white/40">Ending: {new Date(c.deadline).toLocaleDateString()}</span>
                  </div>
                  <Link
                    href={`/challenges/${c.slug}`}
                    className="text-brand-primary font-semibold hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))}

              {upcomingDeadlines.length === 0 && (
                <p className="text-xs text-white/40 text-center py-2">No upcoming deadlines.</p>
              )}
            </div>
          </div>

          {/* Section: Recommended Challenges */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white/50 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-primary" /> Recommendations
            </h3>
            <div className="space-y-4">
              {recommendedChallenges.map((c: any) => (
                <div key={c._id} className="bg-slate-900 border border-white/5 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs text-white line-clamp-1">{c.title}</h4>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-emerald-400 font-bold">${c.prizes?.total?.toLocaleString()}</span>
                    <Link
                      href={`/challenges/${c.slug}`}
                      className="text-brand-primary hover:underline font-semibold"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}

              {recommendedChallenges.length === 0 && (
                <p className="text-xs text-white/40 text-center py-2">No matching recommendations found.</p>
              )}
            </div>
          </div>

          {/* Section: Recent Activity / Notifications */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white/50 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-primary" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex gap-3 text-xs leading-relaxed">
                  <div className="h-6 w-6 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white/90">{activity.title}</h5>
                    <p className="text-white/60 text-[11px]">{activity.description}</p>
                    <span className="text-[10px] text-white/35 block mt-0.5">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {recentActivity.length === 0 && (
                <p className="text-xs text-white/40 text-center py-2">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

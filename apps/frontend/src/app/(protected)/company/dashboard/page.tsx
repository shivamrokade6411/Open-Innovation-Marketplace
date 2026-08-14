/*
 * Purpose: Company Dashboard showing posted challenges, submissions count, winners, views, conversion rate, and challenge management table.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../services/api';
import Link from 'next/link';
import {
  BarChart2,
  Briefcase,
  Users,
  Eye,
  Percent,
  CheckCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  Calendar
} from 'lucide-react';

export default function CompanyDashboard(): JSX.Element {
  // Fetch Company dashboard statistics
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['company-dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/dashboards/company');
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
        Failed to load company stats.
      </div>
    );
  }

  const { metrics, recentChallenges = [] } = response;

  return (
    <div className="space-y-8 p-1">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Company Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">Track challenges performance, views, and submissions.</p>
        </div>
        <Link
          href="/company/challenges/new"
          className="bg-brand-primary hover:bg-brand-primary/95 text-white px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-lg shadow-brand-primary/20"
        >
          <Plus className="h-4 w-4" /> Create Challenge
        </Link>
      </div>

      {/* Analytics Cards Row */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Challenges', value: metrics.activeChallenges, max: metrics.totalChallenges, unit: 'posted', icon: Briefcase, color: 'text-brand-primary bg-brand-primary/10' },
          { label: 'Total Submissions', value: metrics.totalSubmissions, max: null, unit: 'solutions', icon: Users, color: 'text-purple-400 bg-purple-400/10' },
          { label: 'Shortlisted Projects', value: metrics.shortlistedSubmissions, max: null, unit: 'finalists', icon: CheckCircle, color: 'text-emerald-400 bg-emerald-400/10' },
          { label: 'Total Views', value: metrics.totalViews, max: null, unit: 'clicks', icon: Eye, color: 'text-blue-400 bg-blue-400/10' }
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur flex justify-between items-center">
            <div>
              <span className="text-xs text-white/50 block font-semibold uppercase tracking-wider mb-1">{card.label}</span>
              <span className="text-2xl font-black text-white">
                {card.value}
                {card.max !== null && <span className="text-sm font-medium text-white/40">/{card.max}</span>}
              </span>
              <span className="text-[10px] text-white/40 block mt-1">{card.unit}</span>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row (Analytics Rate & Trends) */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur flex flex-col justify-between h-[160px]">
          <div>
            <span className="text-xs text-white/50 block font-semibold uppercase tracking-wider mb-1">Conversion Rate</span>
            <h3 className="text-3xl font-black text-white flex items-center gap-2">
              {metrics.conversionRate}% <Percent className="h-6 w-6 text-brand-primary" />
            </h3>
          </div>
          <p className="text-[11px] text-white/45">
            Ratio of challenge views turned into project submissions.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur flex flex-col justify-between h-[160px]">
          <div>
            <span className="text-xs text-white/50 block font-semibold uppercase tracking-wider mb-1">Winners Selected</span>
            <h3 className="text-3xl font-black text-emerald-400 flex items-center gap-2">
              {metrics.winners} <CheckCircle className="h-6 w-6" />
            </h3>
          </div>
          <p className="text-[11px] text-white/45">
            Successful award designations completed.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur flex flex-col justify-between h-[160px]">
          <div>
            <span className="text-xs text-white/50 block font-semibold uppercase tracking-wider mb-1">Challenge Drafts</span>
            <h3 className="text-3xl font-black text-white/70">
              {metrics.totalChallenges - metrics.activeChallenges}
            </h3>
          </div>
          <p className="text-[11px] text-white/45">
            Challenges currently saved in draft status awaiting launch.
          </p>
        </div>
      </div>

      {/* Challenges Management Table */}
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-brand-primary" /> Posted Challenges
          </h2>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-xs text-white/50 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-l-xl">Challenge</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submissions</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentChallenges.map((challenge: any) => (
                <tr key={challenge._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white max-w-xs truncate">{challenge.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                      challenge.status === 'active'
                        ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/25'
                        : challenge.status === 'draft'
                        ? 'bg-yellow-450/10 text-yellow-405 border border-yellow-405/25'
                        : 'bg-white/10 text-white/60 border border-white/5'
                    }`}>
                      {challenge.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">{challenge.submissions}</td>
                  <td className="px-6 py-4 text-white/55">{challenge.views}</td>
                  <td className="px-6 py-4 text-white/55">
                    {new Date(challenge.deadline).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/challenges/${challenge._id}`}
                      className="text-xs font-semibold text-brand-primary hover:text-brand-accent inline-flex items-center gap-1 hover:underline"
                    >
                      Track <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {recentChallenges.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-white/30 text-xs">
                    No challenges posted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

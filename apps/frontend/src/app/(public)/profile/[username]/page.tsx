/*
 * Purpose: Public user profile page.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../services/api';
import {
  User,
  MapPin,
  Calendar,
  Award,
  Globe,
  Star,
  CheckCircle2,
  ArrowLeft,
  ArrowUpRight,
  Share2,
  Trophy,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import toast from 'react-hot-toast';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface UserProfileResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
      bio?: string;
      skills: string[];
      github?: string;
      linkedin?: string;
      portfolioUrl?: string;
      innovationScore: number;
      isVerified: boolean;
      isActive: boolean;
      createdAt: string;
    };
    wins: Array<{
      id: string;
      title: string;
      score: number;
      createdAt: string;
      challenge?: {
        _id: string;
        title: string;
        category: string;
        difficulty: string;
        prizes?: { total?: number };
      };
    }>;
  };
}

export default function ProfilePage(): JSX.Element {
  const params = useParams() as { username: string };
  const router = useRouter();

  // Fetch Public Profile details using user ID, name, or email prefix lookup
  const { data: profileResponse, isLoading, error } = useQuery<UserProfileResponse['data']>({
    queryKey: ['profile', params.username],
    queryFn: async () => {
      const res = await api.get(`/api/auth/users/${params.username}`);
      return res.data.data;
    },
    retry: false
  });

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile URL copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary" />
      </div>
    );
  }

  if (error || !profileResponse) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center text-white space-y-4">
        <User className="h-16 w-16 text-slate-500" />
        <h1 className="text-2xl font-black">User Profile Not Found</h1>
        <p className="text-slate-400">The innovator details could not be found.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const { user, wins = [] } = profileResponse;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden pb-24 px-6 md:px-12 lg:px-24">
      {/* Back Button */}
      <div className="mb-8 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-x-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleShare}
          className="bg-brand-primary hover:bg-brand-primary/95 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-brand-primary/10"
        >
          <Share2 className="h-4 w-4" /> Share Profile
        </button>
      </div>

      {/* Profile Header Banner */}
      <section className="relative rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 p-8 sm:p-12 mb-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
          {/* Avatar */}
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-24 w-24 rounded-2xl object-cover border-2 border-brand-primary/20 shadow-lg shadow-brand-primary/10"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 to-cyan-500/25 text-3xl font-black text-indigo-400 border border-indigo-500/20 shadow-lg">
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}

          {/* User Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{user.name}</h1>
              {user.isVerified && (
                <span className="inline-flex items-center gap-x-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Innovator
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-sm text-slate-400">
              <span className="inline-flex items-center gap-x-1.5">
                <MapPin className="h-4 w-4 text-brand-primary" />
                Remote-only / Global
              </span>
              <span className="hidden md:inline text-slate-700">•</span>
              <span className="inline-flex items-center gap-x-1.5">
                <Calendar className="h-4 w-4 text-brand-primary" />
                Joined {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-400/10 text-cyan-400 text-xs font-bold border border-cyan-400/20">
              <Star className="h-3.5 w-3.5 fill-current" />
              Innovation Score: {user.innovationScore} pts
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column: bio & wins */}
        <div className="lg:col-span-2 space-y-8">
          <Card variant="glass" className="border-white/5 bg-[#121218] p-8">
            <h2 className="text-xl font-bold text-white mb-4">About</h2>
            <p className="text-slate-300 leading-relaxed text-sm font-light">
              {user.bio || 'No biography has been registered by this user yet.'}
            </p>
          </Card>

          <Card variant="glass" className="border-white/5 bg-[#121218] p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Winning Submissions ({wins.length})
            </h2>

            {wins.length > 0 ? (
              <div className="grid gap-4">
                {wins.map((win) => (
                  <div
                    key={win.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border border-white/5 bg-[#171721] hover:border-purple-500/25 transition duration-200"
                  >
                    <div className="space-y-1.5 max-w-lg">
                      <div className="flex items-center gap-x-2">
                        <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/20 capitalize tracking-wide">
                          {win.challenge?.category || 'Innovation'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">Score: {win.score}</span>
                      </div>
                      <h3 className="text-sm md:text-base font-semibold text-white">
                        {win.challenge?.title || 'Innovation Challenge'}
                      </h3>
                      <p className="text-xs text-slate-400 font-light">{win.title}</p>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center justify-between w-full sm:w-auto gap-x-6 border-t border-white/5 sm:border-0 pt-4 sm:pt-0">
                      {win.challenge?.prizes?.total && (
                        <div className="text-right hidden sm:block">
                          <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-500">
                            Won Prize
                          </span>
                          <span className="text-sm font-bold text-white">
                            ${win.challenge.prizes.total.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {win.challenge?._id && (
                        <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                          <Link
                            href={`/challenges/${win.challenge._id}`}
                            className="flex items-center gap-x-1 cursor-pointer"
                          >
                            Challenge <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl text-white/40 text-xs">
                No winning records yet.
              </div>
            )}
          </Card>
        </div>

        {/* Right column: skills, badges, and stats */}
        <div className="space-y-8">
          {/* Quick Resources */}
          <Card variant="glass" className="border-white/5 bg-[#121218] p-8">
            <h3 className="text-lg font-bold text-white mb-6">Resources</h3>
            <div className="space-y-3.5">
              {user.portfolioUrl ? (
                <a
                  href={user.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#171721] hover:border-brand-primary/30 text-slate-350 hover:text-white transition text-xs font-semibold"
                >
                  <span className="flex items-center gap-x-2">
                    <Globe className="h-4 w-4 text-brand-primary" /> Personal Portfolio
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <p className="text-xs text-white/40 italic">Portfolio not registered.</p>
              )}

              {/* Social profiles */}
              <div className="flex gap-2">
                {user.github && (
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 w-10 border border-white/5 bg-[#171721] hover:border-brand-primary/30 flex items-center justify-center rounded-xl transition"
                  >
                    <GithubIcon className="h-4 w-4" />
                  </a>
                )}
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 w-10 border border-white/5 bg-[#171721] hover:border-brand-primary/30 flex items-center justify-center rounded-xl transition"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </Card>

          {/* Unlocked Badges */}
          <Card variant="glass" className="border-white/5 bg-[#121218] p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-400" /> Achievements & Badges
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#171721] p-3 rounded-xl border border-white/5 text-center flex flex-col items-center">
                <Trophy className="h-8 w-8 text-amber-400 mb-1" />
                <span className="text-[10px] font-bold">First Solver</span>
                <span className="text-[9px] text-white/40 mt-0.5">Submitted project</span>
              </div>
              <div className="bg-[#171721] p-3 rounded-xl border border-white/5 text-center flex flex-col items-center">
                <Zap className="h-8 w-8 text-brand-primary mb-1" />
                <span className="text-[10px] font-bold">Green Innovator</span>
                <span className="text-[9px] text-white/40 mt-0.5">Carbon scorer</span>
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card variant="glass" className="border-white/5 bg-[#121218] p-8">
            <h3 className="text-lg font-bold text-white mb-4">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {user.skills?.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
                >
                  {skill}
                </span>
              ))}

              {(!user.skills || user.skills.length === 0) && (
                <p className="text-xs text-white/40 italic">No skills registered.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

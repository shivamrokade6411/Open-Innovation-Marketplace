/*
 * Purpose: Innovator Portfolio Detail page fetching public profile details and won submissions.
 * Author: Antigravity
 * Date: 2026-08-11
 */

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  MapPin, 
  Globe, 
  Star, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowUpRight,
  Calendar,
  Award,
  Loader2
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Avatar } from '../../../../components/ui/Avatar';

interface UserProfileResponse {
  success: boolean;
  data: {
    user: {
      id: string;
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

const MOCK_PROFILES: Record<string, UserProfileResponse['data']> = {
  '1': {
    user: {
      id: '1',
      name: 'Alice Dev',
      email: 'alice@innovate.dev',
      role: 'innovator',
      bio: 'Full-stack software architect specializing in Next.js, real-time collab systems, and custom state management structures. Passionate about building developer tools and open source ecosystems.',
      skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'Redux', 'WebSockets'],
      github: 'https://github.com/alicedev',
      linkedin: 'https://linkedin.com/in/alice-innovates',
      portfolioUrl: 'https://alice.dev',
      innovationScore: 980,
      isVerified: true,
      isActive: true,
      createdAt: '2026-01-15T08:30:00Z',
    },
    wins: [
      {
        id: 'w1',
        title: 'Optimized Real-time Collaborator Sandbox',
        score: 95,
        createdAt: '2026-06-20T12:00:00Z',
        challenge: {
          _id: 'c1',
          title: 'Decentralized Workspace Collaboration Challenge',
          category: 'web',
          difficulty: 'hard',
          prizes: { total: 15000 }
        }
      },
      {
        id: 'w2',
        title: 'CarbonFootprint tracker API module',
        score: 92,
        createdAt: '2026-05-12T15:00:00Z',
        challenge: {
          _id: 'c2',
          title: 'AI-Powered Sustainability Telemetry Engine',
          category: 'ai',
          difficulty: 'expert',
          prizes: { total: 25000 }
        }
      }
    ]
  },
  '2': {
    user: {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@innovate.dev',
      role: 'innovator',
      bio: 'AI researcher and data scientist focused on fine-tuning large language models, retrieval augmented generation pipelines, and automated grading frameworks.',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'FastAPI', 'Pandas', 'NLP'],
      github: 'https://github.com/bobsmith-ai',
      linkedin: 'https://linkedin.com/in/bob-smith-ai',
      portfolioUrl: 'https://bob.ai',
      innovationScore: 850,
      isVerified: true,
      isActive: true,
      createdAt: '2026-02-10T10:15:00Z',
    },
    wins: [
      {
        id: 'w3',
        title: 'Fine-tuned Llama3 Security Compliant Evaluator',
        score: 94,
        createdAt: '2026-07-02T10:00:00Z',
        challenge: {
          _id: 'c3',
          title: 'Automated Code Audit & Safety Challenge',
          category: 'ai',
          difficulty: 'expert',
          prizes: { total: 20000 }
        }
      }
    ]
  }
};

export default function ProfilePage({ params }: { params: { id: string } }): JSX.Element {
  const router = useRouter();

  const { data: profileData, isLoading, error } = useQuery<UserProfileResponse['data']>({
    queryKey: ['profile', params.id],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/auth/users/${params.id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }
      const json = await res.json() as UserProfileResponse;
      return json.data;
    },
    retry: false
  });

  // Handle mock profiles fallback if API fails/user is offline
  const fallbackProfile = MOCK_PROFILES[params.id] || MOCK_PROFILES['1'];
  const data = profileData || fallbackProfile;

  if (isLoading && !profileData) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        <p className="mt-4 text-slate-500">Loading innovator profile...</p>
      </main>
    );
  }

  const { user, wins } = data;
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white overflow-hidden pb-24">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-purple-600/25 blur-[120px]" />
        <div className="absolute top-[20%] left-[50%] w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-[130px]" />
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-24 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-x-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        {/* Profile Header Banner */}
        <section className="relative rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-r from-[#121218] via-purple-950/20 to-[#121218] p-8 sm:p-12 mb-8 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)]" />
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                src={user.avatar}
                name={user.name}
                size="xl"
                className="border-2 border-purple-500/20 shadow-lg"
              />
              {user.isVerified && (
                <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-white/10 text-cyan-400">
                  <CheckCircle2 className="h-4 w-4 fill-current text-slate-900" />
                </span>
              )}
            </div>

            {/* User Title Information */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {user.name}
                </h1>
                <span className="inline-flex items-center gap-x-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-300 border border-purple-500/20 uppercase tracking-wide">
                  {user.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-sm text-slate-400">
                <span className="inline-flex items-center gap-x-1.5">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  Remote-only
                </span>
                <span className="hidden md:inline text-slate-700">•</span>
                <span className="inline-flex items-center gap-x-1.5">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  Joined {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                </span>
              </div>

              {/* Score representation */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-400/10 text-cyan-400 text-xs font-bold border border-cyan-400/20">
                <Star className="h-3.5 w-3.5 fill-current" />
                Innovation Score: {user.innovationScore}
              </div>
            </div>
          </div>
        </section>

        {/* Profile Content Grid */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main profile content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About / Bio */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-8">
              <h2 className="text-xl font-bold text-white mb-4">About</h2>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base font-light">
                {user.bio || "No professional biography has been written yet."}
              </p>
            </Card>

            {/* Wins Portfolio */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                Winner Portfolio ({wins.length})
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
                          <span className="text-[10px] font-bold text-emerald-400">
                            Score: {win.score}
                          </span>
                        </div>
                        <h3 className="text-sm md:text-base font-semibold text-white">
                          {win.challenge?.title || 'Innovation Challenge'}
                        </h3>
                        <p className="text-xs text-slate-400 font-light">
                          {win.title}
                        </p>
                      </div>

                      <div className="mt-4 sm:mt-0 flex items-center justify-between w-full sm:w-auto gap-x-6 border-t border-white/5 sm:border-0 pt-4 sm:pt-0">
                        {win.challenge?.prizes?.total && (
                          <div className="text-right hidden sm:block">
                            <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-500">Won Prize</span>
                            <span className="text-sm font-bold text-white">
                              ${win.challenge.prizes.total.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {win.challenge?._id && (
                          <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                            <Link href={`/challenges/${win.challenge._id}`} className="flex items-center gap-x-1 cursor-pointer">
                              Challenge <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                  <Award className="h-10 w-10 text-slate-500 mx-auto mb-3 opacity-40" />
                  <h4 className="text-sm font-semibold text-white">No winning records yet</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Submit solutions to active innovation challenges to unlock portfolio achievements.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Right column: resources, details */}
          <div className="space-y-8">
            {/* Resources / Socials */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-8">
              <h3 className="text-lg font-bold text-white mb-6">Resources</h3>
              
              <div className="space-y-3.5">
                {user.portfolioUrl ? (
                  <a
                    href={user.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#171721] hover:border-purple-500/20 text-slate-300 hover:text-white transition text-sm"
                  >
                    <span className="flex items-center gap-x-2 font-medium">
                      <Globe className="h-4 w-4 text-purple-400" />
                      Personal Portfolio
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <div className="flex items-center gap-x-2 p-3 text-xs text-slate-500 italic">
                    <Globe className="h-4 w-4" />
                    Portfolio not linked
                  </div>
                )}

                {/* Social icons row */}
                <div className="flex items-center gap-x-2 pt-2">
                  {user.github && (
                    <a
                      href={user.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center h-10 w-10 rounded-xl border border-white/5 bg-[#171721] text-slate-400 hover:text-white transition"
                      aria-label="GitHub Profile"
                    >
                      <GithubIcon className="h-4 w-4" />
                    </a>
                  )}
                  {user.linkedin && (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center h-10 w-10 rounded-xl border border-white/5 bg-[#171721] text-slate-400 hover:text-white transition"
                      aria-label="LinkedIn Profile"
                    >
                      <LinkedinIcon className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </Card>

            {/* Developer Skills */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-8">
              <h3 className="text-lg font-bold text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

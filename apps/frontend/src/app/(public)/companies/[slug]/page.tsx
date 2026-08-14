/*
 * Purpose: Company Profile Detail page with challenges, stats, and winners.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import Link from 'next/link';
import { Metadata } from 'next';
import {
  Building2,
  MapPin,
  Globe,
  Star,
  CheckCircle2,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Users,
  Eye,
  Percent
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';

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

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

interface PageProps {
  params: {
    slug: string;
  };
}

interface CompanyDetailResponse {
  success: boolean;
  data: {
    company: {
      _id: string;
      companyName: string;
      logo?: string;
      cover?: string;
      description?: string;
      industry?: string;
      website?: string;
      size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
      location?: string;
      verificationStatus: 'pending' | 'verified' | 'rejected';
      totalChallenges: number;
      totalHires: number;
      rating: number;
      socialLinks: Record<string, string>;
      createdAt: string;
    };
    challenges: Array<{
      _id: string;
      title: string;
      description: string;
      category: string;
      difficulty: string;
      status: 'active' | 'completed' | 'draft';
      prizes: {
        total?: number;
      };
      deadline: string;
    }>;
    winners: Array<{
      _id: string;
      userId: {
        _id: string;
        name: string;
        avatar?: string;
      };
      challengeId: {
        title: string;
      };
    }>;
    stats: {
      totalViews: number;
      totalSubmissions: number;
      activeCount: number;
      completedCount: number;
    };
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';
  try {
    const res = await fetch(`${backendUrl}/api/companies/${params.slug}`);
    if (res.ok) {
      const json = (await res.json()) as CompanyDetailResponse;
      if (json.success && json.data.company) {
        return {
          title: `${json.data.company.companyName} - Company Profile`,
          description:
            json.data.company.description ||
            `View company profile, active challenges, and previous winners of ${json.data.company.companyName} on Open Innovation Marketplace.`
        };
      }
    }
  } catch (err) {
    console.error('Error generating metadata:', err);
  }
  return {
    title: 'Company Profile - Open Innovation Marketplace',
    description: 'Explore leading companies and enterprise innovators driving challenges.'
  };
}

export default async function CompanyProfilePage({ params }: PageProps): Promise<JSX.Element> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';
  let companyData: CompanyDetailResponse['data'] | null = null;
  let fetchError = false;

  try {
    const res = await fetch(`${backendUrl}/api/companies/${params.slug}`, { cache: 'no-store' });
    if (res.ok) {
      const json = (await res.json()) as CompanyDetailResponse;
      if (json.success && json.data.company) {
        companyData = json.data;
      }
    } else {
      fetchError = true;
    }
  } catch (err) {
    console.error('Error fetching company:', err);
    fetchError = true;
  }

  if (fetchError || !companyData) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center flex flex-col items-center justify-center min-h-[60vh] text-white">
        <Building2 className="h-16 w-16 text-slate-500 mb-4" />
        <h1 className="text-3xl font-extrabold">Company Profile Not Found</h1>
        <p className="mt-4 text-slate-400">
          The company you are looking for does not exist or has been removed from our directories.
        </p>
        <Button asChild className="mt-8">
          <Link href="/companies" className="flex items-center gap-x-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Companies
          </Link>
        </Button>
      </main>
    );
  }

  const { company, challenges, winners = [], stats } = companyData;

  const activeChallenges = challenges.filter((c) => c.status === 'active');
  const completedChallenges = challenges.filter((c) => c.status === 'completed');

  const initials = company.companyName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-white space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-x-1.5 text-sm font-medium text-slate-450 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
      </div>

      {/* Cover and header block */}
      <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-slate-900 shadow-2xl">
        {/* Cover Image or Gradient fallback */}
        {company.cover ? (
          <div className="h-48 w-full overflow-hidden">
            <img src={company.cover} alt="Cover image" className="h-full w-full object-cover opacity-75" />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-r from-brand-primary/20 via-purple-950/20 to-slate-900" />
        )}

        {/* Profile details block */}
        <div className="p-8 sm:p-10 -mt-16 relative flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Company Logo */}
          {company.logo ? (
            <img
              src={company.logo}
              alt={`${company.companyName} logo`}
              className="h-28 w-28 rounded-2xl object-cover border-4 border-slate-900 shadow-xl"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 to-cyan-500/25 text-4xl font-black text-indigo-400 border-4 border-slate-900 shadow-xl">
              {initials}
            </div>
          )}

          {/* Info details */}
          <div className="flex-1 text-center sm:text-left space-y-2 pb-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-3xl font-black tracking-tight text-white">{company.companyName}</h1>
              {company.verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-x-1 rounded-full bg-brand-primary/20 px-2.5 py-0.5 text-xs font-semibold text-brand-primary border border-brand-primary/30">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Partner
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-white/60">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-4 w-4 text-brand-primary" /> {company.industry || 'Tech / Innovation'}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4 text-brand-primary" /> {company.location || 'Global / Remote'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content split grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side: About & Challenges */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-3">
            <h2 className="text-xl font-bold">About</h2>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
              {company.description || 'No description provided by the company.'}
            </p>
          </div>

          {/* Active Challenges tab section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-primary" /> Active Challenges ({activeChallenges.length})
            </h2>

            {activeChallenges.length > 0 ? (
              <div className="grid gap-4">
                {activeChallenges.map((challenge) => (
                  <div
                    key={challenge._id}
                    className="p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition"
                  >
                    <div>
                      <span className="bg-brand-primary/20 text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {challenge.category}
                      </span>
                      <h3 className="font-bold text-base text-white mt-2">{challenge.title}</h3>
                      <p className="text-xs text-white/50 line-clamp-1 mt-1">{challenge.description}</p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 w-full sm:w-auto justify-between border-t border-white/5 sm:border-0 pt-3 sm:pt-0">
                      {challenge.prizes.total && (
                        <span className="text-emerald-400 font-black text-sm flex items-center">
                          <DollarSign className="h-3.5 w-3.5" /> {challenge.prizes.total.toLocaleString()}
                        </span>
                      )}
                      <Link
                        href={`/challenges/${challenge._id}`}
                        className="rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 text-xs font-semibold flex items-center gap-1"
                      >
                        View Challenge <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 italic py-2">No active challenges acceptor.</p>
            )}
          </div>

          {/* Completed Challenges section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-primary" /> Completed Challenges ({completedChallenges.length})
            </h2>

            {completedChallenges.length > 0 ? (
              <div className="grid gap-4">
                {completedChallenges.map((challenge) => (
                  <div
                    key={challenge._id}
                    className="p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition opacity-80"
                  >
                    <div>
                      <span className="bg-white/10 text-white/60 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        Closed
                      </span>
                      <h3 className="font-bold text-base text-white/90 mt-2">{challenge.title}</h3>
                      <p className="text-xs text-white/40 line-clamp-1 mt-1">{challenge.description}</p>
                    </div>
                    <Link
                      href={`/challenges/${challenge._id}`}
                      className="rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 text-xs font-semibold flex items-center gap-1 shrink-0"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 italic py-2">No past completed challenges.</p>
            )}
          </div>
        </div>

        {/* Right Side: Resources, Stats, and Winners */}
        <div className="space-y-8">
          {/* Resources */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white/50">Resources</h3>
            <div className="space-y-3">
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-900/60 hover:bg-slate-900 hover:border-brand-primary/30 transition text-xs font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-brand-primary" /> Official Website
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-white/40" />
                </a>
              ) : (
                <p className="text-xs text-white/40 italic">Website not registered.</p>
              )}

              {/* Social profiles row */}
              <div className="flex gap-2">
                {company.socialLinks?.twitter && (
                  <a
                    href={company.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 w-10 border border-white/5 bg-slate-900/60 hover:border-brand-primary/30 flex items-center justify-center rounded-xl transition"
                  >
                    <TwitterIcon className="h-4 w-4" />
                  </a>
                )}
                {company.socialLinks?.linkedin && (
                  <a
                    href={company.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 w-10 border border-white/5 bg-slate-900/60 hover:border-brand-primary/30 flex items-center justify-center rounded-xl transition"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                  </a>
                )}
                {company.socialLinks?.github && (
                  <a
                    href={company.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 w-10 border border-white/5 bg-slate-900/60 hover:border-brand-primary/30 flex items-center justify-center rounded-xl transition"
                  >
                    <GithubIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Past Statistics */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white/50">Past Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-white/5 text-center">
                <Users className="h-5 w-5 text-brand-primary mx-auto mb-2" />
                <span className="block text-[10px] text-white/40 uppercase tracking-wider font-bold">Submissions</span>
                <span className="text-lg font-black">{stats.totalSubmissions}</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-white/5 text-center">
                <Eye className="h-5 w-5 text-brand-primary mx-auto mb-2" />
                <span className="block text-[10px] text-white/40 uppercase tracking-wider font-bold">Views</span>
                <span className="text-lg font-black">{stats.totalViews}</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-white/5 text-center">
                <Award className="h-5 w-5 text-brand-primary mx-auto mb-2" />
                <span className="block text-[10px] text-white/40 uppercase tracking-wider font-bold">Closed Tasks</span>
                <span className="text-lg font-black">{stats.completedCount}</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-white/5 text-center">
                <Percent className="h-5 w-5 text-brand-primary mx-auto mb-2" />
                <span className="block text-[10px] text-white/40 uppercase tracking-wider font-bold">Conversion</span>
                <span className="text-lg font-black">
                  {stats.totalViews > 0
                    ? Math.round((stats.totalSubmissions / stats.totalViews) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Winners Showcase */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white/50 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-400" /> Challenge Winners
            </h3>
            <div className="space-y-4">
              {winners.map((win) => (
                <div key={win._id} className="flex gap-3 text-xs items-center">
                  {win.userId?.avatar ? (
                    <img src={win.userId.avatar} alt="Winner avatar" className="h-8 w-8 rounded-full border border-white/10 object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0 font-bold uppercase">
                      {win.userId?.name?.charAt(0) || 'W'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-white">{win.userId?.name || 'Anonymous Solver'}</h4>
                    <p className="text-[10px] text-white/50 truncate max-w-[180px]">
                      Won: {win.challengeId?.title}
                    </p>
                  </div>
                </div>
              ))}

              {winners.length === 0 && (
                <p className="text-xs text-white/40 text-center py-2">No winners announced yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

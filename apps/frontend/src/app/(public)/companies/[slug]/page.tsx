/*
 * Purpose: Company Profile Detail page.
 * Author: Antigravity
 * Date: 2026-08-02
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
  DollarSign
} from 'lucide-react';

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
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';

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
      prizes: {
        total?: number;
      };
      deadline: string;
    }>;
  };
}

// Generate dynamic metadata for the page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';
  try {
    const res = await fetch(`${backendUrl}/api/companies/${params.slug}`);
    if (res.ok) {
      const json = await res.json() as CompanyDetailResponse;
      if (json.success && json.data.company) {
        return {
          title: `${json.data.company.companyName} - Company Profile`,
          description: json.data.company.description || `View company profile and active challenges of ${json.data.company.companyName} on Open Innovation Marketplace.`
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
      const json = await res.json() as CompanyDetailResponse;
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
      <main className="mx-auto max-w-xl px-4 py-24 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Building2 className="h-16 w-16 text-slate-500 mb-4" />
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Company Profile Not Found</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
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

  const { company, challenges } = companyData;

  const initials = company.companyName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          href="/companies" 
          className="inline-flex items-center gap-x-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
      </div>

      {/* Header Banner Section */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/60 dark:border-white/5 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-8 sm:p-12 mb-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.1),transparent_40%)]" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
          {/* Company Logo / Avatar */}
          {company.logo ? (
            <img
              src={company.logo}
              alt={`${company.companyName} logo`}
              className="h-24 w-24 rounded-2xl object-cover border-2 border-indigo-500/20 shadow-lg shadow-indigo-500/10"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 to-cyan-500/25 text-3xl font-black text-indigo-400 dark:text-cyan-400 border border-indigo-500/20 shadow-lg">
              {initials}
            </div>
          )}

          {/* Info Header */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {company.companyName}
              </h1>
              {company.verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-x-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Partner
                </span>
              )}
            </div>

            {/* Quick Badges Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-sm text-slate-350 dark:text-slate-400">
              <span className="inline-flex items-center gap-x-1.5 capitalize">
                <Building2 className="h-4 w-4 text-indigo-400" />
                {company.industry || 'General Industry'}
              </span>
              <span className="hidden md:inline text-slate-650">•</span>
              <span className="inline-flex items-center gap-x-1.5">
                <MapPin className="h-4 w-4 text-indigo-400" />
                {company.location || 'Remote'}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center md:justify-start gap-x-1">
              {Array.from({ length: 5 }, (_, i) => {
                const filled = i < Math.floor(company.rating);
                return (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${filled ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} 
                  />
                );
              })}
              <span className="ml-2 text-sm font-semibold text-white">{company.rating.toFixed(1)} / 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Page Layout Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Columns - Details & Active Challenges */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Card */}
          <Card variant="glass" className="border-indigo-500/10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About</h2>
            <p className="text-base leading-7 text-slate-650 dark:text-slate-300">
              {company.description || 'No description provided by the company.'}
            </p>
          </Card>

          {/* Active Challenges Card */}
          <Card variant="glass" className="border-indigo-500/10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Active Challenges ({challenges.length})
            </h2>
            
            {challenges.length > 0 ? (
              <div className="grid gap-4">
                {challenges.map((challenge) => {
                  const deadlineDate = new Date(challenge.deadline);
                  const isExpired = deadlineDate.getTime() < Date.now();
                  return (
                    <div 
                      key={challenge._id} 
                      className="group/item flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border border-slate-200/50 bg-white/40 dark:border-white/5 dark:bg-slate-950/20 hover:border-indigo-500/30 transition-all duration-200"
                    >
                      <div className="space-y-1.5 max-w-lg">
                        <div className="flex items-center gap-x-2.5">
                          <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20 capitalize">
                            {challenge.category}
                          </span>
                          <span className="text-xs text-slate-400 capitalize">
                            {challenge.difficulty}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover/item:text-indigo-400 dark:group-hover/item:text-cyan-400 transition-colors">
                          {challenge.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {challenge.description}
                        </p>
                      </div>

                      <div className="mt-4 sm:mt-0 flex items-center justify-between w-full sm:w-auto gap-x-6 border-t border-slate-100 sm:border-0 pt-4 sm:pt-0">
                        {/* Prize Pool */}
                        {challenge.prizes.total && (
                          <div className="text-right hidden sm:block">
                            <span className="block text-[10px] uppercase tracking-wider text-slate-500">Prize Pool</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-x-0.5">
                              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                              {challenge.prizes.total.toLocaleString()}
                            </span>
                          </div>
                        )}

                        <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                          <Link href={`/challenges/${challenge._id}`} className="flex items-center gap-x-1.5">
                            View Challenge
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50/10 dark:bg-slate-950/10 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                <Building2 className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">No active challenges</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This company has no challenges accepting submissions right now.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar Column - Resource Links & Analytics */}
        <div className="space-y-8">
          {/* Quick Info & Resource Links */}
          <Card variant="glass" className="border-indigo-500/10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Resources</h3>
            
            <div className="space-y-3.5">
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-500/30 text-slate-700 hover:text-indigo-500 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:text-cyan-400 transition-all text-sm"
                >
                  <span className="flex items-center gap-x-2 font-medium">
                    <Globe className="h-4 w-4" />
                    Official Website
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <div className="flex items-center gap-x-2 p-3 text-sm text-slate-400 italic">
                  <Globe className="h-4 w-4" />
                  Website not provided
                </div>
              )}

              {/* Social Links Row */}
              <div className="flex items-center gap-x-2 pt-2">
                {company.socialLinks.twitter && (
                  <a
                    href={company.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-650 hover:text-indigo-500 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:text-cyan-400 transition-all"
                    aria-label="Twitter Profile"
                  >
                    <TwitterIcon className="h-4 w-4" />
                  </a>
                )}
                {company.socialLinks.linkedin && (
                  <a
                    href={company.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-650 hover:text-indigo-500 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:text-cyan-400 transition-all"
                    aria-label="LinkedIn Profile"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                  </a>
                )}
                {company.socialLinks.github && (
                  <a
                    href={company.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-650 hover:text-indigo-500 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:text-cyan-400 transition-all"
                    aria-label="GitHub Profile"
                  >
                    <GithubIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </Card>

          {/* Quick Stats Card */}
          <Card variant="glass" className="border-indigo-500/10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 dark:bg-slate-950/20 dark:border-white/5">
                <span className="block text-[10px] uppercase font-bold text-slate-500">Challenges</span>
                <span className="mt-1 block text-xl font-bold text-slate-900 dark:text-white">
                  {company.totalChallenges}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 dark:bg-slate-950/20 dark:border-white/5">
                <span className="block text-[10px] uppercase font-bold text-slate-500">Hires / Placements</span>
                <span className="mt-1 block text-xl font-bold text-slate-900 dark:text-white">
                  {company.totalHires}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 dark:bg-slate-950/20 dark:border-white/5 col-span-2">
                <span className="block text-[10px] uppercase font-bold text-slate-500">Organization Size</span>
                <span className="mt-1 block text-sm font-semibold text-slate-900 dark:text-white capitalize">
                  {company.size || 'Unspecified'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

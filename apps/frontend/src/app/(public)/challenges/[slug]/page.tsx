/*
 * Purpose: Public Challenge Detail page retrieving challenges by slug from PostgreSQL database.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '../../../../lib/prisma';
import {
  Trophy,
  Calendar,
  Award,
  Globe,
  Star,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MapPin,
  FileText,
  Lightbulb,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Countdown } from '../../../../components/challenges/Countdown';
import { SaveChallengeButton } from '../../../../components/challenges/SaveChallengeButton';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate dynamic SEO and OpenGraph metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let challenge = await prisma.challenge.findUnique({
    where: { slug: params.slug },
    include: { company: true }
  });

  if (!challenge) {
    challenge = await prisma.challenge.findUnique({
      where: { id: params.slug },
      include: { company: true }
    });
  }

  if (!challenge) {
    return {
      title: 'Challenge Not Found | Open Innovation Marketplace',
      description: 'The requested challenge could not be found.'
    };
  }

  const titleText = `${challenge.title} | Open Innovation Marketplace`;
  const descriptionText = `Compete in the ${challenge.title} challenge sponsored by ${challenge.company.name} and win from a prize pool of $${challenge.prizePool.toLocaleString()}!`;

  return {
    title: titleText,
    description: descriptionText,
    openGraph: {
      title: titleText,
      description: descriptionText,
      type: 'website',
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/challenges/${challenge.slug}`,
      images: [
        {
          url: challenge.company.coverImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60',
          width: 800,
          height: 600,
          alt: challenge.title
        }
      ]
    }
  };
}

export default async function ChallengeSlugPage({ params }: PageProps): Promise<JSX.Element> {
  let challenge = await prisma.challenge.findUnique({
    where: { slug: params.slug },
    include: {
      company: true,
      timeline: {
        orderBy: { date: 'asc' }
      },
      prizes: {
        orderBy: { place: 'asc' }
      },
      skills: {
        include: {
          skill: true
        }
      }
    }
  });

  if (!challenge) {
    const legacyChallenge = await prisma.challenge.findUnique({
      where: { id: params.slug }
    });
    if (legacyChallenge) {
      redirect(`/challenges/${legacyChallenge.slug}`);
    }
    notFound();
  }

  const deadlineDate = new Date(challenge.submissionDeadline);
  const now = new Date();
  const isOver = deadlineDate.getTime() <= now.getTime();

  // Determine visual badge status
  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'Active';
      case 'submission_closed':
        return 'Judging';
      case 'completed':
        return 'Closed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  const getStatusColor = (status: string) => {
    if (isOver || status.toLowerCase() === 'completed') {
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'judging':
      case 'submission_closed':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  // Structured Schema.org JSON-LD data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: challenge.title,
    description: challenge.description,
    dateCreated: challenge.createdAt.toISOString(),
    expires: challenge.submissionDeadline.toISOString(),
    provider: {
      '@type': 'Organization',
      name: challenge.company.name,
      url: challenge.company.website
    },
    offers: {
      '@type': 'Offer',
      price: challenge.prizePool,
      priceCurrency: 'USD'
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white overflow-hidden pb-24">
      {/* Dynamic JSON-LD structured metadata */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute top-[20%] left-[50%] w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-[130px]" />
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-20 relative z-10 space-y-10">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            ← Back to challenges
          </Link>
        </div>

        {/* Hero Section Card */}
        <section className="relative rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-r from-slate-900 via-purple-950/10 to-slate-900 p-8 sm:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.08),transparent_50%)]" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 z-10">
            {/* Header left: info */}
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusColor(challenge.status)}`}>
                  {getStatusLabel(challenge.status)}
                </span>
                {challenge.company.verified && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified Partner
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                {challenge.title}
              </h1>

              {/* Sponsor Logo Info */}
              <div className="flex items-center gap-3 pt-2">
                {challenge.company.logo ? (
                  <img
                    src={challenge.company.logo}
                    alt={challenge.company.name}
                    className="h-10 w-10 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/10 text-sm font-bold flex items-center justify-center">
                    {challenge.company.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Sponsored By</span>
                  <Link
                    href={`/companies/${challenge.company.slug}`}
                    className="text-sm font-bold text-white hover:underline hover:text-brand-primary transition"
                  >
                    {challenge.company.name}
                  </Link>
                </div>
              </div>
            </div>

            {/* Header Right: Prize Pool Highlight */}
            <div className="bg-gradient-to-br from-brand-primary to-purple-600 rounded-3xl p-6 shadow-xl shadow-brand-primary/10 text-center min-w-[200px] w-full lg:w-auto">
              <span className="block text-xs uppercase tracking-widest font-bold opacity-80 text-white">Total Prize Pool</span>
              <span className="block text-3xl sm:text-4xl font-black text-white mt-1.5">${challenge.prizePool.toLocaleString()}</span>
              <span className="block text-[10px] text-white/70 mt-1 uppercase font-bold tracking-wider">Distributed to top solvers</span>
            </div>
          </div>
        </section>

        {/* Content Section Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Main Info Blocks (Left 8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Overview / Descriptions */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-brand-primary" /> Challenge Overview
                </h2>
                <p className="text-slate-300 leading-relaxed text-sm font-light whitespace-pre-line">
                  {challenge.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-amber-400" /> Problem Statement
                </h3>
                <p className="text-slate-350 leading-relaxed text-sm font-light whitespace-pre-line bg-white/[0.01] p-5 rounded-2xl border border-white/5">
                  {challenge.problemStatement}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Expected Deliverables
                </h3>
                <p className="text-slate-350 leading-relaxed text-sm font-light whitespace-pre-line">
                  {challenge.expectedSolution}
                </p>
              </div>
            </Card>

            {/* Timeline Milestones */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-8 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-primary" /> Challenge Timeline
              </h2>

              <div className="relative pl-6 border-l-2 border-white/10 space-y-8 py-2">
                {challenge.timeline.length > 0 ? (
                  challenge.timeline.map((mile, idx) => (
                    <div key={mile.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-brand-primary bg-slate-950 flex items-center justify-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      </span>
                      <div>
                        <span className="text-xs font-bold text-brand-primary block">
                          {new Date(mile.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{mile.title}</h4>
                        {mile.description && <p className="text-xs text-slate-400 mt-1">{mile.description}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic">No custom milestones registered yet.</div>
                )}
              </div>
            </Card>

            {/* Rules & Guidelines */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-8 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/5 pb-4">
                <HelpCircle className="h-5 w-5 text-brand-primary" /> Eligibility & Guidelines
              </h2>

              <div className="space-y-4 text-sm font-light">
                {challenge.eligibility && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Eligibility</h4>
                    <p className="text-slate-350 leading-relaxed">{challenge.eligibility}</p>
                  </div>
                )}

                {challenge.submissionGuidelines && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Submission Guidelines</h4>
                    <p className="text-slate-350 leading-relaxed">{challenge.submissionGuidelines}</p>
                  </div>
                )}

                {challenge.judgingCriteria && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Judging & Evaluation Criteria</h4>
                    <p className="text-slate-350 leading-relaxed">{challenge.judgingCriteria}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar parameters (Right 4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Live Countdown & Interactive Actions */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-8 space-y-6">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">Time Remaining</span>
                <Countdown deadline={challenge.submissionDeadline} />
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3.5 text-xs text-slate-400 font-semibold">
                <div className="flex justify-between">
                  <span>Registration Deadline</span>
                  <span className="text-white">
                    {new Date(challenge.registrationDeadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Submission Closes</span>
                  <span className="text-white">
                    {new Date(challenge.submissionDeadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Winner Announcement</span>
                  <span className="text-white">
                    {new Date(challenge.winnerAnnouncement).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button asChild className="w-full h-10 text-xs font-bold">
                  <Link href={`/challenges/${challenge.slug}/submit`}>
                    Submit Solution
                  </Link>
                </Button>
                <SaveChallengeButton slug={challenge.slug} />
              </div>
            </Card>

            {/* Place-wise Prize Breakdown */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Prize Distribution</h3>
              <div className="space-y-3">
                {challenge.prizes.length > 0 ? (
                  challenge.prizes.map((p, index) => {
                    const iconColor =
                      p.place === 1
                        ? 'text-amber-400'
                        : p.place === 2
                        ? 'text-slate-300'
                        : 'text-amber-700';
                    return (
                      <div
                        key={p.id}
                        className="flex justify-between items-center p-3 bg-[#171721] rounded-xl border border-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <Award className={`h-4.5 w-4.5 ${iconColor}`} />
                          <span className="text-xs font-bold text-white">Place {p.place}</span>
                        </div>
                        <span className="text-sm font-extrabold text-white">${p.amount.toLocaleString()}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-500 italic">No prize details declared.</div>
                )}
              </div>
            </Card>

            {/* Target Skills & Tech stack */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Required Skills & Tech Stack</h3>

              <div className="flex flex-wrap gap-2">
                {challenge.skills.map((s) => (
                  <span
                    key={s.id}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  >
                    {s.skill.name}
                  </span>
                ))}

                {challenge.skills.length === 0 && (
                  <span className="text-xs text-slate-500 italic">No skill tags registered.</span>
                )}
              </div>
            </Card>

            {/* Sponsor Info */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">About the Sponsor</h3>
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">{challenge.company.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{challenge.company.description}</p>
                {challenge.company.website && (
                  <a
                    href={challenge.company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-brand-primary hover:underline inline-flex items-center gap-1"
                  >
                    Visit Website <ArrowRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

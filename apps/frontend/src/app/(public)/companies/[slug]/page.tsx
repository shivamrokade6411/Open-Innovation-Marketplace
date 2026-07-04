/*
 * Purpose: Dynamic company profile detail page.
 * Author: Antigravity Pair Programmer
 * Date: 2026-07-04
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Award, Calendar } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  prize: string;
  deadline: string;
}

interface CompanyProfile {
  name: string;
  description: string;
  fullBio: string;
  tags: string[];
  challenges: Challenge[];
}

const COMPANY_DB: Record<string, CompanyProfile> = {
  'innotech-solutions': {
    name: 'InnoTech Solutions',
    description: 'Empowering enterprise digital transformation through scalable AI agent networks and robust cloud integrations.',
    fullBio: 'InnoTech Solutions is a global leader in enterprise middleware, cloud native pipelines, and artificial intelligence solutions. Founded with a vision to streamline multi-agent workflows, InnoTech provides scalable tools and SDKs that bridge the gap between traditional architectures and decentralized, autonomous systems.',
    tags: ['Artificial Intelligence', 'Cloud Infrastructure', 'Enterprise'],
    challenges: [
      { id: 'c1', title: 'Enterprise AI Agent Code Optimization Hackathon', prize: '$15,000 USD', deadline: 'August 15, 2026' },
      { id: 'c2', title: 'High-Throughput WebSockets Connection Challenge', prize: '$10,000 USD', deadline: 'September 1, 2026' }
    ]
  },
  'cryptovault-labs': {
    name: 'CryptoVault Labs',
    description: 'Pioneering the future of secure, decentralized key management and institutional-grade escrow protocols.',
    fullBio: 'CryptoVault Labs designs next-generation security hardware models, multi-party computation (MPC) modules, and automated trust architectures. Our platform serves institutional clients seeking mathematically guaranteed compliance and absolute data integrity across borderless networks.',
    tags: ['Blockchain', 'Security', 'Cryptography'],
    challenges: [
      { id: 'c3', title: 'Zero-Knowledge Proof Verification Optimization', prize: '$30,000 USD', deadline: 'August 30, 2026' },
      { id: 'c4', title: 'MPC Key Share Fragmentation Cryptographic Audit', prize: '$20,000 USD', deadline: 'September 20, 2026' }
    ]
  },
  'biosynthetix': {
    name: 'BioSynthetix',
    description: 'Accelerating computational drug discovery and genetic sequencing platforms using advanced ML model pipelines.',
    fullBio: 'BioSynthetix unites molecular biologists with machine learning engineers to solve the most demanding genomics challenges. Our proprietary sequencing analysis platforms cut down drug formulation timeline latency, empowering public health labs and clinical researchers around the globe.',
    tags: ['Biotech', 'Machine Learning', 'HealthTech'],
    challenges: [
      { id: 'c5', title: 'Protein Folding Structural Prediction Pipeline', prize: '$25,000 USD', deadline: 'October 1, 2026' }
    ]
  },
  'apex-autonomous': {
    name: 'Apex Autonomous',
    description: 'Building next-generation simulation modeling environments for autonomous vehicle fleets and drones.',
    fullBio: 'Apex Autonomous builds software that powers precision simulation models. By combining high-fidelity graphics engines with real-time physical telemetry feedback, Apex assists vehicle operators in pre-training complex navigation controllers inside safe virtual sandbox environments.',
    tags: ['Robotics', 'Simulation', 'Automotive'],
    challenges: [
      { id: 'c6', title: '3D Point Cloud Segmentation Edge Model Design', prize: '$18,000 USD', deadline: 'October 15, 2026' }
    ]
  },
  'greenpulse-energy': {
    name: 'GreenPulse Energy',
    description: 'Providing real-time telemetry analytics and smart grid optimization algorithms for solar power plants.',
    fullBio: 'GreenPulse Energy makes smart energy visible. Our hardware modules attach to standard power substations, feeding edge sensor telemetry to predictive grid balancing engines that dynamically prevent transmission overloads during spike production hours.',
    tags: ['CleanTech', 'IoT', 'Analytics'],
    challenges: [
      { id: 'c7', title: 'Microgrid Solar Telemetry Load Forecasting Engine', prize: '$12,000 USD', deadline: 'November 1, 2026' }
    ]
  }
};

interface PageProps {
  params: {
    slug: string;
  };
}

export default function CompanyDetailPage({ params }: PageProps): JSX.Element {
  const profile = COMPANY_DB[params.slug];

  if (!profile) {
    notFound();
  }

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation back */}
        <Link
          href="/companies"
          className="inline-flex items-center gap-x-2 text-sm text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to companies
        </Link>

        {/* Profile Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-200/50 dark:border-white/5 pb-8">
          <div className="flex items-center gap-x-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-xl font-bold text-indigo-500 dark:text-cyan-400 border border-indigo-500/10 shadow-sm">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {profile.name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Company Bio */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">About the Company</h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-350">
            {profile.fullBio}
          </p>
        </div>

        {/* Active Challenges list */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Active Innovation Challenges</h2>
          {profile.challenges.length > 0 ? (
            <div className="mt-6 space-y-4">
              {profile.challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/50 bg-slate-50/30 p-5 dark:border-white/5 dark:bg-slate-950/20 hover:border-indigo-500/20 transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {challenge.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-indigo-500 dark:text-cyan-400" />
                        {challenge.prize}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500 dark:text-cyan-400" />
                        Deadline: {challenge.deadline}
                      </span>
                    </div>
                  </div>
                  <button className="mt-4 sm:mt-0 inline-flex items-center gap-x-1 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400">
                    View Challenge
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 italic">
              No active challenges from this company at the moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

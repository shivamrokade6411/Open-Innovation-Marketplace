/*
 * Purpose: Companies directory page listing and search.
 * Author: Antigravity Pair Programmer
 * Date: 2026-07-04
 */

import type { Metadata } from 'next';
import { CompanyGrid } from '../../../components/companies/CompanyGrid';
import type { Company } from '../../../components/companies/CompanyCard';

export const metadata: Metadata = {
  title: 'Companies - Open Innovation Marketplace',
  description: 'Explore leading companies and enterprise innovators driving challenges and developer ecosystem programs.'
};

const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'InnoTech Solutions',
    description: 'Empowering enterprise digital transformation through scalable AI agent networks and robust cloud integrations.',
    tags: ['Artificial Intelligence', 'Cloud Infrastructure', 'Enterprise'],
    slug: 'innotech-solutions'
  },
  {
    id: '2',
    name: 'CryptoVault Labs',
    description: 'Pioneering the future of secure, decentralized key management and institutional-grade escrow protocols.',
    tags: ['Blockchain', 'Security', 'Cryptography'],
    slug: 'cryptovault-labs'
  },
  {
    id: '3',
    name: 'BioSynthetix',
    description: 'Accelerating computational drug discovery and genetic sequencing platforms using advanced ML model pipelines.',
    tags: ['Biotech', 'Machine Learning', 'HealthTech'],
    slug: 'biosynthetix'
  },
  {
    id: '4',
    name: 'Apex Autonomous',
    description: 'Building next-generation simulation modeling environments for autonomous vehicle fleets and drones.',
    tags: ['Robotics', 'Simulation', 'Automotive'],
    slug: 'apex-autonomous'
  },
  {
    id: '5',
    name: 'GreenPulse Energy',
    description: 'Providing real-time telemetry analytics and smart grid optimization algorithms for solar power plants.',
    tags: ['CleanTech', 'IoT', 'Analytics'],
    slug: 'greenpulse-energy'
  }
];

export default async function CompaniesPage(): Promise<JSX.Element> {
  let companies: Company[] = [];
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/api/companies`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        companies = json.data.map((c: any) => ({
          id: String(c._id),
          name: c.companyName,
          logoUrl: c.logo,
          description: c.description || '',
          tags: [c.industry].filter(Boolean),
          slug: c.slug || ''
        }));
      }
    }
  } catch (err) {
    console.error('Failed to fetch companies:', err);
  }

  const displayCompanies = companies.length > 0 ? companies : MOCK_COMPANIES;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Companies
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
          Partner with leading industry organizations, corporate sponsors, and high-growth startups launching innovation challenges.
        </p>
        <div className="mt-12">
          <CompanyGrid initialCompanies={displayCompanies} />
        </div>
      </div>
    </div>
  );
}

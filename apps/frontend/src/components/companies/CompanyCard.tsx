/*
 * Purpose: Single company card component.
 * Author: Antigravity Pair Programmer
 * Date: 2026-07-04
 */

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  tags: string[];
  slug: string;
}

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps): JSX.Element {
  const initials = company.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-glow dark:border-white/5 dark:bg-slate-950/40">
      <div>
        {/* Header containing Logo / Initials & Title */}
        <div className="flex items-center gap-x-4">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={`${company.name} logo`}
              className="h-12 w-12 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-sm font-bold text-indigo-500 dark:text-cyan-400 border border-indigo-500/10">
              {initials}
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold leading-7 tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-cyan-400 transition-colors">
              {company.name}
            </h3>
          </div>
        </div>

        {/* Short description */}
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400 line-clamp-3">
          {company.description}
        </p>

        {/* Pill tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {company.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
        <Link
          href={`/companies/${company.slug}`}
          className="inline-flex items-center gap-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          View Profile
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}

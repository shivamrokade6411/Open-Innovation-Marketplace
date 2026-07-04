/*
 * Purpose: Grid wrapper component that lists and filters companies.
 * Author: Antigravity Pair Programmer
 * Date: 2026-07-04
 */

'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { CompanyCard, Company } from './CompanyCard';

interface CompanyGridProps {
  initialCompanies: Company[];
}

export function CompanyGrid({ initialCompanies }: CompanyGridProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter companies based on search query matching name or tags
  const filteredCompanies = initialCompanies.filter((company) => {
    const query = searchQuery.toLowerCase();
    const matchesName = company.name.toLowerCase().includes(query);
    const matchesTags = company.tags.some((tag) => tag.toLowerCase().includes(query));
    return matchesName || matchesTags;
  });

  return (
    <div className="space-y-8">
      {/* Search Input Filter */}
      <div className="relative max-w-md rounded-2xl shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/5 dark:bg-slate-950/40 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
          placeholder="Filter by company name or industry..."
        />
      </div>

      {/* Grid or Empty State */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center dark:border-white/5 bg-slate-50/10 dark:bg-slate-950/10">
          <svg
            className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No companies found</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search criteria or clear the input to see all companies.
          </p>
        </div>
      )}
    </div>
  );
}

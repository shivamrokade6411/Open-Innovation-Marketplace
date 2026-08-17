/*
 * Purpose: Challenge discovery page with filtering, sorting, pagination, and listings.
 * Author: Antigravity Pair Programmer
 * Date: 2026-07-05
 */

'use client';

import { useState, useEffect } from 'react';
import { ChallengeCard } from '../../../components/challenges/ChallengeCard';
import type { IChallenge } from '@oim/shared';
import { Search, Filter, RefreshCw, Globe, Award, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '../../../lib/utils';

const SkeletonCard = () => (
  <div className="rounded-2xl p-6 bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-lg space-y-6 animate-pulse flex flex-col justify-between h-[320px]">
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-[72px] w-[110px] bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
      <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
    </div>
    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
      <div className="flex gap-2">
        <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  </div>
);

export default function ChallengesPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minPrize, setMinPrize] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [industry, setIndustry] = useState<string>('all');
  const [company, setCompany] = useState<string>('');
  const [skill, setSkill] = useState<string>('');

  // Interactive UI States
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize state from URL query parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('search')) setSearch(params.get('search') || '');
      if (params.get('category')) setSelectedCategory(params.get('category') || 'all');
      if (params.get('industry')) setIndustry(params.get('industry') || 'all');
      if (params.get('company')) setCompany(params.get('company') || '');
      if (params.get('skill')) setSkill(params.get('skill') || '');
      if (params.get('minPrize')) setMinPrize(Number(params.get('minPrize') || 0));
      if (params.get('sortBy')) setSortBy(params.get('sortBy') || 'newest');
      if (params.get('status')) setSelectedStatus(params.get('status') || 'all');
      if (params.get('deadline')) setSelectedDeadline(params.get('deadline') || 'all');
    }
  }, []);

  // Update URL parameters when filter state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (industry && industry !== 'all') params.set('industry', industry);
      if (company) params.set('company', company);
      if (skill) params.set('skill', skill);
      if (minPrize > 0) params.set('minPrize', minPrize.toString());
      if (sortBy && sortBy !== 'newest') params.set('sortBy', sortBy);
      if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedDeadline && selectedDeadline !== 'all') params.set('deadline', selectedDeadline);

      const queryString = params.toString();
      const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  }, [search, selectedCategory, industry, company, skill, minPrize, sortBy, selectedStatus, selectedDeadline]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Loading skeleton transition trigger
  useEffect(() => {
    setIsFiltering(true);
    const handler = setTimeout(() => {
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [debouncedSearch, selectedCategory, selectedDifficulties, remoteOnly, minPrize, sortBy, selectedStatus, selectedDeadline, industry, company, skill]);

  const { data: responseData, isLoading, error } = useQuery<{ success: boolean; data: IChallenge[]; meta: { page: number; limit: number; total: number; hasMore: boolean } }>({
    queryKey: ['challenges', { debouncedSearch, selectedCategory, selectedDifficulties, remoteOnly, minPrize, sortBy, currentPage, selectedStatus, selectedDeadline, industry, company, skill }],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (industry && industry !== 'all') params.append('industry', industry);
      if (company) params.append('company', company);
      if (skill) params.append('skill', skill);
      if (selectedDifficulties.length > 0) params.append('difficulty', selectedDifficulties.join(','));
      if (remoteOnly) params.append('remoteOnly', 'true');
      if (minPrize > 0) params.append('prizeMin', minPrize.toString());
      if (currentPage) params.append('page', currentPage.toString());
      params.append('limit', '6'); // Page size = 6

      if (sortBy) {
        let backendSort = 'newest';
        if (sortBy === 'prize-desc') backendSort = 'prize';
        if (sortBy === 'deadline-asc') backendSort = 'deadline';
        if (sortBy === 'popularity') backendSort = 'popularity';
        if (sortBy === 'participants') backendSort = 'participants';
        params.append('sortBy', backendSort);
      }

      if (selectedStatus && selectedStatus !== 'all') {
        let backendStatus = 'active'; // open
        if (selectedStatus === 'judging') backendStatus = 'review';
        if (selectedStatus === 'closed') backendStatus = 'completed';
        params.append('status', backendStatus);
      }

      if (selectedDeadline && selectedDeadline !== 'all') {
        const d = new Date();
        d.setDate(d.getDate() + (selectedDeadline === '7days' ? 7 : 30));
        params.append('deadlineBefore', d.toISOString());
      }

      const res = await fetch(`/api/challenges?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    }
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'ai', label: 'Artificial Intelligence' },
    { value: 'web', label: 'Web Development' },
    { value: 'mobile', label: 'Mobile Apps' },
    { value: 'blockchain', label: 'Blockchain & Crypto' },
    { value: 'cloud', label: 'Cloud Infrastructure' },
    { value: 'iot', label: 'Internet of Things' },
    { value: 'design', label: 'UI/UX Design' },
    { value: 'other', label: 'Other' }
  ];

  const difficulties = ['easy', 'medium', 'hard', 'expert'];

  const toggleDifficulty = (diff: string) => {
    setSelectedDifficulties((current) =>
      current.includes(diff) ? current.filter((item) => item !== diff) : [...current, diff]
    );
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedDifficulties([]);
    setRemoteOnly(false);
    setMinPrize(0);
    setSortBy('newest');
    setSelectedStatus('all');
    setSelectedDeadline('all');
    setIndustry('all');
    setCompany('');
    setSkill('');
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <main className="px-4 py-12 md:px-8 lg:px-16 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
        <p className="mt-4 text-slate-500">Loading challenges...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-4 py-12 md:px-8 lg:px-16 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 font-semibold">Failed to load challenges.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-brand-primary hover:bg-brand-accent text-white px-5 py-2 text-sm font-medium transition"
        >
          Retry
        </button>
      </main>
    );
  }

  const challengesList = responseData?.data || [];
  const meta = responseData?.meta;
  const totalItems = meta?.total || 0;
  const totalPages = Math.ceil(totalItems / 6);

  return (
    <main className="px-4 py-12 md:px-8 lg:px-16 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-4xl font-black bg-gradient-to-r from-brand-primary via-purple-400 to-brand-accent bg-clip-text text-transparent">
          Challenges
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Explore open innovation opportunities across industries.
        </p>
      </div>

      {/* Mobile/Tablet Drawer Toggle & Sort dropdown */}
      <div className="lg:hidden flex gap-4 w-full mb-6">
        <button
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white"
        >
          <Filter className="h-4 w-4 text-brand-primary" /> {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className="w-1/2">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900 px-4 py-2.5 text-sm outline-none text-slate-800 dark:text-white"
          >
            <option value="newest">Newest First</option>
            <option value="prize-desc">Prize: High to Low</option>
            <option value="deadline-asc">Deadline: Soonest</option>
            <option value="popularity">Most Popular</option>
            <option value="participants">Most Participants</option>
          </select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-12 items-start">
        {/* Sticky Filters Sidebar */}
        <aside
          className={cn(
            'sticky top-24 h-fit rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 space-y-6 transition-all duration-300',
            isMobileFiltersOpen ? 'block' : 'hidden lg:block'
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/5">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-slate-800 dark:text-white">
              <Filter className="h-4 w-4 text-brand-primary" /> Filters
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs text-brand-primary hover:text-brand-accent flex items-center gap-1 transition-colors font-medium"
            >
              <RefreshCw className="h-3 w-3" /> Reset All
            </button>
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tags or titles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/80 pl-9 pr-4 py-2.5 text-sm outline-none transition dark:border-slate-800 dark:bg-slate-900 focus:border-brand-primary text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition dark:border-slate-800 dark:bg-slate-900 focus:border-brand-primary text-slate-800 dark:text-white"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Industry Filter Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Industry</label>
            <select
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition dark:border-slate-800 dark:bg-slate-900 focus:border-brand-primary text-slate-800 dark:text-white"
            >
              <option value="all">All Industries</option>
              <option value="AI">Artificial Intelligence</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Logistics">Logistics</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Company Text Search */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Company</label>
            <input
              type="text"
              placeholder="Search by company..."
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition dark:border-slate-800 dark:bg-slate-900 focus:border-brand-primary text-slate-800 dark:text-white"
            />
          </div>

          {/* Skill Text Search */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Skill / Tech</label>
            <input
              type="text"
              placeholder="e.g. Python, React, Solidity"
              value={skill}
              onChange={(e) => {
                setSkill(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition dark:border-slate-800 dark:bg-slate-900 focus:border-brand-primary text-slate-800 dark:text-white"
            />
          </div>

          {/* Status Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition dark:border-slate-800 dark:bg-slate-900 focus:border-brand-primary text-slate-800 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="judging">Judging</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Deadline Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deadline</label>
            <select
              value={selectedDeadline}
              onChange={(e) => {
                setSelectedDeadline(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition dark:border-slate-800 dark:bg-slate-900 focus:border-brand-primary text-slate-800 dark:text-white"
            >
              <option value="all">Any Deadline</option>
              <option value="7days">Ending in 7 days</option>
              <option value="30days">Ending in 30 days</option>
            </select>
          </div>

          {/* Difficulty Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty</label>
            <div className="flex flex-col gap-2 mt-1">
              {difficulties.map((diff) => (
                <label
                  key={diff}
                  className="flex items-center gap-2.5 text-sm cursor-pointer select-none text-slate-600 dark:text-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes(diff)}
                    onChange={() => toggleDifficulty(diff)}
                    className="rounded border-slate-350 text-brand-primary focus:ring-brand-primary/20"
                  />
                  <span className="capitalize">{diff}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Prize Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Min Prize Pool</label>
              <span className="text-sm font-semibold text-brand-primary">${minPrize.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="5000"
              value={minPrize}
              onChange={(e) => {
                setMinPrize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary dark:bg-slate-700"
            />
          </div>

          {/* Sort By Dropdown (Desktop Only) */}
          <div className="hidden lg:block space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900 px-4 py-2.5 text-sm outline-none text-slate-800 dark:text-white focus:border-brand-primary transition"
            >
              <option value="newest">Newest First</option>
              <option value="prize-desc">Prize: High to Low</option>
              <option value="deadline-asc">Deadline: Soonest</option>
              <option value="popularity">Most Popular</option>
              <option value="participants">Most Participants</option>
            </select>
          </div>

          {/* Remote Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" /> Remote-Only
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={() => {
                  setRemoteOnly(!remoteOnly);
                  setCurrentPage(1);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-primary"></div>
            </label>
          </div>
        </aside>

        {/* Results Listings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <div>
              Showing {challengesList.length} of {totalItems} results
            </div>
          </div>

          {isFiltering ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : challengesList.length > 0 ? (
            <>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {challengesList.map((challenge) => (
                  <ChallengeCard key={challenge._id} challenge={challenge} />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 pt-6 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-200 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-semibold text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-200 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-16 rounded-2xl border border-dashed border-slate-200 bg-white/30 dark:border-slate-850 dark:bg-slate-900/30">
              <Award className="h-10 w-10 text-slate-400 mb-3" />
              <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-300">No challenges found</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                Try adjusting your search criteria or resetting filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-brand-primary hover:bg-brand-accent text-white px-5 py-2 text-sm font-medium transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}



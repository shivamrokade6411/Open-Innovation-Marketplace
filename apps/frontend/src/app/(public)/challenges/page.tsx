/*
 * Purpose: Challenge discovery page with filtering and listings.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import { useState } from 'react';
import { ChallengeCard } from '../../../components/challenges/ChallengeCard';
import type { IChallenge } from '@oim/shared';
import { Search, Filter, RefreshCw, Globe, Award, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';

export default function ChallengesPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minPrize, setMinPrize] = useState(0);

  const { data: challenges, isLoading, error } = useQuery<IChallenge[]>({
    queryKey: ['challenges'],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/challenges`);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await res.json() as { success: boolean; data: IChallenge[] };
      return json.data;
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
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedDifficulties([]);
    setRemoteOnly(false);
    setMinPrize(0);
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

  const filteredChallenges = (challenges || []).filter((challenge) => {
    const searchMatch =
      challenge.title.toLowerCase().includes(search.toLowerCase()) ||
      challenge.techStack.some((tech) => tech.toLowerCase().includes(search.toLowerCase())) ||
      challenge.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    const categoryMatch = selectedCategory === 'all' || challenge.category === selectedCategory;

    const difficultyMatch =
      selectedDifficulties.length === 0 || selectedDifficulties.includes(challenge.difficulty);

    const remoteMatch = !remoteOnly || challenge.isRemote;

    const prizeMatch = (challenge.prizes.total ?? 0) >= minPrize;

    return searchMatch && categoryMatch && difficultyMatch && remoteMatch && prizeMatch;
  });

  return (
    <main className="px-4 py-12 md:px-8 lg:px-16 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-4xl font-black bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
          Challenges
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Explore open innovation opportunities across industries.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sticky Filters Sidebar */}
        <aside className="sticky top-24 h-fit rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Filter className="h-4 w-4 text-brand-primary" /> Filters
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs text-brand-primary hover:text-brand-accent flex items-center gap-1 transition-colors"
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
                className="w-full rounded-xl border border-slate-200 bg-white/80 pl-9 pr-4 py-2.5 text-sm outline-none transition dark:border-slate-800 dark:bg-slate-900 focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition dark:border-slate-800 dark:bg-slate-900 focus:border-brand-primary"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty</label>
            <div className="flex flex-col gap-2 mt-1">
              {difficulties.map((diff) => (
                <label key={diff} className="flex items-center gap-2.5 text-sm cursor-pointer select-none text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes(diff)}
                    onChange={() => toggleDifficulty(diff)}
                    className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20"
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
              max="60000"
              step="5000"
              value={minPrize}
              onChange={(e) => setMinPrize(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary dark:bg-slate-700"
            />
          </div>

          {/* Remote Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" /> Remote-Only
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={() => setRemoteOnly(!remoteOnly)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-primary"></div>
            </label>
          </div>
        </aside>

        {/* Results Listings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <div>Showing {filteredChallenges.length} results</div>
          </div>
          {filteredChallenges.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard key={challenge._id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-16 rounded-2xl border border-dashed border-slate-200 bg-white/30 dark:border-slate-800 dark:bg-slate-900/30">
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

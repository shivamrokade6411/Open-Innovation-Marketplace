/*
 * Purpose: Global talent & Team Leaderboard page with multi-category tabs and visual pod.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Search, ArrowRight, Award, Sparkles, Loader2, Users, Briefcase, DollarSign } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';

interface LeaderboardEntry {
  rank: number;
  userId?: string;
  id?: string;
  name: string;
  avatar?: string;
  innovationScore?: number;
  score?: number;
  wins: number;
  submissions: number;
  skills?: string[];
}

export default function LeaderboardPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'contributors' | 'teams' | 'wins' | 'challenges' | 'earnings'>('contributors');

  // Query leaderboard for chosen category
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', category],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/leaderboard?category=${category}`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard data');
      const json = await res.json() as { success: boolean; data: any[] };
      
      return json.data.map((item) => ({
        rank: item.rank,
        userId: item.userId || item.id,
        id: item.id || item.userId,
        name: item.name,
        avatar: item.avatar,
        innovationScore: item.innovationScore !== undefined ? item.innovationScore : item.score,
        score: item.score !== undefined ? item.score : item.innovationScore,
        wins: item.wins || 0,
        submissions: item.submissions || 0,
        skills: item.skills || []
      }));
    }
  });

  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.name.toLowerCase().includes(search.toLowerCase())
  );

  const topThree = filteredLeaderboard.slice(0, 3);
  const remaining = filteredLeaderboard.slice(3);

  // Layout Podium order: 2nd, 1st, 3rd
  const podiumOrder = [
    topThree.find((x) => x.rank === 2),
    topThree.find((x) => x.rank === 1),
    topThree.find((x) => x.rank === 3),
  ].filter(Boolean) as LeaderboardEntry[];

  const getRankBadgeStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 2:
        return 'bg-slate-300/10 text-slate-350 border-slate-300/20';
      case 3:
        return 'bg-amber-700/10 text-amber-600 border-amber-700/20';
      default:
        return 'bg-white/5 text-slate-400 border-white/5';
    }
  };

  const categories = [
    { value: 'contributors', label: 'Top Contributors', icon: Trophy },
    { value: 'teams', label: 'Top Teams', icon: Users },
    { value: 'wins', label: 'Most Wins', icon: Award },
    { value: 'challenges', label: 'Most Completed', icon: Briefcase },
    { value: 'earnings', label: 'Highest Earnings', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white overflow-hidden pb-24">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-35">
        <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute top-[10%] left-[50%] w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-[140px]" />
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-20 relative z-10 space-y-12">
        {/* Header Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-350 backdrop-blur-sm">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Leaderboard rankings are updated dynamically</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Innovation{' '}
            <span className="bg-gradient-to-r from-brand-primary to-purple-400 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>
          <p className="text-slate-400 text-sm font-light">
            Review top builders, hackathon solvers, and teams competing globally.
          </p>
        </section>

        {/* Tab Switching Headers */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {categories.map((tab) => {
            const Icon = tab.icon;
            const isActive = category === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setCategory(tab.value as any);
                  setSearch('');
                }}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-semibold border transition ${
                  isActive
                    ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/10'
                    : 'bg-white/5 border-white/5 text-white/60 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
            <p className="mt-4 text-slate-500">Retrieving rankings...</p>
          </div>
        ) : (
          <>
            {/* Podium Visuals (Top 3) */}
            {podiumOrder.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto mb-16 pt-6">
                {podiumOrder.map((user) => {
                  const isFirst = user.rank === 1;
                  const isSecond = user.rank === 2;
                  const medalColor = isFirst ? 'text-amber-400' : isSecond ? 'text-slate-300' : 'text-amber-700';

                  return (
                    <Card
                      key={user.userId || user.id}
                      variant="glass"
                      hover
                      className={`relative flex flex-col items-center text-center p-8 bg-[#121218] border-white/5 hover:border-purple-500/35 transition duration-300 ${
                        isFirst ? 'md:py-12 border-brand-primary/20 shadow-lg shadow-brand-primary/5' : ''
                      }`}
                    >
                      {/* Rank Indicator */}
                      <span
                        className={`absolute -top-3.5 px-4 py-1 rounded-full text-xs font-bold border uppercase tracking-wider backdrop-blur-sm ${getRankBadgeStyles(
                          user.rank
                        )}`}
                      >
                        Rank {user.rank}
                      </span>

                      {/* Avatar */}
                      <div className="relative mb-4 mt-2">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className={`rounded-full object-cover border-2 border-white/5 ${
                              isFirst ? 'h-20 w-20' : 'h-16 w-16'
                            }`}
                          />
                        ) : (
                          <div
                            className={`flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 to-cyan-500/25 font-black text-indigo-400 border border-indigo-500/20 ${
                              isFirst ? 'h-20 w-20 text-2xl' : 'h-16 w-16 text-lg'
                            }`}
                          >
                            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 border border-white/10 ${medalColor}`}>
                          <Medal className="h-4 w-4" />
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white mb-1">{user.name}</h3>

                      <div className="flex flex-wrap justify-center gap-1 mb-4">
                        {user.skills?.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Score metrics */}
                      <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-white/5 text-center">
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                            {category === 'teams' ? 'Members' : 'Score'}
                          </span>
                          <span className="text-base font-black text-white">
                            {category === 'teams'
                              ? user.score
                                ? Math.round(user.score / 15)
                                : 0
                              : user.innovationScore || 0}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                            {category === 'earnings' ? 'Earnings' : 'Wins'}
                          </span>
                          <span className="text-base font-black text-emerald-400">
                            {category === 'earnings'
                              ? `$${(user.wins * 1000).toLocaleString()}`
                              : user.wins}
                          </span>
                        </div>
                      </div>

                      {category !== 'teams' && (
                        <Link
                          href={`/profile/${user.userId}`}
                          className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline"
                        >
                          View Profile <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </Card>
                  );
                })}
              </section>
            )}

            {/* Search filter input */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-5xl mx-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={category === 'teams' ? 'Search teams...' : 'Search innovators...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-brand-primary text-sm transition"
                />
              </div>
              <div className="text-xs text-slate-400">
                Showing {filteredLeaderboard.length} entries
              </div>
            </div>

            {/* Rankings Table */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-0 overflow-hidden max-w-5xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-bold uppercase text-slate-400">
                      <th className="p-5">Rank</th>
                      <th className="p-5">{category === 'teams' ? 'Team Name' : 'Innovator'}</th>
                      <th className="p-5">{category === 'teams' ? 'Members Size' : 'Skills'}</th>
                      <th className="p-5 text-center">Wins</th>
                      <th className="p-5 text-center">{category === 'teams' ? 'Achievements' : 'Submissions'}</th>
                      <th className="p-5 text-right">{category === 'earnings' ? 'Prize Earnings' : 'Score'}</th>
                      {category !== 'teams' && <th className="p-5 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {remaining.length > 0 ? (
                      remaining.map((entry) => (
                        <tr key={entry.userId || entry.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-5 font-bold text-slate-400">#{entry.rank}</td>
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              {entry.avatar ? (
                                <img src={entry.avatar} alt={entry.name} className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-slate-900 border border-white/10 text-xs font-bold flex items-center justify-center">
                                  {entry.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-bold text-white">{entry.name}</span>
                            </div>
                          </td>
                          <td className="p-5 text-xs">
                            {category === 'teams' ? (
                              <span className="font-semibold">{entry.score ? Math.round(entry.score / 15) : 0} members</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {entry.skills?.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-5 text-center text-emerald-450 font-bold">{entry.wins}</td>
                          <td className="p-5 text-center">
                            {category === 'teams' ? (
                              <span className="text-white/40">Verified Group</span>
                            ) : (
                              entry.submissions
                            )}
                          </td>
                          <td className="p-5 text-right font-black">
                            {category === 'earnings' ? (
                              <span className="text-emerald-400">${(entry.wins * 1000).toLocaleString()}</span>
                            ) : (
                              entry.innovationScore || entry.score
                            )}
                          </td>
                          {category !== 'teams' && (
                            <td className="p-5 text-right">
                              <Link
                                href={`/profile/${entry.userId}`}
                                className="text-xs font-semibold text-brand-primary hover:underline inline-flex items-center gap-1"
                              >
                                View <ArrowRight className="h-3 w-3" />
                              </Link>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : remaining.length === 0 && topThree.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-500">
                          No rankings found matching search parameters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

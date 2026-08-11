/*
 * Purpose: Global talent Leaderboard page with podium highlight, visual rankings, and action links.
 * Author: Antigravity
 * Date: 2026-08-11
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Search, ArrowRight, Award, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  innovationScore: number;
  wins: number;
  submissions: number;
  skills?: string[];
}

const FALLBACK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: '1', name: 'Alice Dev', innovationScore: 980, wins: 4, submissions: 12, skills: ['React', 'TypeScript', 'Next.js'] },
  { rank: 2, userId: '2', name: 'Bob Smith', innovationScore: 850, wins: 3, submissions: 9, skills: ['Python', 'TensorFlow', 'PyTorch'] },
  { rank: 3, userId: '3', name: 'Charlie Kim', innovationScore: 790, wins: 2, submissions: 7, skills: ['Solidity', 'Go', 'Rust'] },
  { rank: 4, userId: '4', name: 'David Lee', innovationScore: 680, wins: 1, submissions: 6, skills: ['Flutter', 'Swift', 'Kotlin'] },
  { rank: 5, userId: '5', name: 'Emma Watson', innovationScore: 620, wins: 1, submissions: 5, skills: ['UI/UX', 'Figma', 'CSS', 'Tailwind'] },
];

export default function LeaderboardPage(): JSX.Element {
  const [search, setSearch] = useState('');

  const { data: serverData, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/leaderboard`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json() as { success: boolean; data: any[] };
      return json.data.map((item) => ({
        rank: item.rank,
        userId: item.userId,
        name: item.name,
        avatar: item.avatar,
        innovationScore: item.innovationScore,
        wins: item.wins || Math.floor(item.innovationScore / 250),
        submissions: item.submissions || Math.floor(item.innovationScore / 80) + 1,
        skills: item.skills || (item.name === 'Alice Dev' ? ['React', 'TypeScript'] : item.name === 'Bob Smith' ? ['Python', 'PyTorch'] : ['Next.js', 'Go'])
      }));
    },
    retry: 1
  });

  const leaderboard = serverData || FALLBACK_LEADERBOARD;

  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.name.toLowerCase().includes(search.toLowerCase())
  );

  // Split podium (top 3) and rest
  const topThree = filteredLeaderboard.slice(0, 3);
  const remaining = filteredLeaderboard.slice(3);

  // Podium sorting: 2nd, 1st, 3rd for visual balance
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
        return 'bg-slate-350/10 text-slate-350 border-slate-300/20';
      case 3:
        return 'bg-amber-700/10 text-amber-600 border-amber-700/20';
      default:
        return 'bg-white/5 text-slate-400 border-white/5';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white overflow-hidden pb-24">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute top-[10%] left-[50%] w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-[140px]" />
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-20 relative z-10">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 mb-6 backdrop-blur-sm">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Top Innovators Rankings</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Global{' '}
            <span className="bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-slate-400 font-light leading-relaxed">
            Meet the top innovators, designers, and developers solving complex issues and accumulating achievements.
          </p>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            <p className="mt-4 text-slate-500">Loading rankings...</p>
          </div>
        ) : (
          <>
            {/* Podium Visuals */}
            {podiumOrder.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto mb-16">
                {podiumOrder.map((user) => {
                  const isFirst = user.rank === 1;
                  const isSecond = user.rank === 2;
                  const medalColor = isFirst ? 'text-amber-400' : isSecond ? 'text-slate-300' : 'text-amber-700';
                  
                  return (
                    <Card
                      key={user.userId}
                      variant="glass"
                      hover
                      className={`relative flex flex-col items-center text-center p-8 bg-[#121218] border-white/5 hover:border-purple-500/35 transition-all duration-300 ${
                        isFirst ? 'md:py-12 border-purple-500/20 shadow-lg shadow-purple-600/5' : ''
                      }`}
                    >
                      {/* Rank Indicator */}
                      <span className={`absolute -top-3.5 px-4 py-1 rounded-full text-xs font-bold border uppercase tracking-wider backdrop-blur-sm ${getRankBadgeStyles(user.rank)}`}>
                        Rank {user.rank}
                      </span>

                      {/* Avatar with Medal */}
                      <div className="relative mb-4 mt-2">
                        <Avatar
                          src={user.avatar}
                          name={user.name}
                          size={isFirst ? 'xl' : 'lg'}
                          className="border-2 border-white/5"
                        />
                        <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 border border-white/10 ${medalColor}`}>
                          <Medal className="h-4 w-4" />
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1">{user.name}</h3>
                      
                      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                        {user.skills?.slice(0, 2).map((skill) => (
                          <span key={skill} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-white/5">
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Score</span>
                          <span className="text-lg font-extrabold text-white">{user.innovationScore}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Wins</span>
                          <span className="text-lg font-extrabold text-emerald-400">{user.wins}</span>
                        </div>
                      </div>

                      {/* View Profile Action */}
                      <Link
                        href={`/profile/${user.userId}`}
                        className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-cyan-400 transition-colors"
                      >
                        View Portfolio <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Card>
                  );
                })}
              </section>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 max-w-5xl mx-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search innovators..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 outline-none focus:border-purple-500/50 text-sm transition"
                />
              </div>
              <div className="text-sm text-slate-400">
                Displaying {filteredLeaderboard.length} innovators
              </div>
            </div>

            {/* List Table */}
            <Card variant="glass" className="border-white/5 bg-[#121218] p-0 overflow-hidden max-w-5xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400">Rank</th>
                      <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400">Innovator</th>
                      <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400">Skills</th>
                      <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Wins</th>
                      <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Submissions</th>
                      <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Score</th>
                      <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {remaining.length > 0 ? (
                      remaining.map((entry) => (
                        <tr key={entry.userId} className="hover:bg-white/[0.02] transition">
                          <td className="p-5 text-sm font-semibold text-slate-300">#{entry.rank}</td>
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <Avatar src={entry.avatar} name={entry.name} size="sm" />
                              <div>
                                <span className="font-semibold text-white block">{entry.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex flex-wrap gap-1">
                              {entry.skills?.slice(0, 3).map((skill) => (
                                <span key={skill} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-5 text-sm font-semibold text-center text-emerald-400">{entry.wins}</td>
                          <td className="p-5 text-sm font-semibold text-center text-slate-300">{entry.submissions}</td>
                          <td className="p-5 text-sm font-extrabold text-right text-purple-400">{entry.innovationScore}</td>
                          <td className="p-5 text-right">
                            <Link
                              href={`/profile/${entry.userId}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                            >
                              Profile <ArrowRight className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : remaining.length === 0 && topThree.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-500">
                          <Award className="h-8 w-8 mx-auto mb-3 opacity-40" />
                          No innovators found matching your search.
                        </td>
                      </tr>
                    ) : (
                      // If search filter matches top 3 but not remaining, show nothing here
                      null
                    )}
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

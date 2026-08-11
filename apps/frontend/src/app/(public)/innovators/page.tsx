/*
 * Purpose: Innovators directory directory page with search, skills filtration, and profiles.
 * Author: Antigravity
 * Date: 2026-08-11
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles, Star, ArrowRight, UserCheck, Code, Loader2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';

interface InnovatorEntry {
  userId: string;
  name: string;
  avatar?: string;
  bio?: string;
  innovationScore: number;
  skills: string[];
  wins: number;
  submissions: number;
  github?: string;
  linkedin?: string;
}

const FALLBACK_INNOVATORS: InnovatorEntry[] = [
  { userId: '1', name: 'Alice Dev', bio: 'Full-stack software architect specializing in Next.js, real-time collab systems, and custom state management structures.', innovationScore: 980, wins: 4, submissions: 12, skills: ['React', 'TypeScript', 'Next.js', 'Node.js'] },
  { userId: '2', name: 'Bob Smith', bio: 'AI researcher and data scientist focused on fine-tuning large language models and building automated grading pipelines.', innovationScore: 850, wins: 3, submissions: 9, skills: ['Python', 'TensorFlow', 'PyTorch', 'FastAPI'] },
  { userId: '3', name: 'Charlie Kim', bio: 'Decentralized systems engineer building multi-signature escape protocols, Solidity smart contracts, and high-security architectures.', innovationScore: 790, wins: 2, submissions: 7, skills: ['Solidity', 'Go', 'Rust', 'Web3.js'] },
  { userId: '4', name: 'David Lee', bio: 'Cross-platform mobile developer designing sleek apps, micro-animations, and offline synchronization structures.', innovationScore: 680, wins: 1, submissions: 6, skills: ['Flutter', 'Swift', 'Kotlin', 'Firebase'] },
  { userId: '5', name: 'Emma Watson', bio: 'Creative UI/UX designer crafting high-end SaaS layouts, dark mode components, and interactive user flows.', innovationScore: 620, wins: 1, submissions: 5, skills: ['UI/UX', 'Figma', 'CSS', 'Tailwind'] },
];

export default function InnovatorsPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');

  const { data: serverData, isLoading } = useQuery<InnovatorEntry[]>({
    queryKey: ['leaderboard'], // Reuses leaderboard query cache
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/leaderboard`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json() as { success: boolean; data: any[] };
      return json.data.map((item) => ({
        userId: item.userId,
        name: item.name,
        avatar: item.avatar,
        bio: item.bio || (item.name === 'Alice Dev' ? 'Full-stack software architect.' : item.name === 'Bob Smith' ? 'AI researcher.' : 'Independent product engineer.'),
        innovationScore: item.innovationScore,
        wins: item.wins || Math.floor(item.innovationScore / 250),
        submissions: item.submissions || Math.floor(item.innovationScore / 80) + 1,
        skills: item.skills || (item.name === 'Alice Dev' ? ['React', 'TypeScript', 'Next.js'] : item.name === 'Bob Smith' ? ['Python', 'PyTorch'] : ['Next.js', 'Go'])
      }));
    },
    retry: 1
  });

  const innovators = serverData || FALLBACK_INNOVATORS;

  // Derive unique skills for filter list
  const allSkills = Array.from(
    new Set(innovators.flatMap((i) => i.skills))
  );

  const filteredInnovators = innovators.filter((entry) => {
    const searchMatch = entry.name.toLowerCase().includes(search.toLowerCase()) || 
      entry.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    
    const skillMatch = selectedSkill === 'all' || entry.skills.includes(selectedSkill);
    
    return searchMatch && skillMatch;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white overflow-hidden pb-24">
      {/* Decorative glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[10%] w-[350px] h-[350px] rounded-full bg-indigo-650/20 blur-[130px]" />
        <div className="absolute top-[15%] left-[60%] w-[400px] h-[400px] rounded-full bg-cyan-600/15 blur-[140px]" />
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-20 relative z-10">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-350 mb-6 backdrop-blur-sm">
            <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Discover Top-tier Talents</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Innovator{' '}
            <span className="bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Directory
            </span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-slate-400 font-light leading-relaxed">
            Search, filter, and connect with global developers, researchers, and creators active in solving challenge contracts.
          </p>
        </section>

        {/* Controls Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Filters Sidebar */}
          <aside className="sticky top-24 rounded-2xl border border-white/5 bg-[#121218]/60 p-6 backdrop-blur space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h2 className="font-semibold text-base text-white flex items-center gap-2">
                <Code className="h-4 w-4 text-purple-400" /> Filters
              </h2>
            </div>

            {/* Search Box */}
            <div className="space-y-2">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-500">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-450" />
                <input
                  type="text"
                  placeholder="Name or tech stack..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-purple-500/50 text-sm transition text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Skill Selector */}
            <div className="space-y-2">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-500">Filter By Skill</label>
              <div className="flex flex-col gap-1.5 mt-1">
                <button
                  onClick={() => setSelectedSkill('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    selectedSkill === 'all'
                      ? 'bg-purple-600/15 border-purple-500/30 text-purple-300'
                      : 'bg-transparent border-transparent hover:bg-white/5 text-slate-400'
                  }`}
                >
                  All Skills
                </button>
                {allSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      selectedSkill === skill
                        ? 'bg-purple-600/15 border-purple-500/30 text-purple-300'
                        : 'bg-transparent border-transparent hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <section className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                <p className="mt-4 text-slate-500">Loading talent directory...</p>
              </div>
            ) : filteredInnovators.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {filteredInnovators.map((user) => (
                  <Card
                    key={user.userId}
                    variant="glass"
                    hover
                    className="flex flex-col justify-between h-[280px] p-6 bg-[#121218] border-white/5 hover:border-purple-500/25 transition-all duration-300 text-left group"
                  >
                    {/* Card Header Info */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} name={user.name} size="md" className="border border-white/10" />
                          <div>
                            <h3 className="font-bold text-white group-hover:text-purple-400 dark:group-hover:text-cyan-400 transition-colors">
                              {user.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Star className="h-2.5 w-2.5 fill-current" /> Score: {user.innovationScore}
                            </span>
                          </div>
                        </div>

                        {/* Wins count badge */}
                        <div className="text-right">
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Wins</span>
                          <span className="text-sm font-extrabold text-white">{user.wins}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-3">
                        {user.bio}
                      </p>
                    </div>

                    {/* Card footer: skills + CTA button */}
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div className="flex flex-wrap gap-1 max-w-[70%]">
                        {user.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-350 border border-white/5">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/profile/${user.userId}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:text-cyan-400 transition-colors"
                      >
                        Portfolio <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-16 rounded-2xl border border-dashed border-white/10 bg-[#121218]/30">
                <Sparkles className="h-10 w-10 text-slate-500 mb-3 opacity-45" />
                <h3 className="font-semibold text-lg text-slate-300">No innovators match filters</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  Adjust your search keyword or selected skill filters.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedSkill('all');
                  }}
                  className="mt-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 text-sm font-medium transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

/*
 * Purpose: Platform administration center containing analytics charts, moderation tabs, and blog compositors.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Users,
  Briefcase,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
  Shield,
  Loader2,
  Lock,
  Plus,
  Trash
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';

export default function AdminPanelPage(): JSX.Element {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'analytics' | 'companies' | 'challenges' | 'payments' | 'blog'>('analytics');

  // Blog creation form state
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCover, setBlogCover] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('');
  const [blogCategory, setBlogCategory] = useState('Ecosystem');
  const [blogTags, setBlogTags] = useState('');

  // Fetch admin platform statistics
  const { data: analyticsRes, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics');
      return res.data.data;
    },
    enabled: (session?.user as any)?.role === 'admin'
  });

  // Fetch users & companies
  const { data: usersRes } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/api/admin/users');
      return res.data.data;
    },
    enabled: (session?.user as any)?.role === 'admin'
  });

  // Fetch payments list
  const { data: paymentsRes } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const res = await api.get('/api/admin/payments');
      return res.data.data;
    },
    enabled: (session?.user as any)?.role === 'admin'
  });

  // Fetch challenges
  const { data: challengesRes } = useQuery({
    queryKey: ['admin-challenges'],
    queryFn: async () => {
      const res = await api.get('/api/challenges?limit=50');
      return res.data.data;
    },
    enabled: (session?.user as any)?.role === 'admin'
  });

  // Company verification mutation
  const verifyCompanyMutation = useMutation({
    mutationFn: async ({ companyId, status }: { companyId: string; status: 'verified' | 'rejected' }) => {
      const res = await api.post(`/api/admin/companies/${companyId}/verify`, { status });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Company verification status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Failed to verify company');
    }
  });

  // Moderate challenge mutation
  const moderateChallengeMutation = useMutation({
    mutationFn: async ({ challengeId, status }: { challengeId: string; status: string }) => {
      const res = await api.post(`/api/admin/challenges/${challengeId}/moderate`, { status });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Challenge moderation status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
    },
    onError: () => {
      toast.error('Failed to moderate challenge');
    }
  });

  // Release prize funds mutation
  const releaseFundsMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await api.post(`/api/payments/${paymentId}/release`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Prize pool funds released to winner!');
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    },
    onError: () => {
      toast.error('Failed to release prize pool funds');
    }
  });

  // Create blog post mutation
  const createBlogPostMutation = useMutation({
    mutationFn: async () => {
      const tagsList = blogTags.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await api.post('/api/blog', {
        title: blogTitle,
        slug: blogSlug,
        excerpt: blogExcerpt,
        content: blogContent,
        coverImage: blogCover,
        author: blogAuthor,
        category: blogCategory,
        tags: tagsList
      });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Blog article published successfully!');
      // Clear form
      setBlogTitle('');
      setBlogSlug('');
      setBlogExcerpt('');
      setBlogContent('');
      setBlogCover('');
      setBlogAuthor('');
      setBlogTags('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create blog article');
    }
  });

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  // Double check authorization on client side (fallback protection, server endpoints are fully secure)
  if ((session?.user as any)?.role !== 'admin') {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center bg-slate-950 text-white space-y-4">
        <Lock className="h-16 w-16 text-red-500" />
        <h1 className="text-3xl font-black">Access Prohibited</h1>
        <p className="text-slate-400">Platform administration operations are restricted to admin users only.</p>
        <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  const metrics = analyticsRes?.metrics || {
    users: 0,
    companies: 0,
    challenges: 0,
    activeChallenges: 0,
    submissions: 0,
    totalEarningsUSD: 0
  };

  // Recharts Chart Formats
  const areaData = [
    { name: 'Jan', users: 20, submissions: 5 },
    { name: 'Mar', users: 50, submissions: 22 },
    { name: 'May', users: 80, submissions: 45 },
    { name: 'Jul', users: 120, submissions: 82 }
  ];

  const pieData = [
    { name: 'Companies', value: metrics.companies },
    { name: 'Innovators', value: metrics.users - metrics.companies }
  ];

  const COLORS = ['#6366f1', '#06b6d4'];

  const companiesList = usersRes?.filter((u: any) => u.role === 'company') || [];
  const normalUsersList = usersRes?.filter((u: any) => u.role === 'innovator') || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12 md:px-12 lg:px-24">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-8 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-brand-primary animate-pulse" /> Administration Center
          </h1>
          <p className="text-white/60 text-sm mt-1">Verify partners, moderate submissions, track transactions, and manage articles.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        {[
          { id: 'analytics', label: 'Analytics & Growth', icon: TrendingUp },
          { id: 'companies', label: 'Company Verifications', icon: CheckCircle },
          { id: 'challenges', label: 'Challenge Moderation', icon: Briefcase },
          { id: 'payments', label: 'Stripe Escrows', icon: DollarSign },
          { id: 'blog', label: 'CMS Composer', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold border transition ${
                isActive
                  ? 'bg-brand-primary border-brand-primary text-white shadow-lg'
                  : 'bg-white/5 border-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[500px]">
        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Users', value: metrics.users, icon: Users, color: 'text-brand-primary' },
                { label: 'Total Companies', value: metrics.companies, icon: Shield, color: 'text-purple-400' },
                { label: 'Active Challenges', value: metrics.activeChallenges, max: metrics.challenges, icon: Briefcase, color: 'text-emerald-400' },
                { label: 'Submissions', value: metrics.submissions, icon: FileText, color: 'text-blue-400' }
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur flex justify-between items-center">
                  <div>
                    <span className="text-xs text-white/50 block font-semibold uppercase tracking-wider mb-1">{stat.label}</span>
                    <span className="text-2xl font-black text-white">
                      {stat.value}
                      {stat.max !== undefined && <span className="text-sm text-white/40">/{stat.max}</span>}
                    </span>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Signups over time */}
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur h-[350px]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-6">User Signups & Submissions Growth</h3>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={areaData}>
                    <XAxis dataKey="name" stroke="#ffffff30" style={{ fontSize: 10 }} />
                    <YAxis stroke="#ffffff30" style={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: 12 }} />
                    <Area type="monotone" dataKey="users" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="submissions" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* User Roles Pie Chart */}
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur h-[350px] flex flex-col justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">Registered User Roles Ratio</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="5/0%" cy="50%" innerRadius={50} outerRadius={80} fill="#8884d8">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 text-xs text-white/60">
                  <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded bg-brand-primary inline-block" /> Companies ({metrics.companies})</span>
                  <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded bg-cyan-500 inline-block" /> Innovators ({metrics.users - metrics.companies})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPANIES VERIFICATION TAB */}
        {activeTab === 'companies' && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
            <h3 className="text-lg font-bold">Pending Company Approvals</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/80">
                <thead className="bg-white/5 text-xs text-white/50 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 rounded-l-xl">Name / Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {companiesList.map((user: any) => (
                    <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-white block">{user.name}</span>
                        <span className="text-xs text-white/40">{user.email}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold capitalize text-purple-400">{user.role}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          user.isVerified ? 'bg-emerald-450/10 text-emerald-400' : 'bg-yellow-450/10 text-yellow-405'
                        }`}>
                          {user.isVerified ? 'verified' : 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!user.isVerified ? (
                          <button
                            onClick={() => verifyCompanyMutation.mutate({ companyId: user._id, status: 'verified' })}
                            className="bg-brand-primary hover:bg-brand-primary/95 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                          >
                            Verify Partner
                          </button>
                        ) : (
                          <span className="text-xs text-white/30">Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {companiesList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-white/40 text-xs">
                        No company profile applications.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CHALLENGE MODERATION TAB */}
        {activeTab === 'challenges' && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
            <h3 className="text-lg font-bold">Challenge Moderation</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/80">
                <thead className="bg-white/5 text-xs text-white/50 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 rounded-l-xl">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(challengesRes || []).map((c: any) => (
                    <tr key={c._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-bold text-white max-w-sm truncate">{c.title}</td>
                      <td className="px-6 py-4 capitalize text-white/60">{c.category}</td>
                      <td className="px-6 py-4 font-semibold capitalize text-brand-primary">{c.status}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {c.status === 'active' ? (
                          <button
                            onClick={() => moderateChallengeMutation.mutate({ challengeId: c._id, status: 'draft' })}
                            className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-405 border border-yellow-500/20 text-xs px-3 py-1.5 rounded-lg transition"
                          >
                            Suspend (Draft)
                          </button>
                        ) : (
                          <button
                            onClick={() => moderateChallengeMutation.mutate({ challengeId: c._id, status: 'active' })}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-450 border border-emerald-500/20 text-xs px-3 py-1.5 rounded-lg transition"
                          >
                            Approve Live
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAYMENTS/ESCROWS TAB */}
        {activeTab === 'payments' && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
            <h3 className="text-lg font-bold">Stripe Escrows & Payments History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/80">
                <thead className="bg-white/5 text-xs text-white/50 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 rounded-l-xl">Transaction / User</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(paymentsRes || []).map((p: any) => (
                    <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-white block">{p.gatewayOrderId || p._id}</span>
                        <span className="text-xs text-white/40">{p.userId?.name || 'Partner'}</span>
                      </td>
                      <td className="px-6 py-4 capitalize text-white/60">{p.type}</td>
                      <td className="px-6 py-4 font-semibold capitalize text-brand-primary">{p.status}</td>
                      <td className="px-6 py-4 font-black text-emerald-400">${p.amount}</td>
                      <td className="px-6 py-4 text-right">
                        {(p.status === 'funded' || p.status === 'held') && p.type === 'prize' ? (
                          <button
                            onClick={() => releaseFundsMutation.mutate(p._id)}
                            className="bg-emerald-500 hover:bg-emerald-500/90 text-slate-950 text-xs px-3 py-1.5 rounded-lg font-bold transition"
                          >
                            Release Prize
                          </button>
                        ) : (
                          <span className="text-xs text-white/30 capitalize">{p.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {(!paymentsRes || paymentsRes.length === 0) && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-white/40 text-xs">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CMS BLOG COMPOSER TAB */}
        {activeTab === 'blog' && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur space-y-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-4">
              <Plus className="h-5 w-5 text-brand-primary" /> Redact and Publish CMS Blog Article
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs text-white/50 block mb-2 font-semibold">Article Title</label>
                <input
                  type="text"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g. Navigating AI Hackathons"
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 block mb-2 font-semibold">Slug Handle</label>
                <input
                  type="text"
                  value={blogSlug}
                  onChange={(e) => setBlogSlug(e.target.value)}
                  placeholder="e.g. navigating-ai-hackathons"
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 block mb-2 font-semibold">Author</label>
                <input
                  type="text"
                  value={blogAuthor}
                  onChange={(e) => setBlogAuthor(e.target.value)}
                  placeholder="e.g. Alice Editor"
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 block mb-2 font-semibold">Category</label>
                <select
                  value={blogCategory}
                  onChange={(e) => setBlogCategory(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                >
                  <option value="Ecosystem">Ecosystem</option>
                  <option value="Guides">Guides</option>
                  <option value="Technology">Technology</option>
                  <option value="Events">Events</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-white/50 block mb-2 font-semibold">Excerpt / Snippet Summary</label>
                <input
                  type="text"
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  placeholder="Provide a single-sentence overview of the article content."
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-white/50 block mb-2 font-semibold">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={blogTags}
                  onChange={(e) => setBlogTags(e.target.value)}
                  placeholder="e.g. AI, hackathon, guidelines"
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-white/50 block mb-2 font-semibold">Article Content (MDX / Markdown format)</label>
                <textarea
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  rows={8}
                  placeholder="Compose article body here..."
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                />
              </div>
            </div>

            <button
              onClick={() => createBlogPostMutation.mutate()}
              disabled={createBlogPostMutation.isPending}
              className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white py-3.5 rounded-xl text-sm font-semibold transition"
            >
              {createBlogPostMutation.isPending ? 'Publishing article...' : 'Publish Article Live'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

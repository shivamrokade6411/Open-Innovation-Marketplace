/*
 * Purpose: Beautiful dynamic blog article page loading from CMS api with fallback.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../services/api';
import { ArrowLeft, Clock, Calendar, Sparkles, Loader2 } from 'lucide-react';

interface PostDetails {
  title: string;
  publishedAt?: string;
  readTime?: string;
  category: string;
  content: string; // Content can be string (Markdown) or array of strings
  tags: string[];
}

const FALLBACK_ARTICLE_DB: Record<string, PostDetails> = {
  'innovation-marketplace-trends': {
    title: 'Innovation Marketplace Trends in 2026',
    publishedAt: '2026-07-04T12:00:00Z',
    readTime: '3 min read',
    category: 'Ecosystem',
    content: 'In 2026, the landscape of open innovation is shifting from static corporate hackathons toward continuous, decentralized developers bounty platforms. Traditional organizations are increasingly leveraging open source bounty networks to solve complex cryptography, AI fine-tuning, and hardware integration challenges.\n\nWe are seeing three major trends driving this shift: the rise of specialized AI agent evaluation platforms, micro-bounties for quick bug fixes, and long-term research grants distributed automatically via smart contract escrow accounts.\n\nBy utilizing these modern marketplaces, companies reduce time-to-market by up to 40% while engaging with a global, verified network of technical experts.',
    tags: ['Decentralized', 'AI', 'Bounties']
  },
  'how-to-win-open-source-bounties': {
    title: 'How to Win Open Source Bounties: A Practical Guide',
    publishedAt: '2026-07-08T15:00:00Z',
    readTime: '5 min read',
    category: 'Guides',
    content: 'Winning open-source bounties requires more than just technical ability. It is about understanding the core objectives of the sponsoring company, maintaining clear communication with maintainers, and structuring your submission so it can be reviewed quickly.\n\nFirst, start by dissecting the requirements. Sponsoring companies look for solutions that integrate seamlessly with their existing architecture. Review their codebase first, align with their style guides, and comment on the challenge page to clarify requirements early.\n\nSecond, collaborate when needed. Many challenges allow teams. Combining strengths—for example, pairing a frontend engineer with a backend developer—significantly increases your chance of scoring higher. Always submit clean code, verify your types, and attach a walkthrough video explaining your architecture.',
    tags: ['Development', 'Career', 'Strategy']
  },
  'ai-powered-code-evaluation': {
    title: 'AI-Powered Code Evaluation: The Future of Grading',
    publishedAt: '2026-07-10T10:00:00Z',
    readTime: '4 min read',
    category: 'Technology',
    content: 'As the scale of developer platforms grows, manual code evaluation becomes a bottleneck. In 2026, marketplaces are turning to automated AI grading systems to instantly score, benchmark, and review submissions.\n\nThese systems do not just check if a solution runs; they evaluate architectural patterns, check for security vulnerabilities, calculate plagiarism ratings, and measure efficiency. For example, LLM agents analyze code quality, security compliance, and uniqueness scores on a scale of 0 to 100.\n\nThis automation ensures that innovators receive objective feedback within minutes, and allows companies to instantly surface the highest-quality solutions from thousands of entries without spending weeks filtering submissions.',
    tags: ['AI', 'Automation', 'Mongoose']
  }
};

export default function BlogPostPage(): JSX.Element {
  const params = useParams() as { slug: string };
  const router = useRouter();

  // Query single blog post from backend api
  const { data: serverPost, isLoading, error } = useQuery<PostDetails>({
    queryKey: ['blog-post', params.slug],
    queryFn: async () => {
      const res = await api.get(`/api/blog/${params.slug}`);
      return res.data.data;
    },
    retry: false
  });

  const fallbackPost = FALLBACK_ARTICLE_DB[params.slug];
  const post = serverPost || fallbackPost;

  if (isLoading && !serverPost) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
        <p className="mt-4 text-slate-500">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center py-24 text-center space-y-4">
        <h1 className="text-3xl font-bold">Article Not Found</h1>
        <p className="text-slate-400">The blog post you requested does not exist.</p>
        <Link href="/blog" className="text-brand-primary hover:underline font-bold">
          Back to Journal
        </Link>
      </div>
    );
  }

  const paragraphContent = typeof post.content === 'string' ? post.content.split('\n\n') : (post.content as any);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white overflow-hidden pb-24">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] pointer-events-none opacity-25">
        <div className="absolute top-[-5%] left-[20%] w-[350px] h-[350px] rounded-full bg-purple-600/30 blur-[120px]" />
        <div className="absolute top-[10%] left-[50%] w-[300px] h-[300px] rounded-full bg-cyan-500/20 blur-[110px]" />
      </div>

      <main className="max-w-4xl mx-auto px-6 md:px-8 pt-20 relative">
        {/* Back navigation */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-x-2 text-sm text-slate-400 hover:text-brand-primary mb-10 transition-colors duration-200 group"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          Back to journal
        </Link>

        <article className="max-w-3xl space-y-6">
          {/* Post Category & Read Time */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-2xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-600/10 text-purple-400 border border-purple-500/15">
              {post.category || 'Innovation'}
            </span>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{post.readTime || '4 min read'}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '7/10/2026'}</span>
            </div>
          </div>

          {/* Post Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
            {post.title}
          </h1>

          {/* Post Content */}
          <div className="mt-8 space-y-6 text-base leading-relaxed text-slate-350 font-light whitespace-pre-line">
            {Array.isArray(paragraphContent) ? (
              paragraphContent.map((para: string, index: number) => <p key={index}>{para}</p>)
            ) : (
              <p>{post.content}</p>
            )}
          </div>

          {/* Post Tags */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/5 hover:border-purple-500/25 transition-colors cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

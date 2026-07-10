/*
 * Purpose: Beautifully redesigned dynamic blog article page with background glows and detailed content.
 * Author: Antigravity Pair Programmer
 * Date: 2026-07-10
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Sparkles } from 'lucide-react';

interface PostDetails {
  title: string;
  date: string;
  readTime: string;
  category: string;
  content: string[];
  tags: string[];
}

const ARTICLE_DB: Record<string, PostDetails> = {
  'innovation-marketplace-trends': {
    title: 'Innovation Marketplace Trends in 2026',
    date: 'July 4, 2026',
    readTime: '3 min read',
    category: 'Ecosystem',
    content: [
      'In 2026, the landscape of open innovation is shifting from static corporate hackathons toward continuous, decentralized developers bounty platforms. Traditional organizations are increasingly leveraging open source bounty networks to solve complex cryptography, AI fine-tuning, and hardware integration challenges.',
      'We are seeing three major trends driving this shift: the rise of specialized AI agent evaluation platforms, micro-bounties for quick bug fixes, and long-term research grants distributed automatically via smart contract escrow accounts.',
      'By utilizing these modern marketplaces, companies reduce time-to-market by up to 40% while engaging with a global, verified network of technical experts.'
    ],
    tags: ['Decentralized', 'AI', 'Bounties']
  },
  'how-to-win-open-source-bounties': {
    title: 'How to Win Open Source Bounties: A Practical Guide',
    date: 'July 8, 2026',
    readTime: '5 min read',
    category: 'Guides',
    content: [
      'Winning open-source bounties requires more than just technical ability. It is about understanding the core objectives of the sponsoring company, maintaining clear communication with maintainers, and structuring your submission so it can be reviewed quickly.',
      'First, start by dissecting the requirements. Sponsoring companies look for solutions that integrate seamlessly with their existing architecture. Review their codebase first, align with their style guides, and comment on the challenge page to clarify requirements early.',
      'Second, collaborate when needed. Many challenges allow teams. Combining strengths—for example, pairing a frontend engineer with a backend developer—significantly increases your chance of scoring higher. Always submit clean code, verify your types, and attach a walkthrough video explaining your architecture.'
    ],
    tags: ['Development', 'Career', 'Strategy']
  },
  'ai-powered-code-evaluation': {
    title: 'AI-Powered Code Evaluation: The Future of Grading',
    date: 'July 10, 2026',
    readTime: '4 min read',
    category: 'Technology',
    content: [
      'As the scale of developer platforms grows, manual code evaluation becomes a bottleneck. In 2026, marketplaces are turning to automated AI grading systems to instantly score, benchmark, and review submissions.',
      'These systems do not just check if a solution runs; they evaluate architectural patterns, check for security vulnerabilities, calculate plagiarism ratings, and measure efficiency. For example, LLM agents analyze code quality, security compliance, and uniqueness scores on a scale of 0 to 100.',
      'This automation ensures that innovators receive objective feedback within minutes, and allows companies to instantly surface the highest-quality solutions from thousands of entries without spending weeks filtering submissions.'
    ],
    tags: ['AI', 'Automation', 'Mongoose']
  }
};

interface PageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: PageProps): JSX.Element {
  const post = ARTICLE_DB[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white overflow-hidden pb-24">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] pointer-events-none opacity-20">
        <div className="absolute top-[-5%] left-[20%] w-[350px] h-[350px] rounded-full bg-purple-600/30 blur-[120px]" />
        <div className="absolute top-[10%] left-[50%] w-[300px] h-[300px] rounded-full bg-cyan-500/20 blur-[110px]" />
      </div>

      <main className="max-w-4xl mx-auto px-6 md:px-8 pt-20 relative">
        {/* Back navigation */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-x-2 text-sm text-slate-400 hover:text-purple-400 mb-10 transition-colors duration-200 group"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          Back to journal
        </Link>

        <article className="max-w-3xl">
          {/* Post Category & Read Time */}
          <div className="flex items-center gap-4 text-xs mb-6">
            <span className="text-2xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-600/10 text-purple-400 border border-purple-500/15">
              {post.category}
            </span>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{post.readTime}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{post.date}</span>
            </div>
          </div>

          {/* Post Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white mb-8">
            {post.title}
          </h1>

          {/* Post Content */}
          <div className="mt-8 space-y-6 text-base leading-relaxed text-slate-300 font-light">
            {post.content.map((para, index) => (
              <p key={index}>{para}</p>
            ))}
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

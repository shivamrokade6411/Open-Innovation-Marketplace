/*
 * Purpose: Component for rendering a premium grid list of blog posts.
 * Author: Antigravity Pair Programmer
 * Date: 2026-07-10
 */

import Link from 'next/link';
import { Card } from '../ui/Card';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string;
  readTime?: string;
  category?: string;
  tags?: string[];
}

const posts: BlogPost[] = [
  {
    slug: 'innovation-marketplace-trends',
    title: 'Innovation Marketplace Trends in 2026',
    excerpt: 'Explore the shifting landscape of global developer ecosystems, open innovation challenges, and tokenized incentive models.',
    date: 'July 4, 2026',
    readTime: '3 min read',
    category: 'Ecosystem',
    tags: ['Decentralized', 'AI', 'Bounties']
  },
  {
    slug: 'how-to-win-open-source-bounties',
    title: 'How to Win Open Source Bounties: A Practical Guide',
    excerpt: 'Key strategies, collaboration tips, and technical preparation steps to win enterprise innovation challenges.',
    date: 'July 8, 2026',
    readTime: '5 min read',
    category: 'Guides',
    tags: ['Development', 'Career', 'Strategy']
  },
  {
    slug: 'ai-powered-code-evaluation',
    title: 'AI-Powered Code Evaluation: The Future of Grading',
    excerpt: 'An inside look at how static and dynamic analysis models are rating complex code submissions at scale.',
    date: 'July 10, 2026',
    readTime: '4 min read',
    category: 'Technology',
    tags: ['AI', 'Automation', 'Mongoose']
  }
];

export function BlogList(): JSX.Element {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
      {posts.map((post) => (
        <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex h-full">
          <Card 
            variant="glass" 
            hover 
            className="flex flex-col h-full bg-white/[0.02] border-white/5 hover:border-purple-500/20 transition-all duration-300 cursor-pointer p-6"
          >
            {/* Post Header Meta */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-600/10 text-purple-400 border border-purple-500/15">
                {post.category}
              </span>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Post Title */}
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-400 transition-colors duration-200 line-clamp-2">
              {post.title}
            </h3>

            {/* Post Excerpt */}
            <p className="text-sm text-slate-400 font-light leading-relaxed flex-grow line-clamp-3">
              {post.excerpt}
            </p>

            {/* Post Tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags?.map((tag) => (
                <span key={tag} className="text-3xs px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Divider */}
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>{post.date}</span>
              </div>
              <span className="inline-flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform duration-200">
                Read article <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

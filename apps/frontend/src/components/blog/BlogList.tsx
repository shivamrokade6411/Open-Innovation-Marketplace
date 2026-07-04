/*
 * Purpose: Component for rendering a list of blog posts.
 * Author: Antigravity Pair Programmer
 * Date: 2026-07-04
 */

import Link from 'next/link';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string;
}

const posts: BlogPost[] = [
  {
    slug: 'innovation-marketplace-trends',
    title: 'Innovation marketplace trends in 2026',
    excerpt: 'Explore the shifting landscape of global developer ecosystems, open innovation challenges, and tokenized incentive models.',
    date: 'July 4, 2026'
  }
];

export function BlogList(): JSX.Element {
  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <article key={post.slug} className="flex flex-col items-start justify-between border-b border-slate-200/50 pb-6 dark:border-white/5 last:border-b-0">
          <div className="max-w-xl">
            {post.date && (
              <div className="flex items-center gap-x-4 text-xs text-slate-500 dark:text-slate-400 mb-2">
                <time dateTime="2026-07-04">{post.date}</time>
              </div>
            )}
            <div className="relative">
              <h3 className="text-xl font-semibold leading-6">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 underline underline-offset-4 transition-colors"
                >
                  {post.title}
                </Link>
              </h3>
              {post.excerpt && (
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/*
 * Purpose: Blog page displaying list of posts.
 * Author: Antigravity Pair Programmer
 * Date: 2026-07-04
 */

import type { Metadata } from 'next';
import { BlogList } from '../../../components/blog/BlogList';

export const metadata: Metadata = {
  title: 'Blog - Open Innovation Marketplace',
  description: 'Read the latest trends, guides, and articles about open innovation challenges and tech ecosystem shifts.'
};

export default function BlogPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Blog
        </h1>
        <div className="mt-10">
          <BlogList />
        </div>
      </div>
    </div>
  );
}

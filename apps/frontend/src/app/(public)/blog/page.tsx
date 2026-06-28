/*
 * Purpose: Blog listing page.
 * Author: Copilot
 * Date: 2026-06-28
 */

import Link from 'next/link';

const posts = [{ slug: 'innovation-marketplace-trends', title: 'Innovation marketplace trends in 2026' }];

export default function BlogPage(): JSX.Element {
  return (
    <main className="px-6 py-16">
      <h1 className="text-4xl font-bold">Blog</h1>
      <div className="mt-6 space-y-3">
        {posts.map((post) => <Link key={post.slug} className="block text-brand-primary underline" href={`/blog/${post.slug}`}>{post.title}</Link>)}
      </div>
    </main>
  );
}

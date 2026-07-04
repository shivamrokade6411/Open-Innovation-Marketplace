/*
 * Purpose: Dynamic blog article page.
 * Author: Antigravity Pair Programmer
 * Date: 2026-07-04
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface PostDetails {
  title: string;
  date: string;
  content: string[];
}

const ARTICLE_DB: Record<string, PostDetails> = {
  'innovation-marketplace-trends': {
    title: 'Innovation marketplace trends in 2026',
    date: 'July 4, 2026',
    content: [
      'In 2026, the landscape of open innovation is shifting from static corporate hackathons toward continuous, decentralized developers bounty platforms. Traditional organizations are increasingly leveraging open source bounty networks to solve complex cryptography, AI fine-tuning, and hardware integration challenges.',
      'We are seeing three major trends driving this shift: the rise of specialized AI agent evaluation platforms, micro-bounties for quick bug fixes, and long-term research grants distributed automatically via smart contract escrow accounts.',
      'By utilizing these modern marketplaces, companies reduce time-to-market by up to 40% while engaging with a global, verified network of technical experts.'
    ]
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
    <article className="mx-auto max-w-4xl px-6 py-16 sm:py-24 lg:px-8">
      <div className="max-w-2xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-x-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
        <time dateTime="2026-07-04" className="block text-xs text-slate-500 dark:text-slate-400 mb-2">
          {post.date}
        </time>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-10 space-y-6 text-base leading-7 text-slate-700 dark:text-slate-300">
          {post.content.map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      </div>
    </article>
  );
}

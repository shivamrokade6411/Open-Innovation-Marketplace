'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CertificatesFeaturePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-[#020d1f] text-white">
      <header className="border-b border-[#1a2c45] bg-[#020d1f]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="text-4xl font-extrabold tracking-[-0.04em] text-transparent bg-gradient-to-r from-[#67d6ff] via-[#7d9af7] to-[#c17cff] bg-clip-text">
            Open Innovation Marketplace
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pb-16 pt-10 md:px-8 lg:px-10">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1d9e66]/30 bg-[#1f5e44]/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#5ee6ae]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#5ee6ae]" />
            Coming Soon
          </div>

          <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.05em] text-[#5ee6ae] md:text-8xl">
            Verified Certificates & Rewards
          </h1>

          <p className="mt-5 text-lg text-slate-300 md:text-2xl">
            Feature #4 - Cryptographic certificates and blockchain integration
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-[#233756] bg-[#0f2138]/80 p-6 text-left text-lg text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          This feature is being built. Check back soon!
        </div>
      </div>
    </main>
  );
}

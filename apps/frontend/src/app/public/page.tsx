import React from 'react';

const Logo: React.FC = () => (
  <div className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400">
    Open Innovation Marketplace
  </div>
);

const Icon = ({ name, className = '' }: { name: string; className?: string }) => {
  const common = 'w-6 h-6';
  switch (name) {
    case 'people':
      return (
        <svg className={`${common} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M17 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1" />
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 100-8 4 4 0 000 8zM19 11a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'trophy':
      return (
        <svg className={`${common} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M8 7V4h8v3" />
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M5 7h14v2a6 6 0 01-6 6h0a6 6 0 01-6-6V7z" />
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9 21l3-3 3 3" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg className={`${common} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.5 3L17 8l-3.5 1L12 12l-1.5-3L7 8l3.5-2L12 3z" />
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg className={`${common} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="1.5" />
          <path d="M8 7V6a4 4 0 014-4h0a4 4 0 014 4v1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
};

const StatCard: React.FC<{ icon: string; number: string; label: string; color: string }> = ({ icon, number, label, color }) => (
  <div className="flex-1 px-6 py-8">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full bg-white/6 ${color}`}> 
        <Icon name={icon} className="text-white" />
      </div>
      <div>
        <div className="text-3xl font-extrabold">{number}</div>
        <div className="text-sm text-slate-300">{label}</div>
      </div>
    </div>
  </div>
);

export default function LandingPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-[#0a0a12] text-slate-100">
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center space-x-6">
          <a className="text-slate-200 hover:text-white" href="#">Challenges</a>
          <a className="text-slate-200 hover:text-white" href="#">Companies</a>
          <a className="text-slate-200 hover:text-white" href="#">Blog</a>
          <button aria-label="toggle theme" className="ml-4 rounded-full bg-white/6 p-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          </button>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 gap-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-300">
              Connect companies with innovators globally
            </h1>
            <p className="mt-4 text-slate-300 max-w-2xl mx-auto">Run challenges, review submissions, and reward winners with built-in collaboration tools.</p>

            <div className="mt-8 flex items-center justify-center space-x-4">
              <button className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-glow">
                Get Started
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <button className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-slate-900">
                Browse Challenges
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="rounded-2xl bg-white/3 border border-white/6 p-6 backdrop-blur-md">
              <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/6">
                <StatCard icon="people" number="14+" label="Active Innovators" color="bg-gradient-to-r from-purple-500 to-indigo-500" />
                <StatCard icon="trophy" number="10+" label="Global Challenges" color="bg-gradient-to-r from-yellow-400 to-yellow-600" />
                <StatCard icon="sparkles" number="$4.8M" label="Prizes Awarded" color="bg-gradient-to-r from-cyan-400 to-cyan-600" />
                <StatCard icon="briefcase" number="8+" label="Enterprise Partners" color="bg-gradient-to-r from-violet-500 to-violet-700" />
              </div>
            </div>
          </div>

          <div className="text-center py-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Engineered for Collaboration</h2>
            <p className="mt-4 max-w-2xl mx-auto text-slate-400">Powerful built-in tools that help companies and innovators coordinate, review, and reward submissions instantly.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

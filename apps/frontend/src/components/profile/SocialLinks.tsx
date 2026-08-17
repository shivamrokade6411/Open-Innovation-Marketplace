/*
 * Purpose: Social links component displaying user's public social profiles.
 * Author: GitHub Copilot
 * Date: 2026-08-17
 */

import type { User } from '@prisma/client';
import { Github, Linkedin, Globe, ExternalLink } from 'lucide-react';

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z" />
  </svg>
);

interface SocialLinksProps {
  user: Pick<User, 'githubUrl' | 'linkedinUrl' | 'twitterUrl' | 'portfolioUrl'>;
}

const socialLinks = [
  {
    key: 'github',
    label: 'GitHub',
    getUrl: (user: SocialLinksProps['user']) => user.githubUrl,
    icon: Github,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    getUrl: (user: SocialLinksProps['user']) => user.linkedinUrl,
    icon: Linkedin,
  },
  {
    key: 'twitter',
    label: 'Twitter/X',
    getUrl: (user: SocialLinksProps['user']) => user.twitterUrl,
    icon: TwitterIcon,
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    getUrl: (user: SocialLinksProps['user']) => user.portfolioUrl,
    icon: Globe,
  },
];

export function SocialLinks({ user }: SocialLinksProps) {
  const availableLinks = socialLinks.filter((link) => link.getUrl(user));

  if (availableLinks.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
        <p className="text-sm text-slate-400 italic">No social links added yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
      <div className="space-y-3">
        {availableLinks.map((link) => {
          const url = link.getUrl(user);
          if (!url) return null;

          const Icon = link.icon;

          return (
            <a
              key={link.key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/10 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {link.label}
                </span>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

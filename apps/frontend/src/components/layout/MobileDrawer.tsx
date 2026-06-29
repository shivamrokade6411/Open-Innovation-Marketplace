'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, type LucideIcon } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export interface MobileDrawerLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  links: MobileDrawerLink[];
}

export function MobileDrawer({ isOpen, onClose, links }: MobileDrawerProps): JSX.Element {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const user = useSelector((state: RootState) => state.auth.user) || {
    name: 'Shivam Rokade',
    email: 'shivam@example.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 top-0 z-50 flex w-full max-w-[280px] flex-col bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-white/5 shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-secondary" />
                <span className="text-lg font-black tracking-wider text-slate-800 dark:text-white uppercase font-mono">
                  OIM
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-surface-card-dark text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary/15 to-secondary/15 text-primary border-l-4 border-primary'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 dark:border-white/5 pt-6 flex items-center gap-3">
              <Avatar src={user.avatar} name={user.name} size="md" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-850 dark:text-white truncate leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">
                  {user.role}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

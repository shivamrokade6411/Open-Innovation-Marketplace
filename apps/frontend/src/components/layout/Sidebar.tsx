'use client';

import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Trophy,
  Award,
  Briefcase,
  MessageSquare,
  Bell,
  User,
  Settings,
  type LucideIcon
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/dashboardSlice';
import { Avatar } from '../ui/Avatar';
import Link from 'next/link';

export interface SidebarLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const navigationLinks: SidebarLink[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Challenges', href: '/dashboard/challenges', icon: Trophy },
  { name: 'Certificates', href: '/dashboard/certificates', icon: Award },
  { name: 'Company', href: '/dashboard/company', icon: Briefcase },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar(): JSX.Element {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const collapsed = useSelector((state: RootState) => state.dashboard.sidebarCollapsed);

  const user = useSelector((state: RootState) => state.auth.user) || {
    name: 'Shivam Rokade',
    email: 'shivam@example.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 240 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="hidden md:flex flex-col h-screen bg-white dark:bg-surface-dark border-r border-slate-200/80 dark:border-white/5 sticky top-0 overflow-hidden shrink-0 select-none p-4"
    >
      {/* Top logo */}
      <div className="flex items-center justify-between mb-8 px-2 h-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-r from-primary to-secondary shrink-0 shadow-md shadow-primary/20" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="text-md font-black tracking-widest text-slate-800 dark:text-white uppercase font-mono truncate"
              >
                OIM
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navigationLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3.5 px-3 py-3 rounded-xl font-semibold text-xs transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-l-4 border-primary'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="truncate"
                >
                  {link.name}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="my-3 flex justify-end shrink-0">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-55 dark:bg-surface-card-dark text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* User profile footer */}
      <div className="border-t border-slate-150 dark:border-white/5 pt-4 flex items-center gap-3 shrink-0">
        <Avatar src={user.avatar} name={user.name} size="md" />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-sm font-bold text-slate-800 dark:text-white truncate leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">
                {user.role}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}

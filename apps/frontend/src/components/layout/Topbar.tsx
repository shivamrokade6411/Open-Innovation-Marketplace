'use client';

import { Search, Bell, LogOut, User, Settings, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { RootState } from '../../store';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar } from '../ui/Avatar';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator
} from '../ui/Dropdown';

export interface TopbarProps {
  onOpenMobileDrawer: () => void;
  onOpenNotificationsPanel: () => void;
}

export function Topbar({ onOpenMobileDrawer, onOpenNotificationsPanel }: TopbarProps): JSX.Element {
  const pathname = usePathname();
  
  const user = useSelector((state: RootState) => state.auth.user) || {
    name: 'Shivam Rokade',
    email: 'shivam@example.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
  };

  const notifications = useSelector((state: RootState) => state.dashboard.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return ['Dashboard', 'Overview'];
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md px-4 md:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileDrawer}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-surface-card-dark text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-slate-400 dark:text-slate-650">/</span>}
              <span className={idx === breadcrumbs.length - 1 ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}>
                {crumb}
              </span>
            </div>
          ))}
        </nav>
      </div>

      <div className="relative hidden max-w-xs w-full mx-4 md:block">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Global Search (Ctrl + K)..."
          className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-surface-card-dark text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-surface-card-dark text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 md:hidden">
          <Search className="h-4 w-4" />
        </button>

        <button
          onClick={onOpenNotificationsPanel}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-surface-card-dark text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-850 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-black font-mono text-white ring-2 ring-white dark:ring-surface-dark animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <ThemeToggle />

        <div className="h-6 w-px bg-slate-200 dark:bg-white/5" />

        <Dropdown>
          <DropdownTrigger className="outline-none">
            <div className="flex items-center gap-2 group cursor-pointer">
              <Avatar
                src={user.avatar}
                name={user.name}
                size="md"
                className="group-hover:ring-2 group-hover:ring-primary/50 transition-all duration-300"
              />
            </div>
          </DropdownTrigger>
          <DropdownContent align="end" className="w-56 mt-2">
            <DropdownLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.name}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold truncate lowercase">{user.email}</span>
              </div>
            </DropdownLabel>
            <DropdownSeparator />
            <DropdownItem>
              <User className="h-4 w-4 text-slate-450" />
              <span>My Profile</span>
            </DropdownItem>
            <DropdownItem>
              <Settings className="h-4 w-4 text-slate-450" />
              <span>Settings</span>
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem className="text-danger focus:bg-danger/10 focus:text-danger font-bold">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </header>
  );
}

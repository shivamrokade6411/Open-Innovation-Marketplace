'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../lib/useAppDispatch';
import { logoutThunk, clearAuth } from '../../store/authSlice';
import { RootState } from '../../store';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from '../ui/Dropdown';
import { LayoutDashboard, User, Settings, LogOut } from 'lucide-react';

export function Navbar(): JSX.Element {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await dispatch(logoutThunk(refreshToken));
      }
      dispatch(clearAuth());
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      dispatch(clearAuth());
      router.push('/login');
    }
  };

  const getDashboardPath = (role?: string) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'company') return '/company/dashboard';
    return '/dashboard';
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    company: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    innovator: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-white/5 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
          Open Innovation Marketplace
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden gap-8 md:flex items-center">
            <Link href="/challenges" className="text-sm font-medium text-slate-600 hover:text-indigo-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors">
              Challenges
            </Link>
            <Link href="/companies" className="text-sm font-medium text-slate-600 hover:text-indigo-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors">
              Companies
            </Link>
            <Link href="/blog" className="text-sm font-medium text-slate-600 hover:text-indigo-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors">
              Blog
            </Link>
            {isAuthenticated && (
              <Link href={getDashboardPath(user?.role)} className="text-sm font-medium text-slate-600 hover:text-indigo-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors">
                Dashboard
              </Link>
            )}
          </nav>

          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />
          
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {isAuthenticated && user ? (
              <Dropdown>
                <DropdownTrigger className="outline-none">
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      size="sm"
                      className="group-hover:ring-2 group-hover:ring-primary/50 transition-all duration-300"
                    />
                  </div>
                </DropdownTrigger>
                <DropdownContent align="end" className="w-56 mt-2">
                  <DropdownLabel>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold truncate lowercase">{user.email}</span>
                      <span className={`w-fit self-start mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${roleColors[user.role] || 'bg-slate-100 text-slate-800'}`}>
                        {user.role}
                      </span>
                    </div>
                  </DropdownLabel>
                  <DropdownSeparator />
                  <DropdownItem onClick={() => router.push(getDashboardPath(user.role))}>
                    <LayoutDashboard className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <span>Dashboard</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push('/dashboard/profile')}>
                    <User className="h-4 w-4 text-slate-450" />
                    <span>My Profile</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push('/dashboard/settings')}>
                    <Settings className="h-4 w-4 text-slate-450" />
                    <span>Settings</span>
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem onClick={handleLogout} className="text-danger focus:bg-danger/10 focus:text-danger font-bold">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                  Log In
                </Button>
                <Button variant="primary" size="sm" onClick={() => router.push('/register')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

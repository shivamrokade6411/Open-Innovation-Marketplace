/*
 * Purpose: Redirect wrapper for dashboard profile route.
 * Author: Antigravity
 * Date: 2026-08-11
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { Loader2 } from 'lucide-react';

export default function DashboardProfileRedirect(): JSX.Element {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      router.replace(`/profile/${user._id}`);
    } else {
      router.replace('/login');
    }
  }, [user, isAuthenticated, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-white">
      <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      <p className="mt-4 text-slate-400">Routing to profile...</p>
    </div>
  );
}

/*
 * Purpose: Interactive bookmark toggle button for challenge cards.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface SaveChallengeButtonProps {
  slug: string;
}

export function SaveChallengeButton({ slug }: SaveChallengeButtonProps): JSX.Element {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      if (!session) {
        setChecking(false);
        return;
      }
      try {
        const res = await api.get(`/api/challenges/${slug}/save`);
        if (res.data.success) {
          setIsSaved(res.data.saved);
        }
      } catch (err) {
        console.error('Failed to fetch challenge save status', err);
      } finally {
        setChecking(false);
      }
    }
    checkStatus();
  }, [slug, session]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error('Authentication is required to save challenges.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/api/challenges/${slug}/save`);
      if (res.data.success) {
        setIsSaved(res.data.saved);
        if (res.data.saved) {
          toast.success('Challenge bookmarked!');
        } else {
          toast.success('Challenge bookmark removed!');
        }
      }
    } catch (err) {
      toast.error('Failed to update bookmark status.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <button disabled className="h-10 px-4 rounded-xl bg-white/5 border border-white/5 text-slate-400 flex items-center justify-center gap-1.5 text-xs font-semibold">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Check
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`h-10 px-4 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition ${
        isSaved
          ? 'bg-purple-600/20 border-purple-500/30 text-purple-400'
          : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
      }`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
      )}
      <span>{isSaved ? 'Saved' : 'Save'}</span>
    </button>
  );
}

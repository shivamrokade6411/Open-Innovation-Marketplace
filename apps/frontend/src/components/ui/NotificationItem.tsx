'use client';

import { Trophy, FileCheck, Mail, CreditCard, Bell, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NotificationData } from '../../lib/mockData';

export interface NotificationItemProps {
  notification: NotificationData;
  onRead: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps): JSX.Element {
  const iconMap = {
    challenge: <Trophy className="h-5 w-5 text-primary" />,
    submission: <FileCheck className="h-5 w-5 text-success" />,
    message: <Mail className="h-5 w-5 text-accent" />,
    payment: <CreditCard className="h-5 w-5 text-secondary" />,
    system: <Bell className="h-5 w-5 text-warning" />
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date('2026-06-29T18:37:54+05:30'); // Fixed reference time
    const diffMs = now.getTime() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div
      onClick={() => !notification.read && onRead(notification.id)}
      className={cn(
        'group flex items-start gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer border border-transparent select-none',
        notification.read
          ? 'hover:bg-slate-50 dark:hover:bg-white/5'
          : 'bg-primary/5 hover:bg-primary/10 border-primary/10'
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-white/5 shadow-sm group-hover:scale-105 transition-transform">
        {iconMap[notification.type] || <Bell className="h-5 w-5 text-slate-450" />}
      </div>
      <div className="flex-1 space-y-1">
        <p className={cn(
          'text-xs leading-relaxed text-slate-700 dark:text-slate-300',
          !notification.read && 'font-semibold text-slate-900 dark:text-white'
        )}>
          {notification.text}
        </p>
        <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">
          {getRelativeTime(notification.date)}
        </span>
      </div>
      {!notification.read && (
        <span className="h-2 w-2 rounded-full bg-primary shrink-0 self-center" />
      )}
    </div>
  );
}

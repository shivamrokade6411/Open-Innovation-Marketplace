'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { markAllNotificationsRead, markNotificationRead } from '../../store/dashboardSlice';
import { NotificationItem } from '../ui/NotificationItem';
import { Button } from '../ui/Button';

export interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps): JSX.Element {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.dashboard.notifications);
  const recentNotifications = notifications.slice(0, 5);
  const unreadCount = notifications.filter(n => !n.read).length;

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[360px] flex-col bg-white dark:bg-surface-dark border-l border-slate-200 dark:border-white/5 shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase font-mono">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-xs font-mono font-bold text-primary">
                    ({unreadCount} new)
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-surface-card-dark text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {unreadCount > 0 && (
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Check className="h-4 w-4" />}
                  onClick={() => dispatch(markAllNotificationsRead())}
                  className="w-full text-xs font-bold uppercase tracking-wider text-primary bg-primary/5 hover:bg-primary/10 rounded-xl"
                >
                  Mark all read
                </Button>
              </div>
            )}

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                  <p className="text-sm font-semibold">All caught up!</p>
                </div>
              ) : (
                recentNotifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={(id) => dispatch(markNotificationRead(id))}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

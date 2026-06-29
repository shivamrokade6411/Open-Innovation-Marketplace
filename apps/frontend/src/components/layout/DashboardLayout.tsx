'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar, navigationLinks } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileDrawer } from './MobileDrawer';
import { NotificationsPanel } from '../dashboard/NotificationsPanel';

export function DashboardLayout({ children }: { children: ReactNode }): JSX.Element {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-light dark:bg-surface-dark overflow-hidden">
      {/* Desktop Collapsible Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        links={navigationLinks}
      />

      {/* Main Content Area Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative overflow-hidden">
        <Topbar
          onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
          onOpenNotificationsPanel={() => setNotifPanelOpen(true)}
        />

        {/* Scrollable Padded Workspace */}
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Notification Panel Sidebar */}
        <NotificationsPanel isOpen={notifPanelOpen} onClose={() => setNotifPanelOpen(false)} />
      </div>
    </div>
  );
}

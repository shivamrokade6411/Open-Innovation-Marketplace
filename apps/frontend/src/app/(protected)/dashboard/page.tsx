'use client';

import { motion } from 'framer-motion';
import { WelcomeBanner } from '../../../components/dashboard/WelcomeBanner';
import { StatsRow } from '../../../components/dashboard/StatsRow';
import { RevenueChart } from '../../../components/dashboard/RevenueChart';
import { AnalyticsRow } from '../../../components/dashboard/AnalyticsRow';
import { ActivityTable } from '../../../components/dashboard/ActivityTable';
import { Leaderboard } from '../../../components/dashboard/Leaderboard';
import { QuickTasks } from '../../../components/dashboard/QuickTasks';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 22
    }
  }
};

export default function DashboardPage(): JSX.Element {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* 1. Welcome Banner */}
      <motion.div variants={itemVariants}>
        <WelcomeBanner />
      </motion.div>

      {/* 2. Stats Cards Row */}
      <motion.div variants={itemVariants}>
        <StatsRow />
      </motion.div>

      {/* 3. Revenue Chart */}
      <motion.div variants={itemVariants}>
        <RevenueChart />
      </motion.div>

      {/* 4. Analytics Row */}
      <motion.div variants={itemVariants}>
        <AnalyticsRow />
      </motion.div>

      {/* 5. Lower Dashboard Layout: Table + Leaderboard & Tasks */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width) - Recent Activity Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ActivityTable />
        </motion.div>

        {/* Right Column (1/3 width) - Leaderboard + Quick Tasks */}
        <div className="space-y-6 lg:col-span-1">
          <motion.div variants={itemVariants}>
            <Leaderboard />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuickTasks />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

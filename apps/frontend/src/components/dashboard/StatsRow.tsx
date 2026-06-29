'use client';

import { DollarSign, Users, UserPlus, Percent } from 'lucide-react';
import { StatCard } from '../ui/StatCard';

export function StatsRow(): JSX.Element {
  // Sparkline mock values for each card
  const revenueSpark = [110, 115, 121, 118, 126, 124.5];
  const usersSpark = [8200, 8300, 8350, 8400, 8420, 8492];
  const signupsSpark = [980, 1050, 1100, 1050, 1180, 1230];
  const conversionSpark = [4.8, 4.7, 4.9, 4.5, 4.7, 4.6];

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Revenue"
        value={124500}
        icon={DollarSign}
        trend={12.5}
        sparklineData={revenueSpark}
        isCurrency
      />
      <StatCard
        label="Active Users"
        value={8492}
        icon={Users}
        trend={3.2}
        sparklineData={usersSpark}
      />
      <StatCard
        label="New Signups"
        value={1230}
        icon={UserPlus}
        trend={18.7}
        sparklineData={signupsSpark}
      />
      <StatCard
        label="Conversion Rate"
        value={4.6}
        icon={Percent}
        trend={-0.8}
        sparklineData={conversionSpark}
        isPercentage
      />
    </section>
  );
}

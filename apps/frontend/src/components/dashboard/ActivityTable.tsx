'use client';

import { useQuery } from '@tanstack/react-query';
import { recentActivity, type RecentActivity } from '../../lib/mockData';
import { DataTable, type Column } from '../ui/DataTable';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

const fetchActivitiesMock = async (): Promise<RecentActivity[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(recentActivity);
    }, 1200); // 1.2s simulated delay
  });
};

export function ActivityTable(): JSX.Element {
  const { data = [], isLoading } = useQuery<RecentActivity[]>({
    queryKey: ['recentActivity'],
    queryFn: fetchActivitiesMock,
  });

  const columns: Column<RecentActivity>[] = [
    {
      key: 'user',
      header: 'User',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.user.avatar} name={row.user.name} size="sm" />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-800 dark:text-white truncate">{row.user.name}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate lowercase leading-none mt-1">
              {row.user.email}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-700 dark:text-slate-350">{row.action}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => {
        const variantMap = {
          success: 'success',
          pending: 'warning',
          failed: 'danger'
        } as const;
        return <Badge variant={variantMap[row.status]}>{row.status}</Badge>;
      }
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold">
          {new Date(row.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.amount)}
        </span>
      )
    }
  ];

  return (
    <Card variant="glass" className="space-y-6">
      <div>
        <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase font-mono">
          Recent Activity
        </h2>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
          Monitor recent platform audits, transactions, and changes
        </p>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={isLoading}
        defaultSortKey="date"
        searchPlaceholder="Search transactions..."
      />
    </Card>
  );
}

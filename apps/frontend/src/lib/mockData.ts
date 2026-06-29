export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export interface UserGrowthData {
  month: string;
  newUsers: number;
  churnedUsers: number;
}

export interface TrafficSourceData {
  name: string;
  value: number;
  color: string;
}

export interface ActivityUser {
  name: string;
  email: string;
  avatar?: string;
}

export interface RecentActivity {
  id: string;
  user: ActivityUser;
  action: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  amount: number;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  change: 'up' | 'down' | 'flat';
}

export interface NotificationData {
  id: string;
  text: string;
  type: 'challenge' | 'submission' | 'message' | 'payment' | 'system';
  read: boolean;
  date: string;
}

export interface QuickTask {
  id: string;
  label: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const revenueData: RevenueData[] = [
  { month: 'Jul 2025', revenue: 78000, target: 80000 },
  { month: 'Aug 2025', revenue: 84000, target: 82000 },
  { month: 'Sep 2025', revenue: 89000, target: 85000 },
  { month: 'Oct 2025', revenue: 95000, target: 90000 },
  { month: 'Nov 2025', revenue: 92000, target: 92000 },
  { month: 'Dec 2025', revenue: 104000, target: 95000 },
  { month: 'Jan 2026', revenue: 108000, target: 100000 },
  { month: 'Feb 2026', revenue: 115000, target: 105000 },
  { month: 'Mar 2026', revenue: 121000, target: 110000 },
  { month: 'Apr 2026', revenue: 118000, target: 115000 },
  { month: 'May 2026', revenue: 126000, target: 120000 },
  { month: 'Jun 2026', revenue: 124500, target: 122000 }
];

export const userGrowthData: UserGrowthData[] = [
  { month: 'Jan', newUsers: 850, churnedUsers: 120 },
  { month: 'Feb', newUsers: 940, churnedUsers: 95 },
  { month: 'Mar', newUsers: 1120, churnedUsers: 140 },
  { month: 'Apr', newUsers: 980, churnedUsers: 160 },
  { month: 'May', newUsers: 1250, churnedUsers: 110 },
  { month: 'Jun', newUsers: 1230, churnedUsers: 135 }
];

export const trafficSourceData: TrafficSourceData[] = [
  { name: 'Organic Search', value: 4500, color: '#6366f1' },
  { name: 'Paid Ads', value: 2300, color: '#8b5cf6' },
  { name: 'Referrals', value: 1400, color: '#06b6d4' },
  { name: 'Social Media', value: 1100, color: '#10b981' },
  { name: 'Direct Traffic', value: 950, color: '#f59e0b' }
];

export const recentActivity: RecentActivity[] = [
  {
    id: 'TX-1001',
    user: { name: 'Olivia Martinez', email: 'olivia.m@example.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    action: 'Subscribed to Enterprise Plan',
    status: 'success',
    date: '2026-06-29T14:32:00Z',
    amount: 1499.00
  },
  {
    id: 'TX-1002',
    user: { name: 'Liam Henderson', email: 'liam.h@example.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    action: 'Prize withdrawal request',
    status: 'pending',
    date: '2026-06-29T12:15:00Z',
    amount: 5000.00
  },
  {
    id: 'TX-1003',
    user: { name: 'Sophia Chen', email: 'sophia.c@example.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
    action: 'Payment failed for API Add-on',
    status: 'failed',
    date: '2026-06-29T09:44:00Z',
    amount: 49.00
  },
  {
    id: 'TX-1004',
    user: { name: 'Noah Miller', email: 'noah.m@example.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
    action: 'Subscribed to Professional Plan',
    status: 'success',
    date: '2026-06-28T18:20:00Z',
    amount: 499.00
  },
  {
    id: 'TX-1005',
    user: { name: 'Ava Patterson', email: 'ava.p@example.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
    action: 'Purchased extra credits',
    status: 'success',
    date: '2026-06-28T15:10:00Z',
    amount: 99.00
  },
  {
    id: 'TX-1006',
    user: { name: 'Lucas Wright', email: 'lucas.w@example.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
    action: 'Refunded for delayed payout',
    status: 'success',
    date: '2026-06-28T11:05:00Z',
    amount: 250.00
  },
  {
    id: 'TX-1007',
    user: { name: 'Emma Watson', email: 'emma.w@example.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
    action: 'Subscribed to Growth Plan',
    status: 'success',
    date: '2026-06-27T22:15:00Z',
    amount: 199.00
  },
  {
    id: 'TX-1008',
    user: { name: 'Jackson Ross', email: 'jackson.r@example.com', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face' },
    action: 'Custom challenge sponsor setup',
    status: 'pending',
    date: '2026-06-27T16:30:00Z',
    amount: 2500.00
  },
  {
    id: 'TX-1009',
    user: { name: 'Isabella Taylor', email: 'isabella.t@example.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face' },
    action: 'API overuse charge',
    status: 'success',
    date: '2026-06-27T14:12:00Z',
    amount: 145.20
  },
  {
    id: 'TX-1010',
    user: { name: 'Ethan Hunt', email: 'ethan.h@example.com', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face' },
    action: 'Subscribed to Professional Plan',
    status: 'success',
    date: '2026-06-27T08:05:00Z',
    amount: 499.00
  },
  {
    id: 'TX-1011',
    user: { name: 'Mia Khalifa', email: 'mia.k@example.com' },
    action: 'Premium consulting booking',
    status: 'failed',
    date: '2026-06-26T19:50:00Z',
    amount: 1200.00
  },
  {
    id: 'TX-1012',
    user: { name: 'James Carter', email: 'james.c@example.com', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face' },
    action: 'Subscribed to Growth Plan',
    status: 'success',
    date: '2026-06-26T15:20:00Z',
    amount: 199.00
  },
  {
    id: 'TX-1013',
    user: { name: 'Charlotte Brown', email: 'charlotte.b@example.com', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face' },
    action: 'Prize withdrawal request',
    status: 'success',
    date: '2026-06-26T10:10:00Z',
    amount: 1500.00
  },
  {
    id: 'TX-1014',
    user: { name: 'Aiden Smith', email: 'aiden.s@example.com', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
    action: 'Subscribed to Professional Plan',
    status: 'success',
    date: '2026-06-25T17:40:00Z',
    amount: 499.00
  },
  {
    id: 'TX-1015',
    user: { name: 'Amelia Earhart', email: 'amelia.e@example.com' },
    action: 'Sponsored challenge fee',
    status: 'success',
    date: '2026-06-25T13:30:00Z',
    amount: 5000.00
  },
  {
    id: 'TX-1016',
    user: { name: 'Benjamin Button', email: 'ben.b@example.com', avatar: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=100&h=100&fit=crop&crop=face' },
    action: 'Payment failed for Professional renewal',
    status: 'failed',
    date: '2026-06-25T09:12:00Z',
    amount: 499.00
  },
  {
    id: 'TX-1017',
    user: { name: 'Chloe Grace', email: 'chloe.g@example.com', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop&crop=face' },
    action: 'Purchased extra credits',
    status: 'success',
    date: '2026-06-24T18:25:00Z',
    amount: 99.00
  },
  {
    id: 'TX-1018',
    user: { name: 'Daniel Craig', email: 'daniel.c@example.com', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&h=100&fit=crop&crop=face' },
    action: 'Subscribed to Professional Plan',
    status: 'success',
    date: '2026-06-24T14:15:00Z',
    amount: 499.00
  },
  {
    id: 'TX-1019',
    user: { name: 'Grace Hopper', email: 'grace.h@example.com' },
    action: 'Bug bounty payout',
    status: 'success',
    date: '2026-06-24T11:00:00Z',
    amount: 1000.00
  },
  {
    id: 'TX-1020',
    user: { name: 'Henry Ford', email: 'henry.f@example.com', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face' },
    action: 'Subscribed to Enterprise Plan',
    status: 'success',
    date: '2026-06-23T16:45:00Z',
    amount: 1499.00
  }
];

export const leaderboardData: LeaderboardEntry[] = [
  { id: 'lead-1', rank: 1, name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face', score: 980, change: 'flat' },
  { id: 'lead-2', rank: 2, name: 'Sarah Connor', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face', score: 945, change: 'up' },
  { id: 'lead-3', rank: 3, name: 'David Miller', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', score: 920, change: 'down' },
  { id: 'lead-4', rank: 4, name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face', score: 890, change: 'up' },
  { id: 'lead-5', rank: 5, name: 'Michael Chang', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', score: 875, change: 'down' },
  { id: 'lead-6', rank: 6, name: 'Sofia Rodriguez', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', score: 850, change: 'up' },
  { id: 'lead-7', rank: 7, name: 'Kevin Durant', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face', score: 820, change: 'flat' },
  { id: 'lead-8', rank: 8, name: 'Laura Croft', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face', score: 810, change: 'up' },
  { id: 'lead-9', rank: 9, name: 'Peter Parker', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face', score: 790, change: 'down' },
  { id: 'lead-10', rank: 10, name: 'Tony Stark', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face', score: 785, change: 'up' }
];

export const initialNotifications: NotificationData[] = [
  { id: 'notif-1', text: 'New challenge "AI Sustainability Hackathon" is now active.', type: 'challenge', read: false, date: '2026-06-29T17:30:00Z' },
  { id: 'notif-2', text: 'Your submission for "Mobile Payment UI" was shortlisted!', type: 'submission', read: false, date: '2026-06-29T16:15:00Z' },
  { id: 'notif-3', text: 'You received a message from mentor Dr. Emily Watson.', type: 'message', read: true, date: '2026-06-29T14:00:00Z' },
  { id: 'notif-4', text: 'Subscription payment of $499.00 processed successfully.', type: 'payment', read: true, date: '2026-06-28T18:20:00Z' },
  { id: 'notif-5', text: 'System upgrade completed. Welcome to version 2.4.0!', type: 'system', read: true, date: '2026-06-27T08:00:00Z' }
];

export const initialTasks: QuickTask[] = [
  { id: 'task-1', label: 'Review AI Sustainability challenges guidelines', completed: false, priority: 'high' },
  { id: 'task-2', label: 'Export monthly sales figures for executive report', completed: true, priority: 'medium' },
  { id: 'task-3', label: 'Approve pending submission withdrawals', completed: false, priority: 'high' },
  { id: 'task-4', label: 'Update platform API documentation for developers', completed: false, priority: 'low' },
  { id: 'task-5', label: 'Prepare slide deck for quarterly business review', completed: false, priority: 'medium' },
  { id: 'task-6', label: 'Optimize main landing page web vital metrics', completed: true, priority: 'high' },
  { id: 'task-7', label: 'Schedule developer community AMA on Discord', completed: false, priority: 'low' },
  { id: 'task-8', label: 'Conduct post-mortem on billing system downtime', completed: false, priority: 'high' }
];

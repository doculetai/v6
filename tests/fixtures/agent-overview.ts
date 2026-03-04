import type { ActivityTimelineItem } from '@/components/ui/activity-timeline';

export const agentOverviewStatsFixture = {
  totalStudents: 12,
  activeStudents: 8,
  pendingCommissions: 180_000,
  totalEarned: 420_000,
};

export const agentRecentActivityFixture: ActivityTimelineItem[] = [
  {
    id: 'act-1',
    title: 'Amara Okafor completed KYC',
    description: 'Identity verification approved',
    timestamp: '2026-03-04T08:30:00.000Z',
    tone: 'success',
  },
  {
    id: 'act-2',
    title: 'Emeka Balogun submitted bank statement',
    description: 'PDF upload complete — awaiting admin review',
    timestamp: '2026-03-04T07:15:00.000Z',
    tone: 'info',
  },
  {
    id: 'act-3',
    title: 'Chioma Adeyemi awaiting sponsor',
    description: 'Student is pending sponsor confirmation',
    timestamp: '2026-03-03T16:45:00.000Z',
    tone: 'warning',
  },
  {
    id: 'act-4',
    title: 'Tunde Fashola certificate issued',
    description: 'Proof of funds certificate ready for download',
    timestamp: '2026-03-03T10:00:00.000Z',
    tone: 'success',
  },
];

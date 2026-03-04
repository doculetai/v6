import type { UniversityOverviewOutput } from '@/server/routers/university';

export const universityOverviewFixture: UniversityOverviewOutput = {
  pendingCount: 12,
  approvedTodayCount: 3,
  flaggedCount: 2,
  totalStudents: 47,
  recentActivity: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'approved',
      type: 'bank_statement',
      createdAt: '2026-03-04T09:30:00.000Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      status: 'rejected',
      type: 'passport',
      createdAt: '2026-03-04T08:15:00.000Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      status: 'more_info_requested',
      type: 'offer_letter',
      createdAt: '2026-03-04T07:00:00.000Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      status: 'pending',
      type: 'bank_statement',
      createdAt: '2026-03-04T06:45:00.000Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      status: 'approved',
      type: 'affidavit',
      createdAt: '2026-03-03T22:00:00.000Z',
    },
  ],
};

export const universityOverviewEmptyFixture: UniversityOverviewOutput = {
  pendingCount: 0,
  approvedTodayCount: 0,
  flaggedCount: 0,
  totalStudents: 0,
  recentActivity: [],
};

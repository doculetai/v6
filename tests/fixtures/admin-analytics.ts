import type { AdminAnalyticsData } from '@/db/queries/admin-analytics';

export const adminAnalyticsFixture: AdminAnalyticsData = {
  overviewStats: {
    totalUsers: 1_250,
    activeStudents: 873,
    pendingDocuments: 42,
    certificatesIssued: 318,
    revenueThisMonthKobo: 12_500_000, // NGN 125,000
    flaggedItems: 7,
  },
  applicationsByWeek: [
    { period: '2026-W09', label: 'W09', count: 18 },
    { period: '2026-W10', label: 'W10', count: 24 },
    { period: '2026-W11', label: 'W11', count: 31 },
    { period: '2026-W12', label: 'W12', count: 27 },
    { period: '2026-W13', label: 'W13', count: 19 },
    { period: '2026-W14', label: 'W14', count: 22 },
    { period: '2026-W15', label: 'W15', count: 35 },
    { period: '2026-W16', label: 'W16', count: 41 },
  ],
  applicationsByMonth: [
    { period: '2025-10', label: 'Oct', count: 87 },
    { period: '2025-11', label: 'Nov', count: 102 },
    { period: '2025-12', label: 'Dec', count: 64 },
    { period: '2026-01', label: 'Jan', count: 119 },
    { period: '2026-02', label: 'Feb', count: 134 },
    { period: '2026-03', label: 'Mar', count: 41 },
  ],
  approvalRate: 87.3,
  avgReviewTimeHours: 4.2,
  topUniversities: [
    { id: '11111111-1111-1111-1111-111111111111', name: 'University of Lagos', studentCount: 214 },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Covenant University', studentCount: 187 },
    { id: '33333333-3333-3333-3333-333333333333', name: 'University of Ibadan', studentCount: 156 },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Obafemi Awolowo University', studentCount: 143 },
    { id: '55555555-5555-5555-5555-555555555555', name: 'University of Benin', studentCount: 98 },
  ],
  fundingBreakdown: [
    { key: 'sponsor', label: 'Sponsored', count: 612, percentage: 70 },
    { key: 'self', label: 'Self-funded', count: 183, percentage: 21 },
    { key: 'corporate', label: 'Corporate', count: 78, percentage: 9 },
  ],
  documentStatusBreakdown: [
    { key: 'approved', label: 'Approved', count: 1_843, percentage: 52 },
    { key: 'pending', label: 'Pending', count: 712, percentage: 20 },
    { key: 'rejected', label: 'Rejected', count: 531, percentage: 15 },
    { key: 'more_info_requested', label: 'Info needed', count: 462, percentage: 13 },
  ],
  updatedAt: '2026-03-04T00:00:00.000Z',
};

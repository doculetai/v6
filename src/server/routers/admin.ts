import { z } from 'zod';

import { getAdminAnalytics } from '@/db/queries/admin-analytics';

import { createTRPCRouter, roleProcedure } from '../trpc';

const AnalyticsPeriodPointSchema = z.object({
  period: z.string(),
  label: z.string(),
  count: z.number().int().nonnegative(),
});

const TopUniversitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  studentCount: z.number().int().nonnegative(),
});

const BreakdownItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  count: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
});

const AdminAnalyticsOutputSchema = z.object({
  overviewStats: z.object({
    totalUsers: z.number().int().nonnegative(),
    activeStudents: z.number().int().nonnegative(),
    pendingDocuments: z.number().int().nonnegative(),
    certificatesIssued: z.number().int().nonnegative(),
    revenueThisMonthKobo: z.number().nonnegative(),
    flaggedItems: z.number().int().nonnegative(),
  }),
  applicationsByWeek: z.array(AnalyticsPeriodPointSchema),
  applicationsByMonth: z.array(AnalyticsPeriodPointSchema),
  approvalRate: z.number().min(0).max(100),
  avgReviewTimeHours: z.number().nonnegative(),
  topUniversities: z.array(TopUniversitySchema),
  fundingBreakdown: z.array(BreakdownItemSchema),
  documentStatusBreakdown: z.array(BreakdownItemSchema),
  updatedAt: z.string(),
});

export const adminRouter = createTRPCRouter({
  getAnalytics: roleProcedure('admin')
    .output(AdminAnalyticsOutputSchema)
    .query(async ({ ctx }) => {
      return getAdminAnalytics(ctx.db);
    }),
});

import { z } from 'zod';

import {
  getSponsorDashboardStats,
  getSponsorLinkedStudents,
  getSponsorRecentActivity,
} from '@/db/queries/sponsor';

import { createTRPCRouter, roleProcedure } from '../trpc';

const dashboardStatsOutputSchema = z.object({
  totalFundedKobo: z.number().int().nonnegative(),
  activeStudents: z.number().int().nonnegative(),
  pendingDisbursements: z.number().int().nonnegative(),
  kycTier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

const activityEventOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  timestamp: z.string().datetime(),
  tone: z.enum(['neutral', 'success', 'warning', 'error', 'info']),
});

const linkedStudentOutputSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  universityName: z.string().nullable(),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  status: z.enum([
    'draft',
    'submitted',
    'under_review',
    'approved',
    'certificate_issued',
    'rejected',
    'action_required',
    'expired',
  ]),
});

export const sponsorRouter = createTRPCRouter({
  getDashboardStats: roleProcedure('sponsor')
    .input(z.void())
    .output(dashboardStatsOutputSchema)
    .query(async ({ ctx }) => getSponsorDashboardStats(ctx.db, ctx.user.id)),

  getRecentActivity: roleProcedure('sponsor')
    .input(z.void())
    .output(z.array(activityEventOutputSchema))
    .query(async ({ ctx }) => getSponsorRecentActivity(ctx.db, ctx.user.id)),

  getLinkedStudents: roleProcedure('sponsor')
    .input(z.void())
    .output(z.array(linkedStudentOutputSchema))
    .query(async ({ ctx }) => getSponsorLinkedStudents(ctx.db, ctx.user.id)),
});

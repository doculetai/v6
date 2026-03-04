import { z } from 'zod';

import {
  getAgentCommissions,
  getAgentCommissionStats,
  getAgentOverviewStats,
} from '@/db/queries/agents';

import { createTRPCRouter, roleProcedure } from '../trpc';

export const CommissionEventTypeSchema = z.enum([
  'kycComplete',
  'certificateIssued',
  'sponsorCommitted',
  'referralBonus',
]);

export const CommissionStatusSchema = z.enum(['pending', 'processing', 'paid']);

export const CommissionRecordSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().uuid(),
  studentName: z.string(),
  universityName: z.string(),
  tier: z.number().int().min(1).max(3),
  eventType: CommissionEventTypeSchema,
  amountKobo: z.number().int().nonnegative(),
  status: CommissionStatusSchema,
  paidAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CommissionStatsSchema = z.object({
  pendingPayout: z.number().int().nonnegative(),
  paidThisMonth: z.number().int().nonnegative(),
  totalLifetime: z.number().int().nonnegative(),
});

const OverviewStatsSchema = z.object({
  totalStudents: z.number().int().nonnegative(),
  activeStudents: z.number().int().nonnegative(),
  pendingCommissions: z.number().int().nonnegative(),
  totalEarned: z.number().int().nonnegative(),
});

const ActivityItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  timestamp: z.string(),
  tone: z.enum(['neutral', 'success', 'warning', 'error', 'info']).optional(),
});

export const agentRouter = createTRPCRouter({
  getCommissions: roleProcedure('agent')
    .output(z.array(CommissionRecordSchema))
    .query(async ({ ctx }) => {
      return getAgentCommissions(ctx.db, ctx.user.id);
    }),

  getCommissionStats: roleProcedure('agent')
    .output(CommissionStatsSchema)
    .query(async ({ ctx }) => {
      return getAgentCommissionStats(ctx.db, ctx.user.id);
    }),

  getOverviewStats: roleProcedure('agent')
    .output(OverviewStatsSchema)
    .query(async ({ ctx }) => {
      return getAgentOverviewStats(ctx.db, ctx.user.id);
    }),

  getRecentActivity: roleProcedure('agent')
    .output(z.array(ActivityItemSchema))
    .query(async () => {
      // TODO: query activity log when agent activity table is added to schema
      return [];
    }),
});

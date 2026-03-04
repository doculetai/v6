import { z } from 'zod';

import { getAgentCommissions } from '@/db/queries/agents';

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

export const agentRouter = createTRPCRouter({
  getCommissions: roleProcedure('agent')
    .output(z.array(CommissionRecordSchema))
    .query(async ({ ctx }) => {
      return getAgentCommissions(ctx.db, ctx.user.id);
    }),
});

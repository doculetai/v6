import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { z } from 'zod';

import type { CommissionRecordSchema, CommissionStatsSchema } from '@/server/routers/agent';
import { api } from '@/trpc/server';

import { CommissionsPageClient } from './commissions-page-client';

export const metadata: Metadata = {
  title: 'Commissions — Agent Dashboard',
  description: 'Track your referral earnings from student verifications and certificate issuances.',
};

function deriveStats(
  commissions: z.infer<typeof CommissionRecordSchema>[],
): z.infer<typeof CommissionStatsSchema> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    pendingPayout: commissions
      .filter((c) => c.status === 'pending' || c.status === 'processing')
      .reduce((sum, c) => sum + c.amountKobo, 0),
    paidThisMonth: commissions
      .filter((c) => c.status === 'paid' && c.paidAt != null && new Date(c.paidAt) >= startOfMonth)
      .reduce((sum, c) => sum + c.amountKobo, 0),
    totalLifetime: commissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.amountKobo, 0),
  };
}

export default async function CommissionsPage() {
  let commissions: z.infer<typeof CommissionRecordSchema>[];

  try {
    const caller = await api();
    commissions = await caller.agent.getCommissions();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    throw error;
  }

  return <CommissionsPageClient commissions={commissions} stats={deriveStats(commissions)} />;
}

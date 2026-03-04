import type { Metadata } from 'next';
import { TRPCError } from '@trpc/server';
import { redirect } from 'next/navigation';

import { api } from '@/trpc/server';

import { AgentOverviewPageClient } from './overview-page-client';

export const metadata: Metadata = {
  title: 'Overview — Doculet.ai',
  description: 'Agent portfolio overview — students, activity, and commissions.',
};

async function getPageData() {
  const caller = await api();
  try {
    return await Promise.all([
      caller.agent.getOverviewStats(),
      caller.agent.getRecentActivity(),
    ]);
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    throw error;
  }
}

export default async function AgentOverviewPage() {
  const [stats, activity] = await getPageData();
  return <AgentOverviewPageClient stats={stats} activity={activity} />;
}

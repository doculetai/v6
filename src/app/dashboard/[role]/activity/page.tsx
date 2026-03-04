import { TRPCError } from '@trpc/server';
import type { inferRouterOutputs } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { agentCopy } from '@/config/copy/agent';
import { isDashboardRole } from '@/config/roles';
import type { AppRouter } from '@/server/root';
import { api } from '@/trpc/server';

import { ActivityPageClient } from './activity-page-client';

type ActivityPageProps = {
  params: Promise<{ role: string }>;
};

type RouterOutput = inferRouterOutputs<AppRouter>;
type ActivityData = RouterOutput['agent']['getActivity'];

export const metadata: Metadata = {
  title: `${agentCopy.activity.title} — Doculet.ai`,
};

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'agent') {
    notFound();
  }

  let data: ActivityData | null = null;

  try {
    const caller = await api();
    data = await caller.agent.getActivity();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      notFound();
    }
    throw error;
  }

  return <ActivityPageClient data={data} />;
}

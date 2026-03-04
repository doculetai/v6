import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { agentCopy } from '@/config/copy/agent';
import { api } from '@/trpc/server';

import { ActivityPageClient } from './activity-page-client';

export const metadata: Metadata = { title: `${agentCopy.activity.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function ActivityPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'agent') {
    return <p className="text-muted-foreground">{agentCopy.errors.unauthorized}</p>;
  }

  const caller = await api();

  let commissions: Awaited<ReturnType<typeof caller.agent.listAgentCommissions>> | null;

  try {
    commissions = await caller.agent.listAgentCommissions();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') redirect('/login');
    commissions = null;
  }

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{agentCopy.activity.title}</h1>
      <ActivityPageClient commissions={commissions} copy={agentCopy.activity} commissionStatusLabels={agentCopy.commissions.statusLabels} />
    </div>
  );
}

import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { agentCopy } from '@/config/copy/agent';
import { api } from '@/trpc/server';

import { CommissionsPageClient } from './commissions-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${agentCopy.commissions.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function CommissionsPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'agent') {
    notFound();
  }

  const caller = await api();

  const [commissionsResult] = await Promise.allSettled([caller.agent.listAgentCommissions()]);
  if (commissionsResult.status === 'rejected') {
    const err = commissionsResult.reason;
    if (err instanceof TRPCError && err.code === 'UNAUTHORIZED') redirect(routes.auth.login);
  }
  const commissions = commissionsResult.status === 'fulfilled' ? commissionsResult.value : null;

  return <CommissionsPageClient commissions={commissions} copy={agentCopy.commissions} />;
}

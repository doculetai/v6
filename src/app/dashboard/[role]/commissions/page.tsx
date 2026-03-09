import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { agentCopy } from '@/config/copy/agent';
import { isDashboardRole } from '@/config/roles';
import { routes } from '@/config/routes';
import { api } from '@/trpc/server';

import { CommissionsPageClient } from './commissions-page-client';

export const metadata: Metadata = { title: `${agentCopy.commissions.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function CommissionsPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'agent') notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role: 'agent' });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  let commissions: Awaited<ReturnType<typeof caller.agent.listAgentCommissions>> | null = null;
  try {
    commissions = await caller.agent.listAgentCommissions();
  } catch {
    commissions = null;
  }

  return (
    <CommissionsPageClient commissions={commissions} copy={agentCopy.commissions} />
  );
}

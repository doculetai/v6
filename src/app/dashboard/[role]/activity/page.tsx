import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { agentCopy } from '@/config/copy/agent';
import { isDashboardRole } from '@/config/roles';
import { routes } from '@/config/routes';
import { api } from '@/trpc/server';

import { ActivityPageClient } from './activity-page-client';

export const metadata: Metadata = { title: `${agentCopy.activity.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function ActivityPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'agent') notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role: 'agent' });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  let items: Awaited<ReturnType<typeof caller.agent.getActivity>> | null = null;
  try {
    items = await caller.agent.getActivity({ limit: 50 });
  } catch {
    items = null;
  }

  return (
    <ActivityPageClient items={items} copy={agentCopy.activity} />
  );
}

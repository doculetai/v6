import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { agentCopy } from '@/config/copy/agent';
import { api } from '@/trpc/server';

import { ActivityPageClient } from './activity-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${agentCopy.activity.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function ActivityPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'agent') {
    notFound();
  }

  const caller = await api();

  const [activityResult] = await Promise.allSettled([
    caller.agent.getActivity({ limit: 20 }),
  ]);
  if (activityResult.status === 'rejected') {
    const err = activityResult.reason;
    if (err instanceof TRPCError && err.code === 'UNAUTHORIZED') redirect(routes.auth.login);
  }
  const items = activityResult.status === 'fulfilled' ? activityResult.value : null;

  return (
    <ActivityPageClient
      items={items}
      copy={agentCopy.activity}
    />
  );
}

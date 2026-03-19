import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { adminCopy } from '@/config/copy/admin';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { AdminQueuePageClient } from './admin-queue-page-client';
import { routes } from '@/config/routes';

type PageProps = { params: Promise<{ role: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role } = await params;
  if (role !== 'admin') return { title: 'Not found — Doculet' };
  return { title: `${adminCopy.queue.title} — Doculet` };
}

export default async function QueuePage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'admin') notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  const [initialQueue, initialStats] = await Promise.all([
    caller.admin.getOperationsQueue({ status: 'all', limit: 50, offset: 0 }),
    caller.admin.getOperationsStats(),
  ]);

  return <AdminQueuePageClient initialQueue={initialQueue} initialStats={initialStats} />;
}

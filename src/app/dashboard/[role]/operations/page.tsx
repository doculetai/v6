import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageHeader, PageShell } from '@/components/layout/content-primitives';
import { adminCopy } from '@/config/copy/admin';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import OperationsPageClient from './operations-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = {
  title: adminCopy.operations.title,
};

type Props = {
  params: Promise<{ role: string }>;
};

export default async function OperationsPage({ params }: Props) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'admin') {
    notFound();
  }

  const caller = await api();

  const [queueResult, statsResult] = await Promise.allSettled([
    caller.admin.getOperationsQueue({ status: 'all' }),
    caller.admin.getOperationsStats(),
  ]);
  if (queueResult.status === 'rejected') {
    const err = queueResult.reason;
    if (err instanceof TRPCError && err.code === 'UNAUTHORIZED') redirect(routes.auth.login);
  }
  const queue = queueResult.status === 'fulfilled' ? queueResult.value : [];
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : {
    pending: 0,
    approved: 0,
    rejected: 0,
    moreInfoRequested: 0,
    expired: 0,
    approvedToday: 0,
    rejectedToday: 0,
  };

  return (
    <PageShell>
      <PageHeader
        title={adminCopy.operations.title}
        subtitle={adminCopy.operations.subtitle}
      />
      <OperationsPageClient initialQueue={queue} initialStats={stats} />
    </PageShell>
  );
}

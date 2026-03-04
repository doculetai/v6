import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { adminCopy } from '@/config/copy/admin';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import OperationsPageClient from './operations-page-client';

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

  const [queue, stats] = await Promise.all([
    caller.admin.getOperationsQueue({ status: 'all' }),
    caller.admin.getOperationsStats(),
  ]).catch((error: unknown) => {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    throw error;
  });

  return <OperationsPageClient initialQueue={queue} initialStats={stats} />;
}

import { TRPCError } from '@trpc/server';
import { notFound, redirect } from 'next/navigation';

import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { DisbursementsPageClient } from './disbursements-page-client';

type SponsorDisbursementsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function SponsorDisbursementsPage({
  params,
}: SponsorDisbursementsPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'sponsor') {
    notFound();
  }

  try {
    const caller = await api();
    await caller.dashboard.getSession({ role: 'sponsor' });
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      notFound();
    }

    throw error;
  }

  return <DisbursementsPageClient />;
}

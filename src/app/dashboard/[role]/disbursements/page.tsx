import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { sponsorCopy } from '@/config/copy/sponsor';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';
import { PageHeader } from '@/components/ui/page-header';

import { DisbursementsPageClient } from './disbursements-page-client';

export const metadata: Metadata = { title: 'Disbursements — Doculet' };

type DisbursementsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function DisbursementsPage({ params }: DisbursementsPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  if (role !== 'sponsor') {
    notFound();
  }

  const caller = await api();

  let disbursements: Awaited<ReturnType<typeof caller.sponsor.listDisbursements>>;
  try {
    disbursements = await caller.sponsor.listDisbursements();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    throw error;
  }

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{sponsorCopy.disbursements.title}</h1>
      <PageHeader
        title={sponsorCopy.disbursements.title}
        subtitle={sponsorCopy.disbursements.subtitle}
      />
      <DisbursementsPageClient disbursements={disbursements} copy={sponsorCopy.disbursements} />
    </div>
  );
}

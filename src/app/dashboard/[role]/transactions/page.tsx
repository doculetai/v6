import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { sponsorCopy } from '@/config/copy/sponsor';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';
import { PageHeader } from '@/components/ui/page-header';

import { TransactionsPageClient } from './transactions-page-client';

export const metadata: Metadata = { title: 'Transactions — Doculet' };

type TransactionsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function TransactionsPage({ params }: TransactionsPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  if (role !== 'sponsor') {
    notFound();
  }

  const caller = await api();

  let allDisbursements: Awaited<ReturnType<typeof caller.sponsor.listDisbursements>>;
  try {
    allDisbursements = await caller.sponsor.listDisbursements();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    throw error;
  }
  // Filter to completed transactions only
  const transactions = allDisbursements.filter((d) => d.status === 'disbursed');

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{sponsorCopy.transactions.title}</h1>
      <PageHeader
        title={sponsorCopy.transactions.title}
        subtitle={sponsorCopy.transactions.subtitle}
      />
      <TransactionsPageClient transactions={transactions} copy={sponsorCopy.transactions} />
    </div>
  );
}

import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { sponsorCopy } from '@/config/copy/sponsor';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { TransactionsPageClient } from './transactions-page-client';

type SponsorTransactionsPageProps = {
  params: Promise<{ role: string }>;
};

export const metadata: Metadata = {
  title: sponsorCopy.transactions.title,
};

export default async function SponsorTransactionsPage({ params }: SponsorTransactionsPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'sponsor') {
    notFound();
  }

  const caller = await api();
  const { initialTransactions, initialSummary } = await getSponsorTransactionsData(caller);

  return (
    <TransactionsPageClient
      initialTransactions={initialTransactions}
      initialSummary={initialSummary}
    />
  );
}

async function getSponsorTransactionsData(caller: Awaited<ReturnType<typeof api>>) {
  try {
    const [initialTransactions, initialSummary] = await Promise.all([
      caller.sponsor.getTransactions({ type: 'all' }),
      caller.sponsor.getTransactionSummary(),
    ]);

    return { initialTransactions, initialSummary };
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      notFound();
    }

    throw error;
  }
}

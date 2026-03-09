import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageHeader, PageShell } from '@/components/layout/content-primitives';
import { sponsorCopy } from '@/config/copy/sponsor';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { TransactionsPageClient } from './transactions-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${sponsorCopy.transactions.title} — Doculet` };

type TransactionsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function TransactionsPage({ params }: TransactionsPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'sponsor') {
    notFound();
  }

  const caller = await api();

  const [disbursementsResult] = await Promise.allSettled([caller.sponsor.listDisbursements()]);
  if (disbursementsResult.status === 'rejected') {
    const err = disbursementsResult.reason;
    if (err instanceof TRPCError && err.code === 'UNAUTHORIZED') redirect(routes.auth.login);
  }
  const allDisbursements = disbursementsResult.status === 'fulfilled' ? disbursementsResult.value : [];
  // Filter to completed transactions only
  const transactions = allDisbursements.filter((d) => d.status === 'disbursed');

  return (
    <PageShell>
      <PageHeader
        title={sponsorCopy.transactions.title}
        subtitle={sponsorCopy.transactions.subtitle}
      />
      <TransactionsPageClient transactions={transactions} copy={sponsorCopy.transactions} />
    </PageShell>
  );
}

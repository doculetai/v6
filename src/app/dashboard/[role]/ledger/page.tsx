import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { adminCopy } from '@/config/copy/admin';
import { partnerCopy } from '@/config/copy/partner';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { LedgerPageClient } from './ledger-page-client';
import { routes } from '@/config/routes';

type PageProps = { params: Promise<{ role: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role } = await params;
  if (role === 'partner') {
    return { title: `${partnerCopy.ledger.title} — Doculet` };
  }
  return { title: `${adminCopy.ledger.title} — Doculet` };
}

export default async function LedgerPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || (role !== 'admin' && role !== 'partner')) notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  if (role === 'partner') {
    const initialTransactions = await caller.partner.listTransactions({ limit: 50 });
    return (
      <LedgerPageClient
        initialTransactions={initialTransactions}
        copy={partnerCopy.ledger}
        routerPath="partner"
      />
    );
  }

  const initialTransactions = await caller.admin.listTransactions({ limit: 50 });
  return (
    <LedgerPageClient
      initialTransactions={initialTransactions}
      copy={adminCopy.ledger}
      routerPath="admin"
    />
  );
}

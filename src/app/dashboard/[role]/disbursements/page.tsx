import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { sponsorCopy } from '@/config/copy/sponsor';
import { api } from '@/trpc/server';
import { PageHeader, PageShell } from '@/components/layout/content-primitives';

import { DisbursementsPageClient } from './disbursements-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: 'Disbursements — Doculet' };

type DisbursementsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function DisbursementsPage({ params }: DisbursementsPageProps) {
  const { role } = await params;

  if (role !== 'sponsor') {
    notFound();
  }

  const caller = await api();

  const [disbursementsResult] = await Promise.allSettled([caller.sponsor.listDisbursements()]);
  if (disbursementsResult.status === 'rejected') {
    const err = disbursementsResult.reason;
    if (err instanceof TRPCError && err.code === 'UNAUTHORIZED') redirect(routes.auth.login);
  }
  const disbursements = disbursementsResult.status === 'fulfilled' ? disbursementsResult.value : [];

  return (
    <PageShell>
      <PageHeader
        title={sponsorCopy.disbursements.title}
        subtitle={sponsorCopy.disbursements.subtitle}
      />
      <DisbursementsPageClient disbursements={disbursements} copy={sponsorCopy.disbursements} />
    </PageShell>
  );
}

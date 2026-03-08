import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageHeader, PageShell } from '@/components/layout/content-primitives';
import { sponsorCopy } from '@/config/copy/sponsor';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { KycPageClient } from './kyc-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: 'Verification — Doculet' };

type KycPageProps = {
  params: Promise<{ role: string }>;
};

export default async function KycPage({ params }: KycPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'sponsor') {
    notFound();
  }

  const caller = await api();

  const [kycResult] = await Promise.allSettled([caller.sponsor.getSponsorKycStatus()]);
  if (kycResult.status === 'rejected') {
    const err = kycResult.reason;
    if (err instanceof TRPCError && err.code === 'UNAUTHORIZED') redirect(routes.auth.login);
  }
  const kycStatus = kycResult.status === 'fulfilled' ? kycResult.value : null;

  if (!kycStatus) {
    notFound();
  }

  return (
    <PageShell>
      <PageHeader title={sponsorCopy.kyc.title} subtitle={sponsorCopy.kyc.subtitle} />
      <KycPageClient kycStatus={kycStatus} copy={sponsorCopy.kyc} />
    </PageShell>
  );
}

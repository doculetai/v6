import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { sponsorCopy } from '@/config/copy/sponsor';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';
import { PageHeader } from '@/components/ui/page-header';

import { KycPageClient } from './kyc-page-client';

export const metadata: Metadata = { title: 'Verification — Doculet' };

type KycPageProps = {
  params: Promise<{ role: string }>;
};

export default async function KycPage({ params }: KycPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  if (role !== 'sponsor') {
    notFound();
  }

  const caller = await api();

  try {
    const kycStatus = await caller.sponsor.getSponsorKycStatus();

    return (
      <div className="space-y-6">
        <h1 className="sr-only">{sponsorCopy.kyc.title}</h1>
        <PageHeader title={sponsorCopy.kyc.title} subtitle={sponsorCopy.kyc.subtitle} />
        <KycPageClient kycStatus={kycStatus} copy={sponsorCopy.kyc} />
      </div>
    );
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    throw error;
  }
}

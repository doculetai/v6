import { TRPCError } from '@trpc/server';
import { notFound, redirect } from 'next/navigation';

import KycPageClient from './kyc-page-client';

import { api } from '@/trpc/server';

type SponsorKycPageProps = {
  params: Promise<{ role: string }>;
};

export default async function SponsorKycPage({ params }: SponsorKycPageProps) {
  const { role } = await params;

  if (role !== 'sponsor') {
    notFound();
  }

  let initialStatus: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['sponsor']['getKycStatus']>>;

  try {
    const caller = await api();
    initialStatus = await caller.sponsor.getKycStatus();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    throw error;
  }

  return <KycPageClient initialStatus={initialStatus} />;
}

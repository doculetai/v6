import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { partnerCopy } from '@/config/copy/partner';
import { isDashboardRole } from '@/config/roles';
import type { PartnerOverview } from '@/server/routers/partner';
import { api } from '@/trpc/server';

import { PartnerOverviewPageClient } from './overview-page-client';

export const metadata: Metadata = {
  title: partnerCopy.dashboard.title,
};

type OverviewPageProps = {
  params: Promise<{ role: string }>;
};

export default async function OverviewPage({ params }: OverviewPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'partner') {
    notFound();
  }

  let overview: PartnerOverview;

  try {
    const caller = await api();
    overview = await caller.partner.getOverview();
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.code === 'UNAUTHORIZED') redirect('/login');
      if (error.code === 'NOT_FOUND') notFound();
    }
    throw error;
  }

  return <PartnerOverviewPageClient overview={overview} />;
}

import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { OverviewPageClient } from './overview-page-client';

export const metadata: Metadata = {
  title: 'Overview — Doculet University',
  description: 'Summary of pending verifications, approvals, and student activity.',
};

type PageProps = {
  params: Promise<{ role: string }>;
};

async function fetchOverviewData() {
  try {
    const caller = await api();
    return await caller.university.getOverview();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    throw error;
  }
}

export default async function UniversityOverviewPage({ params }: PageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  const data = await fetchOverviewData();
  return <OverviewPageClient data={data} />;
}

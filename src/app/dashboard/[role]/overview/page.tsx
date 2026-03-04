import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

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
    if (
      error instanceof TRPCError &&
      (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN')
    ) {
      redirect('/login');
    }
    throw error;
  }
}

export default async function UniversityOverviewPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'university') {
    notFound();
  }

  const data = await fetchOverviewData();
  return <OverviewPageClient data={data} />;
}

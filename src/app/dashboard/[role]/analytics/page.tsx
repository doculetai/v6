import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import type { PartnerAnalyticsOutput } from '@/server/routers/partner';
import { api } from '@/trpc/server';

import { AnalyticsPageClient } from './analytics-page-client';

export const metadata: Metadata = {
  title: 'Analytics | Partner Dashboard | Doculet',
};

async function fetchAnalytics(): Promise<PartnerAnalyticsOutput> {
  try {
    const caller = await api();
    return await caller.partner.getAnalytics();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      redirect('/dashboard');
    }
    // All other errors bubble up to the error.tsx boundary.
    throw error;
  }
}

export default async function PartnerAnalyticsPage() {
  const data = await fetchAnalytics();
  return <AnalyticsPageClient data={data} />;
}

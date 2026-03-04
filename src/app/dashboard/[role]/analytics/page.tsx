import { TRPCError } from '@trpc/server';
import { redirect } from 'next/navigation';

import { adminCopy } from '@/config/copy/admin';
import { isDashboardRole } from '@/config/roles';
import type { AdminAnalyticsData } from '@/db/queries/admin-analytics';
import { api } from '@/trpc/server';

import { AnalyticsPageClient } from './analytics-page-client';

export const metadata = {
  title: 'Analytics — Admin | Doculet',
  description: 'Platform performance and business intelligence for Doculet administrators.',
};

type AnalyticsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    redirect('/login');
  }

  if (role !== 'admin') {
    redirect(`/dashboard/${role}`);
  }

  let data: AdminAnalyticsData | null = null;
  let fetchError = false;

  try {
    const caller = await api();
    data = await caller.admin.getAnalytics();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      redirect(`/dashboard/${role}`);
    }
    fetchError = true;
  }

  if (fetchError || !data) {
    const copy = adminCopy.analytics.error;
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-xl border border-destructive/30 bg-card p-8 text-center">
          <p className="text-base font-semibold text-destructive">{copy.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
        </div>
      </div>
    );
  }

  return <AnalyticsPageClient data={data} />;
}

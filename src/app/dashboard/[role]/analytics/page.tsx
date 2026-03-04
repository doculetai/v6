import type { Metadata } from 'next';

import { adminCopy } from '@/config/copy/admin';
import { api } from '@/trpc/server';

import { AnalyticsPageClient } from './analytics-page-client';

export const metadata: Metadata = {
  title: adminCopy.analytics.title,
};

type PageProps = {
  params: Promise<{ role: string }>;
};

export default async function AnalyticsPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'admin') {
    return <p className="text-muted-foreground">{adminCopy.errors.unauthorized}</p>;
  }

  let data: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['admin']['getPlatformAnalytics']>> | null = null;

  try {
    const caller = await api();
    data = await caller.admin.getPlatformAnalytics();
  } catch {
    data = null;
  }

  return (
    <AnalyticsPageClient
      data={data}
      copy={adminCopy.analytics}
    />
  );
}

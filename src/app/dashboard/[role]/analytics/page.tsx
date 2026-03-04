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
    return (
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{adminCopy.analytics.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{adminCopy.errors.unauthorized}</p>
      </div>
    );
  }

  let data: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['admin']['getPlatformAnalytics']>> | null = null;

  try {
    const caller = await api();
    data = await caller.admin.getPlatformAnalytics();
  } catch {
    data = null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{adminCopy.analytics.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{adminCopy.analytics.subtitle}</p>
      </div>
      <AnalyticsPageClient
        data={data}
        copy={adminCopy.analytics}
      />
    </div>
  );
}

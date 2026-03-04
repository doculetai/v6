import type { Metadata } from 'next';

import { adminCopy } from '@/config/copy/admin';
import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';

import { AnalyticsPageClient } from './analytics-page-client';
import { PartnerAnalyticsPageClient } from './partner-analytics-page-client';

export const metadata: Metadata = {
  title: adminCopy.analytics.title,
};

type PageProps = {
  params: Promise<{ role: string }>;
};

export default async function AnalyticsPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'admin' && role !== 'partner') {
    return (
      <p className="text-muted-foreground">{adminCopy.errors.unauthorized}</p>
    );
  }

  if (role === 'partner') {
    let overview: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['partner']['getPartnerOverview']>> | null = null;
    try {
      const caller = await api();
      overview = await caller.partner.getPartnerOverview();
    } catch {
      overview = null;
    }
    return <PartnerAnalyticsPageClient data={overview} copy={partnerCopy.analytics} />;
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

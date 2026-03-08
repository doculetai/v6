import type { Metadata } from 'next';

import { adminCopy } from '@/config/copy/admin';
import { agentCopy } from '@/config/copy/agent';
import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';
import { notFound } from 'next/navigation';
import { PageHeader, PageShell } from '@/components/layout/content-primitives';

import { AgentAnalyticsPageClient } from './agent-analytics-page-client';
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

  if (role !== 'admin' && role !== 'partner' && role !== 'agent') {
    notFound();
  }

  if (role === 'agent') {
    let agentData: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['agent']['getAgentOverview']>> | null = null;
    try {
      const caller = await api();
      agentData = await caller.agent.getAgentOverview();
    } catch {
      agentData = null;
    }
    return <AgentAnalyticsPageClient data={agentData} copy={agentCopy.analytics} />;
  }

  if (role === 'partner') {
    let overview: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['partner']['getPartnerOverview']>> | null = null;
    let usage: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['partner']['getApiUsage']>> | null = null;
    try {
      const caller = await api();
      [overview, usage] = await Promise.all([
        caller.partner.getPartnerOverview(),
        caller.partner.getApiUsage(),
      ]);
    } catch {
      overview = null;
      usage = null;
    }
    return <PartnerAnalyticsPageClient data={overview} initialUsage={usage} copy={partnerCopy.analytics} />;
  }

  let data: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['admin']['getPlatformAnalytics']>> | null = null;

  try {
    const caller = await api();
    data = await caller.admin.getPlatformAnalytics();
  } catch {
    data = null;
  }

  return (
    <PageShell>
      <PageHeader title={adminCopy.analytics.title} subtitle={adminCopy.analytics.subtitle} />
      <AnalyticsPageClient data={data} copy={adminCopy.analytics} />
    </PageShell>
  );
}

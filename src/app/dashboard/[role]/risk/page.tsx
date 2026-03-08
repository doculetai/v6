import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { adminCopy } from '@/config/copy/admin';
import { api } from '@/trpc/server';
import { PageHeader, PageShell } from '@/components/layout/content-primitives';

import { RiskPageClient } from './risk-page-client';

export const metadata: Metadata = {
  title: adminCopy.risk.title,
};

type PageProps = {
  params: Promise<{ role: string }>;
};

export default async function RiskPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'admin') {
    notFound();
  }

  let flags: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['admin']['getRiskFlags']>> | null = null;

  try {
    const caller = await api();
    flags = await caller.admin.getRiskFlags();
  } catch {
    flags = null;
  }

  return (
    <PageShell>
      <PageHeader title={adminCopy.risk.title} subtitle={adminCopy.risk.subtitle} />
      <RiskPageClient flags={flags} copy={adminCopy.risk} />
    </PageShell>
  );
}

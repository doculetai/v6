import type { Metadata } from 'next';

import { adminCopy } from '@/config/copy/admin';
import { api } from '@/trpc/server';

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
    return (
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{adminCopy.risk.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{adminCopy.errors.unauthorized}</p>
      </div>
    );
  }

  let flags: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['admin']['getRiskFlags']>> | null = null;

  try {
    const caller = await api();
    flags = await caller.admin.getRiskFlags();
  } catch {
    flags = null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{adminCopy.risk.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{adminCopy.risk.subtitle}</p>
      </div>
      <RiskPageClient
        flags={flags}
        copy={adminCopy.risk}
      />
    </div>
  );
}

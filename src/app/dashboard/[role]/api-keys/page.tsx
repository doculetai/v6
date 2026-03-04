import type { Metadata } from 'next';

import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';

import { ApiKeysPageClient } from './api-keys-page-client';

export const metadata: Metadata = { title: partnerCopy.apiKeys.title };

type PageProps = { params: Promise<{ role: string }> };

export default async function ApiKeysPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'partner') {
    return <p className="text-muted-foreground">{partnerCopy.errors.unauthorized}</p>;
  }

  let keys: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['partner']['listApiKeys']>> = [];
  try {
    const caller = await api();
    keys = await caller.partner.listApiKeys();
  } catch {
    keys = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{partnerCopy.apiKeys.title}</h1>
      <ApiKeysPageClient initialKeys={keys} copy={partnerCopy.apiKeys} />
    </div>
  );
}

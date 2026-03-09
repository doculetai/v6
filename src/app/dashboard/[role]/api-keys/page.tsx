import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';

import { ApiKeysPageClient } from './api-keys-page-client';

export const metadata: Metadata = {
  title: `${partnerCopy.apiKeys.title} — Doculet`,
  description: partnerCopy.apiKeys.subtitle,
};

type PageProps = { params: Promise<{ role: string }> };

export default async function ApiKeysPage({ params }: PageProps) {
  const { role } = await params;
  if (role !== 'partner') notFound();

  let initialKeys: Awaited<
    ReturnType<Awaited<ReturnType<typeof api>>['partner']['listApiKeys']>
  > = [];

  try {
    const caller = await api();
    initialKeys = await caller.partner.listApiKeys();
  } catch {
    initialKeys = [];
  }

  return <ApiKeysPageClient initialKeys={initialKeys} copy={partnerCopy.apiKeys} />;
}

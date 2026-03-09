import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';
import { isDashboardRole } from '@/config/roles';

import { WebhooksPageClient } from './webhooks-page-client';

export const metadata: Metadata = { title: `${partnerCopy.webhooks.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function WebhooksPage({ params }: PageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'partner') {
    notFound();
  }

  let webhooks: Awaited<
    ReturnType<Awaited<ReturnType<typeof api>>['partnerWebhooks']['listWebhooks']>
  > = [];
  try {
    const caller = await api();
    webhooks = await caller.partnerWebhooks.listWebhooks();
  } catch {
    webhooks = [];
  }

  return <WebhooksPageClient initialData={webhooks} />;
}

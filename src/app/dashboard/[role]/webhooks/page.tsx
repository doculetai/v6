import type { Metadata } from 'next';

import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';

import { WebhooksPageClient } from './webhooks-page-client';

export const metadata: Metadata = { title: partnerCopy.webhooks.title };

type PageProps = { params: Promise<{ role: string }> };

export default async function WebhooksPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'partner') {
    return <p className="text-muted-foreground">{partnerCopy.errors.unauthorized}</p>;
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

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{partnerCopy.webhooks.title}</h1>
      <WebhooksPageClient initialData={webhooks} />
    </div>
  );
}

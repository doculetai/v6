import { Suspense } from 'react';

import { PageShell, PageHeader, Section } from '@/components/layout/content-primitives';
import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';

import { WebhooksPageClient } from './webhooks-page-client';

const copy = partnerCopy.webhooks;

export const metadata = { title: 'Webhooks — Doculet' };

export default async function WebhooksPage() {
  const caller = await api();
  const webhooks = await caller.partnerWebhooks.listWebhooks();
  return (
    <PageShell>
      <PageHeader title={copy.pageTitle} description={copy.pageDescription} />
      <Section>
        <Suspense fallback={null}>
          <WebhooksPageClient initialWebhooks={webhooks} />
        </Suspense>
      </Section>
    </PageShell>
  );
}

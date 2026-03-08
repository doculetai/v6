import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';

import { ApiKeysPageClient } from './api-keys-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: partnerCopy.apiKeys.title };

type PageProps = { params: Promise<{ role: string }> };

export default async function ApiKeysPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'partner') {
    notFound();
  }

  const caller = await api();

  const [keysResult] = await Promise.allSettled([caller.partner.listApiKeys()]);
  if (keysResult.status === 'rejected') {
    const err = keysResult.reason;
    if (err instanceof TRPCError && err.code === 'UNAUTHORIZED') redirect(routes.auth.login);
  }
  const keys = keysResult.status === 'fulfilled' ? keysResult.value : [];

  return <ApiKeysPageClient initialKeys={keys} copy={partnerCopy.apiKeys} />;
}

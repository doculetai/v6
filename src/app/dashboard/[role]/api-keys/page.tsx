import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';

import { ApiKeysPageClient } from './api-keys-page-client';

export const metadata: Metadata = {
  title: partnerCopy.apiKeys.title,
};

function handleErrors(error: unknown): never {
  if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
    redirect('/login');
  }
  if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
    redirect('/dashboard');
  }
  throw error;
}

export default async function ApiKeysPage() {
  const caller = await api().catch(handleErrors);
  const apiKeys = await caller.partner.listApiKeys().catch(handleErrors);
  return <ApiKeysPageClient initialKeys={apiKeys} />;
}

import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { adminCopy } from '@/config/copy/admin';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { PlatformFeesPageClient } from './platform-fees-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = {
  title: `${adminCopy.platformFees.title} — Doculet`,
};

type PageProps = { params: Promise<{ role: string }> };

export default async function PlatformFeesPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'admin') notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role: 'admin' });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  let configs: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['admin']['listPlatformFeeConfig']>> = [];
  try {
    configs = await caller.admin.listPlatformFeeConfig();
  } catch {
    configs = [];
  }

  return (
    <PlatformFeesPageClient initialConfigs={configs} copy={adminCopy.platformFees} />
  );
}

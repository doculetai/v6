import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { partnerCopy } from '@/config/copy/partner';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { CompliancePageClient } from './compliance-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${partnerCopy.compliance.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function CompliancePage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'partner') notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role: 'partner' });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  const [overview, settings] = await Promise.all([
    caller.partner.getPartnerOverview(),
    caller.partner.getPartnerSettings(),
  ]);

  return (
    <CompliancePageClient
      overview={overview}
      settings={settings}
      copy={partnerCopy.compliance}
    />
  );
}

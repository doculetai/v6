import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { ImpactPageClient } from './impact-page-client';
import { sponsorCopy } from '@/config/copy/sponsor';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${sponsorCopy.impact.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function ImpactPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'sponsor') notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role: 'sponsor' });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  return <ImpactPageClient copy={sponsorCopy.impact} />;
}

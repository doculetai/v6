import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { universityCopy } from '@/config/copy/university';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { ReportsPageClient } from './reports-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${universityCopy.reports.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function ReportsPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'university') notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role: 'university' });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  return <ReportsPageClient copy={universityCopy.reports} />;
}

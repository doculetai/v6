import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { isDashboardRole } from '@/config/roles';
import { routes } from '@/config/routes';
import { api } from '@/trpc/server';

import { AdminOverview } from '../_components/admin-overview';
import { AgentOverview } from '../_components/agent-overview';
import { PartnerOverview } from '../_components/partner-overview';
import { SponsorOverview } from '../_components/sponsor-overview';
import { StudentOverview } from '../_components/student-overview';
import { UniversityOverview } from '../_components/university-overview';

export const metadata: Metadata = {
  title: 'Overview — Doculet',
  description: 'Dashboard overview.',
};

type PageProps = {
  params: Promise<{ role: string }>;
};

export default async function OverviewPage({ params }: PageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  let caller: Awaited<ReturnType<typeof api>>;
  try {
    caller = await api();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect(routes.auth.login);
    }
    throw error;
  }

  const sessionResult = await caller.dashboard.getSession({ role }).catch(() => null);
  const email = sessionResult?.email ?? '';

  switch (role) {
    case 'student':
      return <StudentOverview email={email} caller={caller} />;
    case 'sponsor':
      return <SponsorOverview email={email} caller={caller} />;
    case 'university':
      return <UniversityOverview caller={caller} />;
    case 'admin':
      return <AdminOverview caller={caller} />;
    case 'agent':
      return <AgentOverview email={email} caller={caller} />;
    case 'partner':
      return <PartnerOverview email={email} caller={caller} />;
  }
}

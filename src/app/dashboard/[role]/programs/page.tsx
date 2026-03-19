import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { partnerCopy } from '@/config/copy/partner';
import { universityCopy } from '@/config/copy/university';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { PartnerProgramsPageClient } from './partner-programs-page-client';
import { ProgramsPageClient } from './programs-page-client';
import { routes } from '@/config/routes';

type PageProps = { params: Promise<{ role: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role } = await params;
  const copy = role === 'partner' ? partnerCopy.programs : universityCopy.programs;
  return { title: `${copy.title} — Doculet` };
}

export default async function ProgramsPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || (role !== 'partner' && role !== 'university')) notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  if (role === 'partner') {
    const programs = await caller.partner.listAllPrograms();
    return (
      <PartnerProgramsPageClient
        programs={programs}
        copy={partnerCopy.programs}
      />
    );
  }

  // University role
  return <ProgramsPageClient copy={universityCopy.programs} />;
}

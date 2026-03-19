import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/content-primitives';
import { PageShell, Section } from '@/components/layout/content-primitives';
import { agentCopy } from '@/config/copy/agent';
import { primitivesCopy } from '@/config/copy/primitives';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { InvitesPageClient } from './invites-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${agentCopy.invites.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function InvitesPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'agent') notFound();

  const caller = await api();

  let students: Awaited<ReturnType<typeof caller.agent.listAgentStudents>>;
  try {
    await caller.dashboard.getSession({ role: 'agent' });
    students = await caller.agent.listAgentStudents();
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    students = [];
  }

  const copy = agentCopy.invites;
  return (
    <PageShell width="wide">
      <Section>
        <PageHeader
          title={copy.title}
          subtitle={copy.subtitle}
          breadcrumbs={[
            { label: primitivesCopy.nav.overview, href: `/dashboard/${role}` },
            { label: copy.title },
          ]}
        />
        <InvitesPageClient students={students} copy={copy} />
      </Section>
    </PageShell>
  );
}

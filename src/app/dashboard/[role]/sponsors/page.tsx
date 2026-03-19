import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/content-primitives';
import { PageShell, Section } from '@/components/layout/content-primitives';
import { agentCopy } from '@/config/copy/agent';
import { primitivesCopy } from '@/config/copy/primitives';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { SponsorsPageClient } from './sponsors-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${agentCopy.sponsors.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function SponsorsPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'agent') notFound();

  const caller = await api();

  let sponsors: Awaited<ReturnType<typeof caller.agent.listAgentSponsors>>;
  try {
    await caller.dashboard.getSession({ role: 'agent' });
    sponsors = await caller.agent.listAgentSponsors();
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    sponsors = [];
  }

  const copy = agentCopy.sponsors;
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
        <SponsorsPageClient sponsors={sponsors} copy={copy} />
      </Section>
    </PageShell>
  );
}

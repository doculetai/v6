import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageShell, Section } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/content-primitives';
import { adminCopy } from '@/config/copy/admin';
import { primitivesCopy } from '@/config/copy/primitives';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { FraudPageClient } from './fraud-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${adminCopy.fraud.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function FraudPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'admin') notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role: 'admin' });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  let flags: Awaited<ReturnType<typeof caller.admin.getRiskFlags>> | null = null;

  try {
    flags = await caller.admin.getRiskFlags();
  } catch {
    flags = null;
  }

  const copy = adminCopy.fraud;

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
        <FraudPageClient flags={flags} />
      </Section>
    </PageShell>
  );
}

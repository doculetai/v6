import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageShell, Section } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/content-primitives';
import { adminCopy } from '@/config/copy/admin';
import { primitivesCopy } from '@/config/copy/primitives';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { SystemPageClient } from './system-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${adminCopy.system.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function SystemPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'admin') notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role: 'admin' });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  const copy = adminCopy.system;

  return (
    <PageShell>
      <Section>
        <PageHeader
          title={copy.title}
          subtitle={copy.subtitle}
          breadcrumbs={[
            { label: primitivesCopy.nav.overview, href: `/dashboard/${role}` },
            { label: copy.title },
          ]}
        />
        <SystemPageClient />
      </Section>
    </PageShell>
  );
}

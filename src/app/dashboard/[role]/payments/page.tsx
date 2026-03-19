import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageShell, Section } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/content-primitives';
import { adminCopy } from '@/config/copy/admin';
import { primitivesCopy } from '@/config/copy/primitives';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { PaymentsPageClient } from './payments-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${adminCopy.payments.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function PaymentsPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'admin') notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role: 'admin' });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  let initialTransactions: Awaited<ReturnType<typeof caller.admin.listTransactions>> = [];

  try {
    initialTransactions = await caller.admin.listTransactions({ limit: 50 });
  } catch {
    initialTransactions = [];
  }

  const copy = adminCopy.payments;

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
        <PaymentsPageClient initialTransactions={initialTransactions} />
      </Section>
    </PageShell>
  );
}

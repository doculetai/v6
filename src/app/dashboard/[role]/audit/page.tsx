import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageShell, Section } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/content-primitives';
import { adminCopy } from '@/config/copy/admin';
import { primitivesCopy } from '@/config/copy/primitives';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { AuditPageClient } from './audit-page-client';

export const metadata: Metadata = { title: `${adminCopy.audit.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function AuditPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'admin') notFound();

  let initialData: { rows: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    meta: unknown;
    ip: string | null;
    actorEmail: string | null;
    createdAt: Date;
  }>; total: number } | null = null;

  try {
    const caller = await api();
    initialData = await caller.adminAudit.listAuditLog({ limit: 50, offset: 0 });
  } catch {
    initialData = null;
  }

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader
          title={adminCopy.audit.title}
          subtitle={adminCopy.audit.subtitle}
          breadcrumbs={[
            { label: primitivesCopy.nav.overview, href: `/dashboard/${role}` },
            { label: adminCopy.audit.title },
          ]}
        />
        <AuditPageClient initialData={initialData} />
      </Section>
    </PageShell>
  );
}

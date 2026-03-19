import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageShell, Section } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/content-primitives';
import { adminCopy } from '@/config/copy/admin';
import { primitivesCopy } from '@/config/copy/primitives';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { StatementReviewPageClient } from './statement-review-page-client';

export const metadata: Metadata = { title: `${adminCopy.statementReview.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function StatementReviewPage({ params }: PageProps) {
  const { role } = await params;
  if (!isDashboardRole(role) || role !== 'admin') notFound();

  type StatementRow = {
    id: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected' | 'more_info_requested' | 'expired';
    createdAt: Date;
    studentEmail: string;
    reviewerEmail: string | null;
  };

  let initialRows: StatementRow[] | null = null;

  try {
    const caller = await api();
    const queue = await caller.admin.getOperationsQueue({ status: 'all', limit: 100, offset: 0 });
    initialRows = queue
      .filter((row) => row.type === 'bank_statement')
      .map((row) => ({
        id: row.id,
        type: row.type,
        status: row.status,
        createdAt: row.createdAt,
        studentEmail: row.studentEmail,
        reviewerEmail: row.reviewerEmail,
      }));
  } catch {
    initialRows = null;
  }

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader
          title={adminCopy.statementReview.title}
          subtitle={adminCopy.statementReview.subtitle}
          breadcrumbs={[
            { label: primitivesCopy.nav.overview, href: `/dashboard/${role}` },
            { label: adminCopy.statementReview.title },
          ]}
        />
        <StatementReviewPageClient initialRows={initialRows} />
      </Section>
    </PageShell>
  );
}

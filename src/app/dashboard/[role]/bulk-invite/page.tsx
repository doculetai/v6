import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { PageShell } from '@/components/layout/content-primitives';
import { ActionButton } from '@/components/ui/action-button';
import { DataTable } from '@/components/ui/data-table';
import { SectionCard } from '@/components/ui/section-card';
import { StatCard } from '@/components/ui/stat-card';
import { StatGrid } from '@/components/ui/stat-grid';
import { agentCopy } from '@/config/copy/agent';

export const metadata: Metadata = { title: `${agentCopy.bulkInvite.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function BulkInvitePage({ params }: PageProps) {
  const { role } = await params;
  if (role !== 'agent') notFound();

  return (
    <PageShell>
      <PageHeader
        overline={agentCopy.referral.overline}
        title={agentCopy.referral.pageTitle}
        actions={<ActionButton>{agentCopy.referral.inviteCta}</ActionButton>}
      />

      <StatGrid columns={4}>
        <StatCard label={agentCopy.referral.stats.totalReferrals} value="18" sub={agentCopy.referral.stats.subs.allTime} />
        <StatCard label={agentCopy.referral.stats.active} value="12" sub={agentCopy.referral.stats.subs.currentlyEnrolled} />
        <StatCard label={agentCopy.referral.stats.converted} value="6" sub={agentCopy.referral.stats.subs.certificatesIssued} />
        <StatCard label={agentCopy.referral.stats.conversionRate} value="33%" sub={agentCopy.referral.stats.subs.referredToConverted} />
      </StatGrid>

      <SectionCard title={agentCopy.referral.referredStudentsTitle}>
        <DataTable
          columns={[agentCopy.referral.table.student, agentCopy.referral.table.programme, agentCopy.referral.table.stageShort, agentCopy.referral.table.status, agentCopy.referral.table.referredOn]}
          rows={[
            { cells: ['Chidinma Okafor', 'MSc Finance, University of Lagos', 'Verification', 'Active', '12 Feb 2026'], badgeType: 'green' },
            { cells: ['Emeka Nwosu', 'BSc Computer Science, Covenant Uni', 'Documents', 'Active', '28 Jan 2026'], badgeType: 'green' },
            { cells: ['Amina Bello', 'MBA, Lagos Business School', 'Proof of Funds', 'Active', '15 Jan 2026'], badgeType: 'green' },
            { cells: ['Tunde Adeyemi', 'MSc Data Science, Babcock Uni', 'Certificate issued', 'Converted', '03 Jan 2026'], badgeType: 'blue' },
            { cells: ['Ngozi Eze', 'BEng Mechanical, University of Ibadan', 'Onboarding', 'Pending', '22 Dec 2025'], badgeType: 'amber' },
          ]}
          mutedCols={[4]}
        />
      </SectionCard>
    </PageShell>
  );
}

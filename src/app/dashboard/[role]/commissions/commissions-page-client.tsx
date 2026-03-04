'use client';

import type { z } from 'zod';

import { CommissionStatusBadge } from '@/components/agent/CommissionStatusBadge';
import { TierBadge } from '@/components/agent/TierBadge';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { MetricCard } from '@/components/ui/metric-card';
import { MoneyValue } from '@/components/ui/money-value';
import { PageHeader } from '@/components/ui/page-header';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import { agentCopy } from '@/config/copy/agent';
import type { CommissionRecordSchema, CommissionStatsSchema } from '@/server/routers/agent';

type CommissionRecord = z.infer<typeof CommissionRecordSchema>;
type CommissionStats = z.infer<typeof CommissionStatsSchema>;

interface CommissionsPageClientProps {
  commissions: CommissionRecord[];
  stats: CommissionStats;
}

const TABLE_COLUMNS = [
  {
    key: 'studentName' as const,
    header: agentCopy.commissions.table.student,
  },
  {
    key: 'universityName' as const,
    header: agentCopy.commissions.table.university,
  },
  {
    key: 'tier' as const,
    header: agentCopy.commissions.table.tier,
    cell: (row: CommissionRecord) => <TierBadge tier={row.tier as 1 | 2 | 3} />,
  },
  {
    key: 'amountKobo' as const,
    header: agentCopy.commissions.table.amount,
    cell: (row: CommissionRecord) => <MoneyValue amountMinor={row.amountKobo} />,
  },
  {
    key: 'createdAt' as const,
    header: agentCopy.commissions.table.date,
    cell: (row: CommissionRecord) => (
      <TimestampLabel value={row.createdAt} mode="relative" />
    ),
  },
  {
    key: 'status' as const,
    header: agentCopy.commissions.table.status,
    cell: (row: CommissionRecord) => <CommissionStatusBadge status={row.status} />,
  },
] as const;

export function CommissionsPageClient({ commissions, stats }: CommissionsPageClientProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={agentCopy.commissions.title}
        subtitle={agentCopy.commissions.subtitle}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label={agentCopy.commissions.stats.pendingPayout}
          value={<MoneyValue amountMinor={stats.pendingPayout} />}
        />
        <MetricCard
          label={agentCopy.commissions.stats.paidThisMonth}
          value={<MoneyValue amountMinor={stats.paidThisMonth} />}
        />
        <MetricCard
          label={agentCopy.commissions.stats.totalLifetime}
          value={<MoneyValue amountMinor={stats.totalLifetime} />}
        />
      </div>

      <DataTableShell
        columns={TABLE_COLUMNS}
        rows={commissions}
        emptyLabel={agentCopy.commissions.empty.title}
      />
    </div>
  );
}

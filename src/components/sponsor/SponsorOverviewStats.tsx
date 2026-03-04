import { ShieldCheck } from 'lucide-react';

import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

import { MetricCard } from '../ui/metric-card';
import { MoneyValue } from '../ui/money-value';
import { StatusBadge } from '../ui/status-badge';

type SponsorOverviewStatsData = {
  totalFundedKobo: number;
  activeStudents: number;
  pendingDisbursements: number;
  kycTier: 1 | 2 | 3;
};

type SponsorOverviewStatsProps = {
  stats: SponsorOverviewStatsData;
  loading?: boolean;
  className?: string;
};

function getTierBadge(tier: 1 | 2 | 3) {
  if (tier === 3) {
    return (
      <span className="inline-flex items-center gap-2">
        <StatusBadge status="verified" label={sponsorCopy.overview.stats.tiers.tier3} />
        <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      </span>
    );
  }

  if (tier === 2) {
    return (
      <StatusBadge
        status="verified"
        label={sponsorCopy.overview.stats.tiers.tier2}
        className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
      />
    );
  }

  return <StatusBadge status="pending" label={sponsorCopy.overview.stats.tiers.tier1} />;
}

function SponsorOverviewStats({ stats, loading = false, className }: SponsorOverviewStatsProps) {
  const metricCopy = sponsorCopy.overview.stats;

  const cards = [
    <MetricCard
      key={metricCopy.totalFunded}
      label={metricCopy.totalFunded}
      value={
        <span className="inline-flex items-baseline gap-1">
          <span className="text-base text-muted-foreground">₦</span>
          <MoneyValue amountMinor={stats.totalFundedKobo} showCode={false} />
        </span>
      }
      loading={loading}
    />,
    <MetricCard
      key={metricCopy.activeStudents}
      label={metricCopy.activeStudents}
      value={new Intl.NumberFormat('en-NG').format(stats.activeStudents)}
      loading={loading}
    />,
    <MetricCard
      key={metricCopy.pendingDisbursements}
      label={metricCopy.pendingDisbursements}
      value={new Intl.NumberFormat('en-NG').format(stats.pendingDisbursements)}
      loading={loading}
    />,
    <MetricCard
      key={metricCopy.kycTier}
      label={metricCopy.kycTier}
      value={getTierBadge(stats.kycTier)}
      loading={loading}
    />,
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', className)}>
      {cards.map((card) => card)}
    </div>
  );
}

export { SponsorOverviewStats };
export type { SponsorOverviewStatsData, SponsorOverviewStatsProps };

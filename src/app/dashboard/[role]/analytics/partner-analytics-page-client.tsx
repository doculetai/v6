'use client';

import { partnerCopy } from '@/config/copy/partner';

type PartnerOverviewData = {
  totalStudents: number;
  verifiedStudents: number;
  activeApiKeys: number;
  organizationName: string;
};

type Props = {
  data: PartnerOverviewData | null;
  copy: typeof partnerCopy.analytics;
};

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export function PartnerAnalyticsPageClient({ data, copy }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data?.organizationName
            ? `${data.organizationName} — ${copy.subtitle}`
            : copy.subtitle}
        </p>
      </div>

      {data === null ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.error.description}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label={copy.stats.totalStudents.label}
            value={data.totalStudents.toLocaleString()}
            sub={copy.stats.totalStudents.sub}
          />
          <StatCard
            label={copy.stats.verifiedStudents.label}
            value={data.verifiedStudents.toLocaleString()}
            sub={copy.stats.verifiedStudents.sub}
          />
          <StatCard
            label={copy.stats.activeApiKeys.label}
            value={data.activeApiKeys.toLocaleString()}
            sub={copy.stats.activeApiKeys.sub}
          />
        </div>
      )}
    </div>
  );
}

'use client';

import { adminCopy } from '@/config/copy/admin';
import { formatNGN } from '@/lib/utils';

type AnalyticsData = {
  totalUsers: number;
  totalStudents: number;
  totalSponsors: number;
  totalSponsorships: number;
  totalCommittedKobo: number;
  totalDisbursedKobo: number;
  pendingDocuments: number;
  approvedDocuments: number;
  issuedCertificates: number;
  kycVerifiedStudents: number;
};

type Props = {
  data: AnalyticsData | null;
  copy: typeof adminCopy.analytics;
};

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export function AnalyticsPageClient({ data, copy }: Props) {
  if (data === null) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{copy.error.description}</p>
      </div>
    );
  }

  const stats: StatCardProps[] = [
    {
      label: copy.stats.totalUsers.label,
      value: data.totalUsers.toLocaleString(),
      sub: copy.stats.totalUsers.sub,
    },
    {
      label: copy.stats.totalStudents.label,
      value: data.totalStudents.toLocaleString(),
      sub: copy.stats.totalStudents.sub,
    },
    {
      label: copy.stats.totalSponsors.label,
      value: data.totalSponsors.toLocaleString(),
      sub: copy.stats.totalSponsors.sub,
    },
    {
      label: copy.stats.totalSponsorships.label,
      value: data.totalSponsorships.toLocaleString(),
      sub: copy.stats.totalSponsorships.sub,
    },
    {
      label: copy.stats.totalCommitted.label,
      value: formatNGN(data.totalCommittedKobo),
      sub: copy.stats.totalCommitted.sub,
    },
    {
      label: copy.stats.totalDisbursed.label,
      value: formatNGN(data.totalDisbursedKobo),
      sub: copy.stats.totalDisbursed.sub,
    },
    {
      label: copy.stats.pendingDocuments.label,
      value: data.pendingDocuments.toLocaleString(),
      sub: copy.stats.pendingDocuments.sub,
    },
    {
      label: copy.stats.approvedDocuments.label,
      value: data.approvedDocuments.toLocaleString(),
      sub: copy.stats.approvedDocuments.sub,
    },
    {
      label: copy.stats.issuedCertificates.label,
      value: data.issuedCertificates.toLocaleString(),
      sub: copy.stats.issuedCertificates.sub,
    },
    {
      label: copy.stats.kycVerified.label,
      value: data.kycVerifiedStudents.toLocaleString(),
      sub: copy.stats.kycVerified.sub,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} sub={stat.sub} />
      ))}
    </div>
  );
}

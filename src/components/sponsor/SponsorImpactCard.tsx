import { sponsorCopy } from '@/config/copy/sponsor';
import { formatNGN } from '@/lib/utils';

type SponsorImpactCardProps = {
  totalDisbursedKobo: number;
  studentsHelped: number;
  activeCommitments: number;
  certificatesIssued: number;
};

export function SponsorImpactCard({
  totalDisbursedKobo,
  studentsHelped,
  activeCommitments,
  certificatesIssued,
}: SponsorImpactCardProps) {
  const copy = sponsorCopy.impact;
  const hasData = totalDisbursedKobo > 0 || studentsHelped > 0;

  if (!hasData) return null;

  const metrics = [
    { label: copy.stats.totalDisbursed, value: formatNGN(totalDisbursedKobo), mono: true },
    { label: copy.stats.studentsHelped, value: String(studentsHelped), mono: false },
    { label: copy.stats.activeCommitments, value: String(activeCommitments), mono: false },
    { label: copy.stats.certificatesIssued, value: String(certificatesIssued), mono: false },
  ];

  return (
    <div className="mt-6 rounded-xl border border-border bg-card shadow-xs">
      <div className="border-b border-border px-5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {copy.title}
        </p>
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
        {metrics.map((m, i) => (
          <div key={i} className="px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {m.label}
            </p>
            <p className={`mt-1 text-lg font-semibold tabular-nums text-foreground ${m.mono ? 'font-mono' : ''}`}>
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

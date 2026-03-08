'use client';

import { CheckCircle, ShieldWarning } from '@/components/icons';

import { adminCopy } from '@/config/copy/admin';

type RiskFlag = {
  type: string;
  userId: string;
  userEmail: string | null;
  severity: 'low' | 'medium' | 'high';
  detail: string;
  detectedAt: Date;
};

type Props = {
  flags: RiskFlag[] | null;
};

const copy = adminCopy.risk;
const fraudCopy = adminCopy.fraud;
const fraudTableCopy = adminCopy.fraud.table;

const SEVERITY_STYLES: Record<'low' | 'medium' | 'high', string> = {
  low: 'bg-primary/5 text-primary border border-primary/20',
  medium: 'bg-primary/10 text-primary border border-primary/30',
  high: 'bg-destructive/10 text-destructive border border-destructive/20',
};

const SEVERITY_DOT: Record<'low' | 'medium' | 'high', string> = {
  low: 'bg-primary/40',
  medium: 'bg-primary',
  high: 'bg-destructive',
};

const TYPE_LABEL_KEYS = [
  'repeated_kyc_failure',
  'repeated_document_rejection',
  'unverified_with_active_sponsorship',
  'ocr_high_risk',
] as const;
type TypeLabelKey = (typeof TYPE_LABEL_KEYS)[number];

function isTypeLabelKey(value: string): value is TypeLabelKey {
  return (TYPE_LABEL_KEYS as readonly string[]).includes(value);
}

function SeverityBadge({ severity }: { severity: 'low' | 'medium' | 'high' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${SEVERITY_STYLES[severity]}`}
    >
      {copy.severityLabels[severity]}
    </span>
  );
}

function FlagRow({ flag }: { flag: RiskFlag }) {
  const typeLabel = isTypeLabelKey(flag.type) ? copy.typeLabels[flag.type] : flag.type;

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`inline-block size-2 rounded-full ${SEVERITY_DOT[flag.severity]}`} />
          <span className="text-sm font-medium text-foreground">{typeLabel}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {flag.userEmail ?? flag.userId}
      </td>
      <td className="px-4 py-3">
        <SeverityBadge severity={flag.severity} />
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{flag.detail}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(flag.detectedAt).toLocaleDateString()}
      </td>
    </tr>
  );
}

/** Mobile card for flagged items */
function FlagCard({ flag }: { flag: RiskFlag }) {
  const typeLabel = isTypeLabelKey(flag.type) ? copy.typeLabels[flag.type] : flag.type;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldWarning className="size-5 text-destructive" weight="duotone" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">{typeLabel}</p>
        </div>
        <SeverityBadge severity={flag.severity} />
      </div>
      <p className="text-xs text-muted-foreground">{flag.userEmail ?? flag.userId}</p>
      <p className="text-sm text-foreground">{flag.detail}</p>
      <p className="text-xs text-muted-foreground">
        {new Date(flag.detectedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export function FraudPageClient({ flags }: Props) {
  if (flags === null) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{copy.error.description}</p>
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-16 text-center">
        <CheckCircle className="size-10 text-primary" weight="duotone" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-foreground">{fraudCopy.empty.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{fraudCopy.empty.description}</p>
        </div>
      </div>
    );
  }

  const highFlags = flags.filter((f) => f.severity === 'high');
  const mediumFlags = flags.filter((f) => f.severity === 'medium');
  const lowFlags = flags.filter((f) => f.severity === 'low');
  const sortedFlags = [...highFlags, ...mediumFlags, ...lowFlags];

  return (
    <div className="space-y-4">
      {/* Summary badges */}
      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">
          <span className="inline-block size-2 rounded-full bg-destructive" />
          {copy.severityLabels.high}: {highFlags.length}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <span className="inline-block size-2 rounded-full bg-primary" />
          {copy.severityLabels.medium}: {mediumFlags.length}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="inline-block size-2 rounded-full bg-muted-foreground/40" />
          {copy.severityLabels.low}: {lowFlags.length}
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {fraudTableCopy.flag}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {fraudTableCopy.user}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {fraudTableCopy.severity}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {fraudTableCopy.detail}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {fraudTableCopy.detected}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedFlags.map((flag) => (
              <FlagRow key={`${flag.userId}-${flag.type}`} flag={flag} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul role="list" className="grid gap-4 md:hidden">
        {sortedFlags.map((flag) => (
          <li key={`${flag.userId}-${flag.type}`}>
            <FlagCard flag={flag} />
          </li>
        ))}
      </ul>
    </div>
  );
}

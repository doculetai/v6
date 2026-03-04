'use client';

import { CheckCircle } from 'lucide-react';

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
  copy: typeof adminCopy.risk;
};

const SEVERITY_STYLES: Record<'low' | 'medium' | 'high', string> = {
  low: 'bg-primary/5 text-primary border border-primary/20',
  medium: 'bg-primary/10 text-primary border border-primary/30',
  high: 'bg-destructive/10 text-destructive border border-destructive/20',
};

const TYPE_LABEL_KEYS = [
  'repeated_kyc_failure',
  'repeated_document_rejection',
  'unverified_with_active_sponsorship',
] as const;
type TypeLabelKey = typeof TYPE_LABEL_KEYS[number];

function isTypeLabelKey(value: string): value is TypeLabelKey {
  return (TYPE_LABEL_KEYS as readonly string[]).includes(value);
}

function FlagCard({ flag, copy }: { flag: RiskFlag; copy: typeof adminCopy.risk }) {
  const typeLabel = isTypeLabelKey(flag.type) ? copy.typeLabels[flag.type] : flag.type;
  const severityLabel = copy.severityLabels[flag.severity];
  const severityStyle = SEVERITY_STYLES[flag.severity];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{typeLabel}</p>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${severityStyle}`}>
          {severityLabel}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{flag.userEmail ?? flag.userId}</p>
      <p className="text-sm text-foreground">{flag.detail}</p>
      <p className="text-xs text-muted-foreground">
        {new Date(flag.detectedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export function RiskPageClient({ flags, copy }: Props) {
  if (flags === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.error.description}</p>
        </div>
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-16 text-center">
          <CheckCircle className="size-10 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">{copy.empty.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{copy.empty.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>
      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flags.map((flag) => (
          <li key={`${flag.userId}-${flag.type}`}>
            <FlagCard flag={flag} copy={copy} />
          </li>
        ))}
      </ul>
    </div>
  );
}

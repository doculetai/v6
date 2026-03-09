'use client';

import { CheckCircle, Warning } from '@/components/icons';
import { Grid } from '@/components/layout/content-primitives';
import { cn } from '@/lib/utils';

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

const SEVERITY_BADGE_STYLES: Record<'low' | 'medium' | 'high', string> = {
  low: 'bg-muted text-muted-foreground border border-border',
  medium: 'bg-warning/10 text-warning border border-warning/20',
  high: 'bg-destructive/10 text-destructive border border-destructive/20',
};

/** Card border accent for high-severity flags */
const CARD_BORDER_STYLES: Record<'low' | 'medium' | 'high', string> = {
  low: 'border-border',
  medium: 'border-warning/40',
  high: 'border-destructive/50',
};

const SEVERITY_ORDER: Record<'low' | 'medium' | 'high', number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const TYPE_LABEL_KEYS = [
  'repeated_kyc_failure',
  'repeated_document_rejection',
  'unverified_with_active_sponsorship',
  'ocr_high_risk',
  'duplicate_kyc_reference',
  'ghost_students',
  'rapid_sponsor_switching',
] as const;
type TypeLabelKey = typeof TYPE_LABEL_KEYS[number];

function isTypeLabelKey(value: string): value is TypeLabelKey {
  return (TYPE_LABEL_KEYS as readonly string[]).includes(value);
}

function FlagCard({ flag, copy }: { flag: RiskFlag; copy: typeof adminCopy.risk }) {
  const typeLabel = isTypeLabelKey(flag.type) ? copy.typeLabels[flag.type] : flag.type;
  const severityLabel = copy.severityLabels[flag.severity];
  const badgeStyle = SEVERITY_BADGE_STYLES[flag.severity];
  const cardBorderStyle = CARD_BORDER_STYLES[flag.severity];
  const isHigh = flag.severity === 'high';

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-5 space-y-3',
        cardBorderStyle,
        isHigh && 'shadow-sm',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {isHigh && (
            <Warning
              size={16}
              weight="duotone"
              className="shrink-0 text-destructive"
              aria-hidden="true"
            />
          )}
          <p className="text-sm font-semibold text-foreground truncate">{typeLabel}</p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            badgeStyle,
          )}
        >
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
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{copy.error.description}</p>
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-16 text-center">
        <CheckCircle weight="duotone" className="size-8 text-success" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-foreground">{copy.empty.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.empty.description}</p>
        </div>
      </div>
    );
  }

  const sorted = [...flags].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  return (
    <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="md">
      {sorted.map((flag) => (
        <FlagCard key={`${flag.userId}-${flag.type}`} flag={flag} copy={copy} />
      ))}
    </Grid>
  );
}

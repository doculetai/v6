import { AlertCircle, CheckCircle2, Clock3, LoaderCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

import type { DisbursementStatus } from './disbursement-types';

type DisbursementStatusBadgeProps = {
  status: DisbursementStatus;
  className?: string;
};

const styleByStatus: Record<DisbursementStatus, string> = {
  pending:
    'bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground dark:border-border',
  processing:
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
  completed:
    'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900',
  failed:
    'bg-destructive/10 text-destructive border-destructive/30 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/40',
};

function iconByStatus(status: DisbursementStatus) {
  if (status === 'pending') {
    return <Clock3 className="size-4" aria-hidden="true" />;
  }
  if (status === 'processing') {
    return <LoaderCircle className="size-4" aria-hidden="true" />;
  }
  if (status === 'completed') {
    return <CheckCircle2 className="size-4" aria-hidden="true" />;
  }
  return <AlertCircle className="size-4" aria-hidden="true" />;
}

export function DisbursementStatusBadge({ status, className }: DisbursementStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('h-7 gap-1.5 rounded-full px-2.5 text-xs', styleByStatus[status], className)}
    >
      {iconByStatus(status)}
      {sponsorCopy.disbursements.statusLabels[status]}
    </Badge>
  );
}

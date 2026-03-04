import { AlertTriangle, CheckCircle2, Clock3, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { StudentCopy } from '@/config/copy/student';
import type { StudentDocumentStatus } from '@/lib/documents';
import { cn } from '@/lib/utils';

type DocumentStatusCopy = StudentCopy['documents']['status'];

type StudentDocumentStatusBadgeProps = {
  status: StudentDocumentStatus;
  statusCopy: DocumentStatusCopy;
};

const statusToCopyKey = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  more_info_requested: 'moreInfoRequested',
} as const;

const statusStyles: Record<StudentDocumentStatus, string> = {
  pending: 'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground',
  approved: 'bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary',
  rejected: 'bg-destructive/15 text-destructive dark:bg-destructive/20 dark:text-destructive',
  more_info_requested:
    'bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground',
};

const statusIcons = {
  pending: Clock3,
  approved: CheckCircle2,
  rejected: XCircle,
  more_info_requested: AlertTriangle,
} as const;

export function StudentDocumentStatusBadge({
  status,
  statusCopy,
}: StudentDocumentStatusBadgeProps) {
  const Icon = statusIcons[status];

  return (
    <Badge variant="outline" className={cn('gap-1.5 border-transparent text-xs', statusStyles[status])}>
      <Icon className="size-4" aria-hidden="true" />
      <span>{statusCopy[statusToCopyKey[status]]}</span>
    </Badge>
  );
}

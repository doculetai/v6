import { StatusBadge } from '@/components/ui/status-badge';
import type { StatusBadgeSize } from '@/components/ui/status-badge';
import { agentCopy } from '@/config/copy/agent';

type CommissionStatus = 'pending' | 'processing' | 'paid';

interface CommissionStatusBadgeProps {
  status: CommissionStatus;
  size?: StatusBadgeSize;
  className?: string;
}

const STATUS_MAP: Record<CommissionStatus, 'pending' | 'attention' | 'verified'> = {
  pending: 'pending',
  processing: 'attention',
  paid: 'verified',
};

function CommissionStatusBadge({ status, size = 'sm', className }: CommissionStatusBadgeProps) {
  return (
    <StatusBadge
      status={STATUS_MAP[status]}
      label={agentCopy.commissions.statusLabels[status]}
      size={size}
      className={className}
    />
  );
}

export { CommissionStatusBadge };
export type { CommissionStatusBadgeProps, CommissionStatus };

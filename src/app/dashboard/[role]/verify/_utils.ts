import type { RouterOutputs } from '@/trpc/client';

type TierStatus = RouterOutputs['student']['getVerificationStatus']['tiers'][number]['status'];

export function getBadgeVariant(
  status: TierStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'verified') return 'default';
  if (status === 'pending') return 'secondary';
  if (status === 'failed') return 'destructive';
  return 'outline';
}

export function formatDate(value: Date | null): string {
  if (!value) return 'N/A';

  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

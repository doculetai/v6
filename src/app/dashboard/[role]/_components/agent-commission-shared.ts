// Shared types and utilities used by commissions and activity pages.

export type AgentCommission = {
  id: string;
  amountKobo: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'cancelled';
  description: string | null;
  paidAt: Date | null;
  createdAt: Date;
};

export const statusBadgeClass: Record<AgentCommission['status'], string> = {
  paid: 'bg-primary/10 text-primary',
  processing: 'bg-warning/10 text-warning',
  pending: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

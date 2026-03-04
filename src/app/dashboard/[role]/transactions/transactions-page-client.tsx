'use client';

import { EmptyState } from '@/components/ui/empty-state';
import type { sponsorCopy } from '@/config/copy/sponsor';
import { formatNGN } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type Transaction = {
  id: string;
  sponsorshipId: string;
  studentEmail: string | null;
  amountKobo: number;
  currency: string;
  scheduledAt: Date;
  disbursedAt: Date | null;
  status: 'scheduled' | 'processing' | 'disbursed' | 'failed';
  paystackReference: string | null;
};

type Copy = typeof sponsorCopy.transactions;

type TransactionsPageClientProps = {
  transactions: Transaction[];
  copy: Copy;
};

// ── Main component ────────────────────────────────────────────────────────────

export function TransactionsPageClient({ transactions, copy }: TransactionsPageClientProps) {
  if (transactions.length === 0) {
    return <EmptyState heading={copy.empty.title} body={copy.empty.description} />;
  }

  const totalKobo = transactions.reduce((sum, t) => sum + t.amountKobo, 0);

  return (
    <div className="space-y-4">
      {/* Summary stat */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">{copy.summary.totalDisbursed}</p>
          <p className="text-lg font-semibold text-foreground">{formatNGN(totalKobo)}</p>
        </div>
        <div className="h-8 w-px bg-border" aria-hidden="true" />
        <div>
          <p className="text-xs text-muted-foreground">Count</p>
          <p className="text-lg font-semibold text-foreground">
            {copy.summary.count(transactions.length)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.student}
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                {copy.table.amount}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.disbursedAt}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.reference}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((t) => (
              <tr key={t.id} className="bg-card transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 text-foreground">
                  {t.studentEmail ?? <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 text-right font-mono text-foreground">
                  {formatNGN(t.amountKobo)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {t.disbursedAt
                    ? new Date(t.disbursedAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : <span className="text-muted-foreground/60">—</span>}
                </td>
                <td className="px-4 py-3">
                  {t.paystackReference ? (
                    <span className="font-mono text-xs text-muted-foreground">
                      {t.paystackReference}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

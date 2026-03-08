'use client';

import { Container, PageHeader, Stack } from '@/components/layout/content-primitives';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { useFilterParams } from '@/lib/hooks/useFilterParams';
import { formatNGN } from '@/lib/utils';
import { trpc } from '@/trpc/client';

type Transaction = {
  id: string;
  type: string;
  entityType: string;
  entityId: string | null;
  amountKobo: number;
  currency: string;
  userId: string | null;
  meta: string | null;
  createdAt: Date;
};

type LedgerCopy = {
  title: string;
  subtitle: string;
  table: { type: string; entity: string; amount: string; currency: string; date: string };
  filters: { type: string; typeAll: string; dateFrom: string; dateTo: string };
  types: Record<string, string>;
  empty: { title: string; description: string };
};

type Props = {
  initialTransactions: Transaction[];
  copy: LedgerCopy;
  routerPath?: 'admin' | 'partner';
};

const TYPE_OPTION_VALUES = ['all', 'disbursement', 'platform_fee', 'refund', 'reversal', 'credit', 'debit'] as const;

type TypeFilterValue = (typeof TYPE_OPTION_VALUES)[number];

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(kobo: number, currency: string): string {
  if (currency === 'NGN') return formatNGN(kobo);
  return `${(kobo / 100).toLocaleString()} ${currency}`;
}

function typeLabel(type: string, copy: LedgerCopy): string {
  return copy.types[type] ?? type;
}

function useTransactionsQuery(
  routerPath: 'admin' | 'partner',
  input: {
    type?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit: number;
  },
  initialData: Transaction[],
) {
  const adminQuery = trpc.admin.listTransactions.useQuery(
    {
      type: input.type as 'disbursement' | 'platform_fee' | 'refund' | 'reversal' | 'credit' | 'debit' | undefined,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      limit: input.limit,
    },
    { initialData, enabled: routerPath === 'admin' },
  );

  const partnerQuery = trpc.partner.listTransactions.useQuery(
    {
      type: input.type as 'disbursement' | 'platform_fee' | 'refund' | 'reversal' | 'credit' | 'debit' | undefined,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      limit: input.limit,
    },
    { initialData, enabled: routerPath === 'partner' },
  );

  return routerPath === 'admin' ? adminQuery : partnerQuery;
}

export function LedgerPageClient({ initialTransactions, copy, routerPath = 'admin' }: Props) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const { filters, setFilter } = useFilterParams(['type', 'dateFrom', 'dateTo'] as const);
  const typeFilter = (filters.type ?? 'all') as TypeFilterValue;
  const dateFrom = filters.dateFrom ?? '';
  const dateTo = filters.dateTo ?? '';

  const { data: transactions = initialTransactions, isLoading } = useTransactionsQuery(
    routerPath,
    {
      type: typeFilter === 'all' ? undefined : typeFilter,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      limit: 50,
    },
    initialTransactions,
  );

  return (
    <Container width="lg">
      <Stack gap="md">
        <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
          <div className="grid w-40 gap-2">
            <Label htmlFor="filter-type">{copy.filters.type}</Label>
            <Select
              value={typeFilter}
              onValueChange={(v) => setFilter('type', v === 'all' ? null : v)}
            >
              <SelectTrigger id="filter-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{copy.filters.typeAll}</SelectItem>
                {TYPE_OPTION_VALUES.filter((v) => v !== 'all').map((v) => (
                  <SelectItem key={v} value={v}>
                    {copy.types[v] ?? v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-40 gap-2">
            <Label htmlFor="filter-from">{copy.filters.dateFrom}</Label>
            <Input
              id="filter-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setFilter('dateFrom', e.target.value || null)}
            />
          </div>
          <div className="grid w-40 gap-2">
            <Label htmlFor="filter-to">{copy.filters.dateTo}</Label>
            <Input
              id="filter-to"
              type="date"
              value={dateTo}
              onChange={(e) => setFilter('dateTo', e.target.value || null)}
            />
          </div>
        </div>

        {transactions.length === 0 ? (
          <EmptyState heading={copy.empty.title} body={copy.empty.description} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
              <table className="w-full min-w-140 text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {copy.table.type}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {copy.table.entity}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      {copy.table.amount}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {copy.table.currency}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {copy.table.date}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((t) => (
                    <tr
                      key={t.id}
                      className="bg-card transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {typeLabel(t.type, copy)}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                        {t.entityType}
                        {t.entityId ? `/${t.entityId.slice(0, 8)}...` : ''}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {formatAmount(t.amountKobo, t.currency)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {t.currency}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(t.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul role="list" className="space-y-3 md:hidden">
              {transactions.map((t) => (
                <li key={t.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {typeLabel(t.type, copy)}
                    </span>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {formatAmount(t.amountKobo, t.currency)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-mono">
                      {t.entityType}
                      {t.entityId ? `/${t.entityId.slice(0, 8)}...` : ''}
                    </span>
                    <span>{t.currency}</span>
                    <span>{formatDate(t.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {isLoading && (
          <p className="text-sm text-muted-foreground">{copy.empty.title}&hellip;</p>
        )}
      </Stack>
    </Container>
  );
}

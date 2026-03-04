import Link from 'next/link';

import type { DataTableColumn } from '@/components/ui/data-table-shell';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { MoneyValue } from '@/components/ui/money-value';
import { StatusBadge } from '@/components/ui/status-badge';

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <Link href={`#${id}`} className="text-sm text-muted-foreground hover:text-foreground">
          #
        </Link>
      </div>
      {children}
    </section>
  );
}

export function Code({ children }: { children: string }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  );
}

type DemoRow = { id: string; name: string; school: string; status: string; amount: number };

const DEMO_COLUMNS: ReadonlyArray<DataTableColumn<DemoRow>> = [
  { key: 'name', header: 'Name' },
  { key: 'school', header: 'School' },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge status={row.status as 'verified' | 'pending'} />,
  },
  {
    key: 'amount',
    header: 'Amount',
    cell: (row) => <MoneyValue amountMinor={row.amount} />,
  },
];

const DEMO_ROWS: DemoRow[] = [
  { id: '1', name: 'Kemi Adesanya', school: 'University of Lagos', status: 'verified', amount: 1500000 },
  { id: '2', name: 'Emeka Obi', school: 'Covenant University', status: 'pending', amount: 750000 },
  { id: '3', name: 'Amara Nwosu', school: 'Ahmadu Bello University', status: 'verified', amount: 2000000 },
];

export function DataTableShellDemo() {
  return <DataTableShell columns={DEMO_COLUMNS} rows={DEMO_ROWS} />;
}

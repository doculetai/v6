import { DataTableShell, type DataTableColumn } from '@/components/ui/data-table-shell';
import { partnerCopy } from '@/config/copy/partner';

interface UsageRow {
  id: string;
  endpoint: string;
  calls: number;
  successRate: string;
  avgLatency: string;
}

interface ApiUsageTableProps {
  rows: UsageRow[];
}

const tableCopy = partnerCopy.dashboard.usage;

const columns: ReadonlyArray<DataTableColumn<UsageRow>> = [
  { key: 'endpoint', header: tableCopy.table.endpoint },
  { key: 'calls', header: tableCopy.table.calls, className: 'tabular-nums' },
  { key: 'successRate', header: tableCopy.table.successRate },
  { key: 'avgLatency', header: tableCopy.table.avgLatency },
];

export function ApiUsageTable({ rows }: ApiUsageTableProps) {
  return (
    <DataTableShell
      columns={columns}
      rows={rows}
      emptyLabel={tableCopy.empty.title}
    />
  );
}

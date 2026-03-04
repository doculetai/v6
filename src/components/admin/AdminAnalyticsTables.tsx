import { cn } from '@/lib/utils';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { adminCopy } from '@/config/copy/admin';

import type { BreakdownItem, TopUniversity } from '@/db/queries/admin-analytics';

const copy = adminCopy.analytics;

// ── Top Universities ────────────────────────────────────────────────────────

interface AdminTopUniversitiesProps {
  universities: TopUniversity[];
  className?: string;
}

const universityColumns = [
  {
    key: 'name' as const,
    header: copy.topUniversities.table.university,
  },
  {
    key: 'studentCount' as const,
    header: copy.topUniversities.table.students,
    className: 'text-right',
    cell: (row: TopUniversity) => (
      <span className="tabular-nums">{row.studentCount.toLocaleString('en-NG')}</span>
    ),
  },
];

export function AdminTopUniversities({ universities, className }: AdminTopUniversitiesProps) {
  return (
    <div className={cn('rounded-xl border bg-card', className)}>
      <div className="border-b border-border px-5 py-3">
        <p className="text-sm font-medium text-foreground">{copy.topUniversities.title}</p>
      </div>
      {universities.length > 0 ? (
        <DataTableShell columns={universityColumns} rows={universities} />
      ) : (
        <EmptyState
          heading={copy.topUniversities.empty.title}
          body={copy.topUniversities.empty.description}
          className="py-8"
        />
      )}
    </div>
  );
}

// ── Breakdown List ──────────────────────────────────────────────────────────

interface BreakdownListProps {
  title: string;
  items: BreakdownItem[];
  labelMap: Record<string, string>;
  empty: { title: string; description: string };
  className?: string;
}

export function BreakdownList({ title, items, labelMap, empty, className }: BreakdownListProps) {
  const labeled = items.map((item) => ({
    ...item,
    label: labelMap[item.key] ?? item.key,
  }));

  return (
    <div className={cn('rounded-xl border bg-card', className)}>
      <div className="border-b border-border px-5 py-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <div className="p-5">
        {labeled.length > 0 ? (
          <ul className="space-y-3">
            {labeled.map((item) => (
              <li key={item.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {item.count.toLocaleString('en-NG')}
                    <span className="ml-1 text-xs">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${item.percentage}%` }}
                    aria-hidden="true"
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState heading={empty.title} body={empty.description} className="py-4" />
        )}
      </div>
    </div>
  );
}

import * as React from 'react';

import { cn } from '@/lib/utils';

type BadgeType = 'amber' | 'green' | 'red' | 'blue' | 'muted';

interface DataTableRow {
  cells: string[];
  badgeType?: BadgeType;
}

interface DataTableProps {
  columns: string[];
  rows: DataTableRow[];
  /** Column indices (0-based) to render in monospace font. */
  monoCols?: number[];
  /** Column indices (0-based) to render in muted colour. */
  mutedCols?: number[];
  className?: string;
}

const badgeClasses: Record<BadgeType, string> = {
  amber: 'bg-warning/10 text-warning',
  green: 'bg-success/10 text-success',
  red: 'bg-destructive/10 text-destructive',
  blue: 'bg-primary/10 text-primary',
  muted: 'bg-muted text-muted-foreground',
};

function DataTable({ columns, rows, monoCols = [], mutedCols = [], className }: DataTableProps) {
  const monoSet = new Set(monoCols);
  const mutedSet = new Set(mutedCols);

  return (
    <div className={cn('overflow-hidden', className)}>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-5 py-3 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row, ri) => (
              <tr key={ri} className="transition-colors hover:bg-muted/20">
                {row.cells.map((cell, ci) => {
                  const isLast = ci === row.cells.length - 1;
                  const hasBadge = isLast && row.badgeType;

                  return (
                    <td
                      key={ci}
                      className={cn(
                        'px-5 py-3',
                        monoSet.has(ci) && 'font-mono',
                        mutedSet.has(ci) && 'text-muted-foreground',
                        !mutedSet.has(ci) && !hasBadge && 'text-foreground',
                      )}
                    >
                      {hasBadge ? (
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            badgeClasses[row.badgeType!],
                          )}
                        >
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row, ri) => (
          <article key={ri} className="rounded-lg border border-border/60 p-3">
            {row.cells.map((cell, ci) => {
              const isLast = ci === row.cells.length - 1;
              const hasBadge = isLast && row.badgeType;

              return (
                <div key={ci} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {columns[ci]}
                  </span>
                  {hasBadge ? (
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        badgeClasses[row.badgeType!],
                      )}
                    >
                      {cell}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'text-sm',
                        monoSet.has(ci) && 'font-mono',
                        mutedSet.has(ci) ? 'text-muted-foreground' : 'text-foreground',
                      )}
                    >
                      {cell}
                    </span>
                  )}
                </div>
              );
            })}
          </article>
        ))}
      </div>
    </div>
  );
}

export { DataTable };
export type { DataTableProps, DataTableRow, BadgeType };

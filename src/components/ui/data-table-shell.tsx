import * as React from "react"

import { cn } from "@/lib/utils"

type DataTableColumn<Row> = {
  key: keyof Row & string
  header: string
  className?: string
  cell?: (row: Row) => React.ReactNode
}

interface DataTableShellProps<Row extends { id: string }> {
  columns: ReadonlyArray<DataTableColumn<Row>>
  rows: ReadonlyArray<Row>
  loading?: boolean
  emptyLabel?: string
  className?: string
}

function DataTableShell<Row extends { id: string }>({
  columns,
  rows,
  loading = false,
  emptyLabel = "No records found.",
  className,
}: DataTableShellProps<Row>) {
  if (loading) {
    return (
      <div
        className={cn("rounded-xl border bg-card p-4", className)}
        data-testid="data-table-shell-loading"
      >
        <div className="h-8 animate-pulse rounded bg-muted/60" />
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className={cn("rounded-xl border bg-card p-6 text-sm text-muted-foreground", className)}>
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>
      {/* Desktop: table view */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("px-4 py-3 font-medium", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border/60">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3", column.className)}>
                    {column.cell ? column.cell(row) : (row[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked card view */}
      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row) => (
          <article key={row.id} className="rounded-lg border border-border/60 p-3">
            {columns.map((column) => (
              <div key={column.key} className="flex items-center justify-between gap-3 py-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {column.header}
                </span>
                <span className="text-sm text-foreground">
                  {column.cell ? column.cell(row) : (row[column.key] as React.ReactNode)}
                </span>
              </div>
            ))}
          </article>
        ))}
      </div>
    </div>
  )
}

export { DataTableShell }
export type { DataTableShellProps, DataTableColumn }

"use client"

import { useMemo, useState } from "react"
import { Download } from "lucide-react"

import { universityCopy } from "@/config/copy/university"
import type { PipelineRow, PipelineStats } from "@/db/queries/university-pipeline"
import type { StatusBadgeStatus } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import type { DataTableColumn } from "@/components/ui/data-table-shell"
import { DataTableShell } from "@/components/ui/data-table-shell"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterBar } from "@/components/ui/filter-bar"
import { MetricCard } from "@/components/ui/metric-card"
import { MoneyValue } from "@/components/ui/money-value"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { TimestampLabel } from "@/components/ui/timestamp-label"
import { UniversityPipelineReviewDialog } from "@/components/university/UniversityPipelineReviewDialog"
import { UniversityPipelineTierBadge } from "@/components/university/UniversityPipelineTierBadge"

type FilterChipKey = "all" | "pending" | "approved" | "rejected" | "more_info_requested"

const STATUS_TO_BADGE: Record<
  PipelineRow["documentStatus"],
  { status: StatusBadgeStatus; label: string }
> = {
  pending: {
    status: "pending",
    label: universityCopy.pipeline.statusLabels.submitted,
  },
  approved: {
    status: "verified",
    label: universityCopy.pipeline.statusLabels.approved,
  },
  rejected: {
    status: "rejected",
    label: universityCopy.pipeline.statusLabels.rejected,
  },
  more_info_requested: {
    status: "attention",
    label: universityCopy.pipeline.statusLabels.moreInfoRequested,
  },
}

interface PipelinePageClientProps {
  initialRows: PipelineRow[]
  initialStats: PipelineStats
}

function PipelinePageClient({ initialRows, initialStats }: PipelinePageClientProps) {
  const [query, setQuery] = useState("")
  const [activeChip, setActiveChip] = useState<FilterChipKey>("all")
  const [reviewingRow, setReviewingRow] = useState<PipelineRow | null>(null)

  const counts = useMemo(
    () => ({
      all: initialRows.length,
      pending: initialRows.filter((r) => r.documentStatus === "pending").length,
      approved: initialRows.filter((r) => r.documentStatus === "approved").length,
      rejected: initialRows.filter((r) => r.documentStatus === "rejected").length,
      more_info_requested: initialRows.filter((r) => r.documentStatus === "more_info_requested")
        .length,
    }),
    [initialRows],
  )

  const filteredRows = useMemo(() => {
    let rows = initialRows

    if (activeChip !== "all") {
      rows = rows.filter((r) => r.documentStatus === activeChip)
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.studentEmail.toLowerCase().includes(q) ||
          (r.program?.toLowerCase().includes(q) ?? false) ||
          (r.schoolName?.toLowerCase().includes(q) ?? false),
      )
    }

    return rows
  }, [initialRows, activeChip, query])

  const chips = [
    { key: "all", label: universityCopy.pipeline.allFilter, count: counts.all },
    {
      key: "pending",
      label: universityCopy.pipeline.statusLabels.submitted,
      count: counts.pending,
    },
    {
      key: "approved",
      label: universityCopy.pipeline.statusLabels.approved,
      count: counts.approved,
    },
    {
      key: "rejected",
      label: universityCopy.pipeline.statusLabels.rejected,
      count: counts.rejected,
    },
    {
      key: "more_info_requested",
      label: universityCopy.pipeline.statusLabels.moreInfoRequested,
      count: counts.more_info_requested,
    },
  ]

  const columns: ReadonlyArray<DataTableColumn<PipelineRow>> = [
    {
      key: "studentEmail",
      header: universityCopy.pipeline.table.applicant,
      cell: (row) => (
        <span className="text-sm font-medium text-foreground">{row.studentEmail}</span>
      ),
    },
    {
      key: "program",
      header: universityCopy.pipeline.table.program,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.program ?? "—"}</span>
      ),
    },
    {
      key: "amountKobo",
      header: universityCopy.pipeline.table.amount,
      cell: (row) =>
        row.amountKobo > 0 ? <MoneyValue amountMinor={row.amountKobo} display="compact" /> : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      key: "kycTier",
      header: universityCopy.pipeline.table.tier,
      cell: (row) => <UniversityPipelineTierBadge tier={row.kycTier} />,
    },
    {
      key: "documentStatus",
      header: universityCopy.pipeline.table.status,
      cell: (row) => {
        const badge = STATUS_TO_BADGE[row.documentStatus]
        return <StatusBadge status={badge.status} label={badge.label} size="sm" />
      },
    },
    {
      key: "daysWaiting",
      header: universityCopy.pipeline.table.daysWaiting,
      cell: (row) => (
        <span className="text-sm tabular-nums text-muted-foreground">{row.daysWaiting}d</span>
      ),
    },
    {
      key: "submittedAt",
      header: universityCopy.pipeline.table.submitted,
      cell: (row) => <TimestampLabel value={row.submittedAt} mode="relative" />,
    },
    {
      key: "id",
      header: universityCopy.pipeline.table.action,
      className: "text-right",
      cell: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setReviewingRow(row)}
          className="min-h-11"
        >
          {universityCopy.pipeline.actions.review}
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={universityCopy.pipeline.title}
        subtitle={universityCopy.pipeline.subtitle}
        actions={
          <Button size="sm" variant="outline">
            <Download className="mr-2 size-4" aria-hidden="true" />
            {universityCopy.pipeline.actions.exportCsv}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={universityCopy.pipeline.stats.total}
          value={initialStats.total}
        />
        <MetricCard
          label={universityCopy.pipeline.stats.pendingReview}
          value={initialStats.pending}
        />
        <MetricCard
          label={universityCopy.pipeline.stats.approvedThisWeek}
          value={initialStats.approvedThisWeek}
        />
        <MetricCard
          label={universityCopy.pipeline.stats.averageProcessingTime}
          value={`${initialStats.avgDaysWaiting}d`}
        />
      </div>

      <FilterBar
        query={query}
        queryPlaceholder={universityCopy.pipeline.filters.search}
        chips={chips}
        activeChip={activeChip}
        onQueryChange={setQuery}
        onChipChange={(key) => setActiveChip(key as FilterChipKey)}
        actions={
          <Button size="sm" variant="outline">
            {universityCopy.pipeline.actions.bulkApprove}
          </Button>
        }
      />

      {filteredRows.length === 0 ? (
        <EmptyState
          heading={universityCopy.pipeline.empty.title}
          body={universityCopy.pipeline.empty.description}
        />
      ) : (
        <DataTableShell columns={columns} rows={filteredRows} />
      )}

      {reviewingRow ? (
        <UniversityPipelineReviewDialog
          row={reviewingRow}
          open={true}
          onClose={() => setReviewingRow(null)}
        />
      ) : null}
    </div>
  )
}

export { PipelinePageClient }
export type { PipelinePageClientProps }
